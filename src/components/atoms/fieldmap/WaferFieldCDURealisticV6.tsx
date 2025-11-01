import React from 'react'

/**
 * WaferFieldCDU_V6
 * - waferRadius = 150 mm
 * - field (shot) = 20 x 30 mm
 * - die array = 2 x 3
 * 개선:
 * 1) field 그릴지 여부: "필드 내 어떤 die의 중심이 wafer 내부에 있으면" 필드 그려짐.
 * 2) die 그릴지 여부: die의 네 꼭짓점이 모두 wafer 안에 들어와야 그림 (그렇지 않으면 빈 공간)
 * 3) merge 그룹은 bounding rect로 합쳐서 그려 경계선 제거 (시각적 merge)
 * 4) text: 각 die(또는 merge-bbox)의 중앙에 vertical+horizontal center 정렬로 배치
 */
const WaferFieldCDU_V6: React.FC = () => {
  // Parameters
  const waferRadius = 150 // mm
  const fieldWidth = 20 // mm
  const fieldHeight = 30 // mm
  const dieCols = 2
  const dieRows = 3

  const svgWidthPx = 900 // px viewport width (you can change)
  const marginRatio = 0.06 // wafer drawing margin portion

  // scale: mm -> px
  const waferDiameterPx = svgWidthPx * (1 - marginRatio * 2)
  const scale = waferDiameterPx / (waferRadius * 2)
  const waferRadiusPx = waferRadius * scale

  // derived sizes (mm -> px when drawing)
  const dieWidth = fieldWidth / dieCols
  const dieHeight = fieldHeight / dieRows
  const fieldStepX = fieldWidth
  const fieldStepY = fieldHeight

  // color map
  function cduToColor(v: number | null) {
    if (v == null) return 'transparent'
    const t = (v + 1) / 2 // -1..1 -> 0..1
    const r = Math.floor(255 * t)
    const g = Math.floor(255 * (1 - Math.abs(t - 0.5) * 2))
    const b = Math.floor(255 * (1 - t))
    return `rgb(${r},${g},${b})`
  }

  // fake realistic CDU generator (mm coords)
  function generateCDU(x: number, y: number) {
    const r = Math.hypot(x, y)
    const a = Math.atan2(y, x)
    const radial = Math.cos((r / waferRadius) * Math.PI) * 0.55
    const angular = Math.sin(a * 3) * 0.28
    const noise = (Math.random() - 0.5) * 0.12
    return radial + angular + noise
  }

  // grid range
  const range = Math.ceil(waferRadius / Math.min(fieldStepX, fieldStepY)) + 1

  // accumulate fields
  type Die = { x: number; y: number; cdu: number | null; mergeGroup?: number | null }
  type Field = { cx: number; cy: number; dies: Die[] }

  const fields: Field[] = []

  // generate fields based on die centers presence (improved inclusion logic)
  for (let fy = -range; fy <= range; fy++) {
    for (let fx = -range; fx <= range; fx++) {
      const cx = fx * fieldStepX
      const cy = fy * fieldStepY

      // produce die centers for this field (in mm)
      const dies: Die[] = []
      for (let j = 0; j < dieRows; j++) {
        for (let i = 0; i < dieCols; i++) {
          const dx = cx - fieldWidth / 2 + (i + 0.5) * dieWidth
          const dy = cy - fieldHeight / 2 + (j + 0.5) * dieHeight

          // die center distance
          const centerDist = Math.hypot(dx, dy)

          // determine if die would be "eligible" (center inside wafer)
          // we will later check full-corner inside to draw die; but for deciding to draw field,
          // we include the field if at least one die center is inside waferRadius (so fields with partial die inside are shown)
          const centerInside = centerDist <= waferRadius + 1e-9

          // simulate presence of CDU reading sometimes missing (null)
          const hasCdu = Math.random() > 0.1
          const cdu = hasCdu ? generateCDU(dx, dy) : null

          dies.push({ x: dx, y: dy, cdu, mergeGroup: null })
        }
      }

      // decide to include field in drawing: if ANY die center is inside wafer radius
      const anyDieCenterInside = dies.some((d) => Math.hypot(d.x, d.y) <= waferRadius)

      if (!anyDieCenterInside) {
        // skip drawing this field entirely (it's fully outside)
        continue
      }

      // For each die, determine if its full rectangle is inside wafer.
      // If not fully inside, we mark as excluded by setting cdu = null (visual empty)
      for (const d of dies) {
        const halfW = dieWidth / 2
        const halfH = dieHeight / 2
        const corners = [
          [d.x - halfW, d.y - halfH],
          [d.x + halfW, d.y - halfH],
          [d.x - halfW, d.y + halfH],
          [d.x + halfW, d.y + halfH],
        ]
        const allCornersInside = corners.every(([cx_, cy_]) => Math.hypot(cx_, cy_) <= waferRadius + 1e-9)
        if (!allCornersInside) {
          // mark as absent => render transparent gap
          d.cdu = null
        }
      }

      fields.push({ cx, cy, dies })
    }
  }

  // Merge grouping: adjacency + similar cdu
  // We'll assign mergeGroup ids where adjacent dies (sharing an edge) within same field
  // have non-null cdu and small difference (< threshold).
  const mergeThreshold = 0.05
  let mergeId = 1
  for (const f of fields) {
    const dies = f.dies
    const n = dies.length
    // simple adjacency: dies on same field form a grid dieRows x dieCols in insertion order
    // map index = j*dieCols + i
    for (let idx = 0; idx < n; idx++) {
      const a = dies[idx]
      if (a.cdu == null) continue
      // try right neighbor and down neighbor
      const j = Math.floor(idx / dieCols)
      const i = idx % dieCols
      // right neighbor index
      if (i + 1 < dieCols) {
        const rIdx = idx + 1
        const b = dies[rIdx]
        if (b && b.cdu != null && Math.abs((a.cdu ?? 0) - (b.cdu ?? 0)) < mergeThreshold) {
          // unify group ids
          if (!a.mergeGroup && !b.mergeGroup) {
            a.mergeGroup = b.mergeGroup = mergeId++
          } else if (a.mergeGroup && !b.mergeGroup) {
            b.mergeGroup = a.mergeGroup
          } else if (!a.mergeGroup && b.mergeGroup) {
            a.mergeGroup = b.mergeGroup
          } else {
            // both have groups: unify smaller into larger (not needed for small grids)
            if (a.mergeGroup !== b.mergeGroup) {
              const old = b.mergeGroup
              const neu = a.mergeGroup
              dies.forEach((z) => {
                if (z.mergeGroup === old) z.mergeGroup = neu
              })
            }
          }
        }
      }
      // down neighbor
      if (j + 1 < dieRows) {
        const dIdx = idx + dieCols
        const b = dies[dIdx]
        if (b && b.cdu != null && Math.abs((a.cdu ?? 0) - (b.cdu ?? 0)) < mergeThreshold) {
          if (!a.mergeGroup && !b.mergeGroup) {
            a.mergeGroup = b.mergeGroup = mergeId++
          } else if (a.mergeGroup && !b.mergeGroup) {
            b.mergeGroup = a.mergeGroup
          } else if (!a.mergeGroup && b.mergeGroup) {
            a.mergeGroup = b.mergeGroup
          } else {
            if (a.mergeGroup !== b.mergeGroup) {
              const old = b.mergeGroup
              const neu = a.mergeGroup
              dies.forEach((z) => {
                if (z.mergeGroup === old) z.mergeGroup = neu
              })
            }
          }
        }
      }
    }
  }

  // Build merged groups bounding boxes per field
  type MergeGroup = { id: number; xMin: number; xMax: number; yMin: number; yMax: number; cdu: number | null }
  const fieldRenderItems: {
    fieldRect: { x: number; y: number; w: number; h: number } // for outline drawing (always draw)
    singleDies: Die[] // dies that are not merged (mergeGroup null) and cdu != null
    mergeGroups: MergeGroup[] // merged groups bounding boxes with representative cdu
  }[] = []

  for (const f of fields) {
    const fieldRect = {
      x: f.cx - fieldWidth / 2,
      y: f.cy - fieldHeight / 2,
      w: fieldWidth,
      h: fieldHeight,
    }

    const singleDies: Die[] = []
    const groupsMap = new Map<number, Die[]>()

    for (const d of f.dies) {
      if (d.mergeGroup == null) {
        // if cdu null -> will render as transparent die (gap)
        singleDies.push(d)
      } else {
        const id = d.mergeGroup
        if (!groupsMap.has(id)) groupsMap.set(id, [])
        groupsMap.get(id)!.push(d)
      }
    }

    const mergeGroups: MergeGroup[] = []
    for (const [id, list] of groupsMap.entries()) {
      const xMin = Math.min(...list.map((z) => z.x - dieWidth / 2))
      const xMax = Math.max(...list.map((z) => z.x + dieWidth / 2))
      const yMin = Math.min(...list.map((z) => z.y - dieHeight / 2))
      const yMax = Math.max(...list.map((z) => z.y + dieHeight / 2))
      const avgCdu = list.reduce((a, b) => a + (b.cdu ?? 0), 0) / list.length
      mergeGroups.push({ id, xMin, xMax, yMin, yMax, cdu: isFinite(avgCdu) ? avgCdu : null })
    }

    fieldRenderItems.push({ fieldRect, singleDies, mergeGroups })
  }

  // drawing helpers: mm -> px coords
  const mm2px = (mm: number) => mm * scale

  // # SVG 렌더링
  return (
    <svg
      width={svgWidthPx}
      height={svgWidthPx + 140}
      viewBox={`${-svgWidthPx / 2} ${-svgWidthPx / 2} ${svgWidthPx} ${svgWidthPx + 140}`}
      style={{ background: 'white', display: 'block', margin: 'auto' }}>
      {/* wafer outline */}
      {/* <circle cx={0} cy={0} r={mm2px(waferRadius)} stroke='#666' strokeWidth={1} fill='none' /> */}

      {/* fields & dies */}
      {fieldRenderItems.map((item, fi) => {
        const fx = item.fieldRect.x
        const fy = item.fieldRect.y
        const fw = item.fieldRect.w
        const fh = item.fieldRect.h

        return (
          <g key={fi}>
            {/* draw field outline even if some dies are out (as requested) */}
            <rect
              x={mm2px(fx)}
              y={mm2px(fy)}
              width={mm2px(fw)}
              height={mm2px(fh)}
              fill='none'
              stroke='#999'
              strokeWidth={0.8}
            />

            {/* merged groups drawn as single rects (no internal borders) */}
            {item.mergeGroups.map((g) => (
              <g key={`mg-${g.id}`}>
                <rect
                  x={mm2px(g.xMin)}
                  y={mm2px(g.yMin)}
                  width={mm2px(g.xMax - g.xMin)}
                  height={mm2px(g.yMax - g.yMin)}
                  fill={cduToColor(g.cdu)}
                  stroke='none'
                />
                {/* text at center of merged bbox */}
                {g.cdu != null && (
                  <text
                    x={mm2px((g.xMin + g.xMax) / 2)}
                    y={mm2px((g.yMin + g.yMax) / 2)}
                    textAnchor='middle'
                    alignmentBaseline='middle'
                    fontSize={12}
                    fill='#111'
                    style={{ userSelect: 'none' }}>
                    {g.cdu.toFixed(2)}
                  </text>
                )}
              </g>
            ))}

            {/* single dies (non-merged). If cdu==null -> transparent gap (rect not filled) */}
            {item.singleDies.map((d, di) => (
              <g key={`d-${fi}-${di}`}>
                <rect
                  x={mm2px(d.x - dieWidth / 2)}
                  y={mm2px(d.y - dieHeight / 2)}
                  width={mm2px(dieWidth)}
                  height={mm2px(dieHeight)}
                  fill={d.cdu == null ? '#fff' : cduToColor(d.cdu)}
                  stroke={d.cdu == null ? '#ddddddff' : 'rgba(0,0,0,0.25)'}
                  strokeWidth={0.5}
                />
                {d.cdu != null && (
                  <text
                    x={mm2px(d.x)}
                    y={mm2px(d.y)}
                    textAnchor='middle'
                    alignmentBaseline='middle'
                    fontSize={10}
                    fill='#111'>
                    {d.cdu.toFixed(2)}
                  </text>
                )}
              </g>
            ))}
          </g>
        )
      })}

      {/* color bar (beneath wafer, not clipped) */}
      <defs>
        <linearGradient id='cduBarV6' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0%' stopColor='#00f' />
          <stop offset='50%' stopColor='#0f0' />
          <stop offset='100%' stopColor='#f00' />
        </linearGradient>
      </defs>
      <rect
        x={-mm2px(waferRadius) * 0.45}
        y={mm2px(waferRadius) + 30}
        width={mm2px(waferRadius) * 0.9}
        height={16}
        fill='url(#cduBarV6)'
        stroke='#999'
        strokeWidth={0.6}
      />
      <text x={-mm2px(waferRadius) * 0.48} y={mm2px(waferRadius) + 60} fontSize={14} fill='#333'>
        CDU (-)
      </text>
      <text x={mm2px(waferRadius) * 0.44} y={mm2px(waferRadius) + 60} fontSize={14} fill='#333'>
        (+)
      </text>

      <circle cx={0} cy={0} r={mm2px(waferRadius)} stroke='#666' strokeWidth={1} fill='none' />
    </svg>
  )
}

export default WaferFieldCDU_V6
