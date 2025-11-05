import React, { useMemo } from 'react'

/**
 * WaferFieldCDU_V7
 *
 * - waferRadius = 150 mm
 * - shot grid: shotCols=14, shotRows=13 (center shot has indexX=0,indexY=0)
 * - die array per shot: dieCols=2, dieRows=3
 * - field size: fieldWidth=23456 µm, fieldHeight=32430 µm (user-provided)
 * - points: input in nm absolute coordinates, may exceed shot size
 * - internal processing uses mm.
 *
 * Merge logic:
 * - For each shot, we build die cells (dieCols x dieRows).
 * - A die is "active" if it contains at least one point (converted to shot-relative coords).
 * - Adjacent active dies (sharing an edge) are grouped (merged) using simple connected-component grouping.
 * - The renderable mat for merged dies is the bounding rect of all dies in the group.
 *
 * Rendering:
 * - scale mm -> px computed from svgWidthPx / wafer physical diameter
 * - x increases to the right, y increases upward (we flip y for SVG rendering)
 * - text centered in die or merged-bbox using alignmentBaseline="middle" and textAnchor="middle"
 */

type PointIn = {
  x: number // nm absolute
  y: number // nm absolute
  value?: number // could be CDU or other metric - used for color averaging if present
  indexX: number // shot index
  indexY: number // shot index
  siteSeq?: number
}

const WaferFieldCDU_V7: React.FC = () => {
  // ---------------------------
  // Configuration (from user)
  // ---------------------------
  const waferRadius_mm = 150 // mm (user requested)
  const shotCols = 14
  const shotRows = 13
  const dieCols = 2
  const dieRows = 3
  const fieldWidth_um = 23456 // µm
  const fieldHeight_um = 32430 // µm

  // convert field size to mm
  const fieldWidth_mm = fieldWidth_um / 1000
  const fieldHeight_mm = fieldHeight_um / 1000

  // svg rendering size & scale
  const svgWidthPx = 1000 // canvas size (px)
  const marginPx = 40
  const waferDiameter_mm = waferRadius_mm * 2
  const waferDiameterPx = svgWidthPx - marginPx * 2
  const scale = waferDiameterPx / waferDiameter_mm // mm -> px
  const waferRadiusPx = waferRadius_mm * scale

  // conversion helpers
  const nmToMm = (nm: number) => nm * 1e-6
  const mmToPx = (mm: number) => mm * scale
  // For y-axis inversion (since we want y up in logical coords)
  const mmToPxY = (mm: number) => -mm * scale

  // ---------------------------
  // Sample pointData generator
  // 70 ~ 1000 random points
  // ---------------------------
  const pointData: PointIn[] = useMemo(() => {
    const total = 200 + Math.floor(Math.random() * 600) // between 200 and 800 (realistic)
    const pts: PointIn[] = []
    // shot index ranges: center=0. For shotCols=14 => indices [-7..6], rows 13 => [-6..6]
    const xStart = -Math.floor(shotCols / 2)
    const xEnd = xStart + shotCols - 1
    const yStart = -Math.floor(shotRows / 2)
    const yEnd = yStart + shotRows - 1

    for (let k = 0; k < total; k++) {
      const idxX = Math.floor(Math.random() * (xEnd - xStart + 1)) + xStart
      const idxY = Math.floor(Math.random() * (yEnd - yStart + 1)) + yStart

      // allow points to lie inside shot area or slightly outside (±20%)
      const extraXratio = (Math.random() - 0.5) * 0.4 // -0.2 .. +0.2
      const extraYratio = (Math.random() - 0.5) * 0.4

      // choose local coords in mm relative to shot left-bottom (0..fieldWidth_mm)
      const localXmm = Math.max(
        -fieldWidth_mm * 0.5,
        Math.min(fieldWidth_mm * 1.5, Math.random() * fieldWidth_mm * (1 + 0.4) + extraXratio * fieldWidth_mm),
      )
      const localYmm = Math.max(
        -fieldHeight_mm * 0.5,
        Math.min(fieldHeight_mm * 1.5, Math.random() * fieldHeight_mm * (1 + 0.4) + extraYratio * fieldHeight_mm),
      )

      // convert to absolute nm: shot origin = index * fieldSize_mm (left-bottom)
      const shotOriginX_mm = idxX * fieldWidth_mm
      const shotOriginY_mm = idxY * fieldHeight_mm
      const absX_nm = Math.round((shotOriginX_mm + localXmm) * 1e6) // mm -> nm
      const absY_nm = Math.round((shotOriginY_mm + localYmm) * 1e6)

      const value = (Math.random() - 0.5) * 2 // -1..1

      pts.push({
        x: absX_nm,
        y: absY_nm,
        value,
        indexX: idxX,
        indexY: idxY,
        siteSeq: Math.floor(Math.random() * 1000),
      })
    }
    return pts
  }, [fieldWidth_mm, fieldHeight_mm, shotCols, shotRows])

  // ---------------------------
  // Build shot grid and aggregate points into shots/dies
  // ---------------------------
  // shot index ranges (centered)
  const shotXStart = -Math.floor(shotCols / 2)
  const shotXEnd = shotXStart + shotCols - 1
  const shotYStart = -Math.floor(shotRows / 2)
  const shotYEnd = shotYStart + shotRows - 1

  type DieCell = {
    i: number // die col index (0..dieCols-1)
    j: number // die row index (0..dieRows-1)
    x_mm_center: number // absolute mm center
    y_mm_center: number
    active: boolean // active if contains at least one point whose local coords fall inside die cell
    points: PointIn[] // points assigned
  }

  type Shot = {
    indexX: number
    indexY: number
    cx_mm: number // shot center mm absolute
    cy_mm: number
    dies: DieCell[]
  }

  const shots: Shot[] = []

  for (let sx = shotXStart; sx <= shotXEnd; sx++) {
    for (let sy = shotYStart; sy <= shotYEnd; sy++) {
      const shotOriginX_mm = sx * fieldWidth_mm // left-bottom absolute mm
      const shotOriginY_mm = sy * fieldHeight_mm // left-bottom absolute mm

      // create die cells with centers
      const dies: DieCell[] = []
      for (let j = 0; j < dieRows; j++) {
        for (let i = 0; i < dieCols; i++) {
          // die center in mm (left-bottom origin)
          const localCenterX_mm = (i + 0.5) * (fieldWidth_mm / dieCols)
          const localCenterY_mm = (j + 0.5) * (fieldHeight_mm / dieRows)
          const x_mm_center = shotOriginX_mm + localCenterX_mm
          const y_mm_center = shotOriginY_mm + localCenterY_mm
          dies.push({
            i,
            j,
            x_mm_center,
            y_mm_center,
            active: false,
            points: [],
          })
        }
      }

      // decide whether to include field outline: include if ANY die center inside wafer (per request)
      const anyDieCenterInside = dies.some((d) => Math.hypot(d.x_mm_center, d.y_mm_center) <= waferRadius_mm)

      if (!anyDieCenterInside) {
        // skip entire shot (fully outside wafer)
        continue
      }

      shots.push({
        indexX: sx,
        indexY: sy,
        cx_mm: shotOriginX_mm + fieldWidth_mm / 2,
        cy_mm: shotOriginY_mm + fieldHeight_mm / 2,
        dies,
      })
    }
  }

  // Assign points to dies (based on provided indexX/indexY and absolute coordinates)
  for (const p of pointData) {
    // Convert point absolute nm -> mm
    const px_mm = nmToMm(p.x)
    const py_mm = nmToMm(p.y)

    // locate shot in shots array: because user provides indexX/indexY in pointData, we can map directly
    // but first ensure this shot exists in our shots list
    const shot = shots.find((s) => s.indexX === p.indexX && s.indexY === p.indexY)
    if (!shot) continue

    // compute local coordinate relative to shot left-bottom (in mm)
    const shotOriginX_mm = p.indexX * fieldWidth_mm
    const shotOriginY_mm = p.indexY * fieldHeight_mm
    const localX_mm = px_mm - shotOriginX_mm
    const localY_mm = py_mm - shotOriginY_mm

    // Determine which die cell this point falls into (dieCols x dieRows). If out of bounds, still may fall outside
    const colWidth_mm = fieldWidth_mm / dieCols
    const rowHeight_mm = fieldHeight_mm / dieRows

    const ci = Math.floor(localX_mm / colWidth_mm)
    const cj = Math.floor(localY_mm / rowHeight_mm)

    // clamp indices to 0..dieCols-1 etc - points can be outside, ignore if outside
    if (ci < 0 || ci >= dieCols || cj < 0 || cj >= dieRows) {
      // point is out of die grid for that shot; ignore (user said points may exceed shot)
      continue
    }

    // find the die cell object
    const dieIndex = cj * dieCols + ci
    const die = shot.dies[dieIndex]
    if (!die) continue

    // check full die rectangle inside wafer? We only mark active dies if entire die rect inside wafer.
    const halfW = fieldWidth_mm / dieCols / 2
    const halfH = fieldHeight_mm / dieRows / 2
    const corners = [
      [die.x_mm_center - halfW, die.y_mm_center - halfH],
      [die.x_mm_center + halfW, die.y_mm_center - halfH],
      [die.x_mm_center - halfW, die.y_mm_center + halfH],
      [die.x_mm_center + halfW, die.y_mm_center + halfH],
    ]
    const allCornersInside = corners.every(([cx, cy]) => Math.hypot(cx, cy) <= waferRadius_mm + 1e-9)
    if (!allCornersInside) {
      // per request, die that overlap wafer boundary should be excluded visually
      continue
    }

    // assign point to die
    die.points.push(p)
    die.active = true
  }

  // For each shot, find connected components of active dies (adjacent sharing edge)
  type MergeGroup = {
    ids: number[] // die linear indices in shot.dies
    xMin: number
    xMax: number
    yMin: number
    yMax: number
    avgValue: number | null
  }

  const shotRenderData: {
    shot: Shot
    singleDies: DieCell[] // dies with active true but not merged
    mergeGroups: MergeGroup[]
  }[] = []

  for (const shot of shots) {
    const N = shot.dies.length
    const visited = new Array<boolean>(N).fill(false)
    const mergeGroups: MergeGroup[] = []
    const singleDies: DieCell[] = []

    // adjacency helper (for die grid)
    const idxFrom = (i: number, j: number) => j * dieCols + i

    for (let idx = 0; idx < N; idx++) {
      if (visited[idx]) continue
      const d = shot.dies[idx]
      if (!d.active) {
        visited[idx] = true
        continue
      }

      // BFS to collect connected active dies
      const queue = [idx]
      const comp: number[] = []
      visited[idx] = true
      while (queue.length) {
        const cur = queue.shift()!
        comp.push(cur)
        const cj = Math.floor(cur / dieCols)
        const ci = cur % dieCols
        // neighbors: left,right,up,down
        const neighbors = [
          [ci - 1, cj],
          [ci + 1, cj],
          [ci, cj - 1],
          [ci, cj + 1],
        ]
        for (const [ni, nj] of neighbors) {
          if (ni < 0 || ni >= dieCols || nj < 0 || nj >= dieRows) continue
          const nidx = idxFrom(ni, nj)
          if (!visited[nidx] && shot.dies[nidx].active) {
            visited[nidx] = true
            queue.push(nidx)
          }
        }
      }

      if (comp.length === 1) {
        // single die (non-merged)
        singleDies.push(shot.dies[comp[0]])
      } else {
        // merged group -> compute bounding box and avg value
        const xs: number[] = []
        const ys: number[] = []
        const vals: number[] = []
        for (const k of comp) {
          const dd = shot.dies[k]
          const halfW = fieldWidth_mm / dieCols / 2
          const halfH = fieldHeight_mm / dieRows / 2
          xs.push(dd.x_mm_center - halfW, dd.x_mm_center + halfW)
          ys.push(dd.y_mm_center - halfH, dd.y_mm_center + halfH)
          for (const pt of dd.points) {
            if (pt.value != null) vals.push(pt.value)
          }
        }
        const g: MergeGroup = {
          ids: comp,
          xMin: Math.min(...xs),
          xMax: Math.max(...xs),
          yMin: Math.min(...ys),
          yMax: Math.max(...ys),
          avgValue: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
        }
        mergeGroups.push(g)
      }
    }

    shotRenderData.push({ shot, singleDies, mergeGroups })
  }

  // Color mapping (use value averaged -1..1 -> RGB)
  function valueToColor(v: number | null) {
    if (v == null) return 'transparent'
    const t = Math.max(-1, Math.min(1, v))
    const r = Math.floor(255 * ((t + 1) / 2))
    const g = Math.floor(255 * (1 - Math.abs((t + 1) / 2 - 0.5) * 2))
    const b = Math.floor(255 * (1 - (t + 1) / 2))
    return `rgb(${r},${g},${b})`
  }

  // ---------------------------
  // Render SVG
  // ---------------------------
  return (
    <svg
      width={svgWidthPx}
      height={svgWidthPx + 160}
      viewBox={`${-svgWidthPx / 2} ${-svgWidthPx / 2} ${svgWidthPx} ${svgWidthPx + 160}`}
      style={{ background: 'white', display: 'block', margin: 'auto' }}>
      {/* wafer outline */}
      <circle cx={0} cy={0} r={mmToPx(waferRadius_mm)} stroke='#666' strokeWidth={1.2} fill='none' />

      {/* iterate shots and draw */}
      {shotRenderData.map((r, si) => {
        const shot = r.shot
        const fieldXpx = mmToPx(shot.cx_mm - fieldWidth_mm / 2)
        const fieldYpx = mmToPxY(shot.cy_mm - fieldHeight_mm / 2 + fieldHeight_mm) // compute top-left then use mmToPxY
        const fieldWpx = mmToPx(fieldWidth_mm)
        const fieldHpx = mmToPx(fieldHeight_mm)

        return (
          <g key={si}>
            {/* field outline ALWAYS drawn even if it extends outside wafer (user asked) */}
            <rect
              x={mmToPx(shot.cx_mm - fieldWidth_mm / 2)}
              y={mmToPxY(shot.cy_mm + fieldHeight_mm / 2)}
              width={fieldWpx}
              height={fieldHpx}
              fill='none'
              stroke='#bbb'
              strokeWidth={0.8}
            />

            {/* merged groups (no internal borders) */}
            {r.mergeGroups.map((g, gi) => (
              <g key={`mg-${si}-${gi}`}>
                <rect
                  x={mmToPx(g.xMin)}
                  y={mmToPxY(g.yMax)}
                  width={mmToPx(g.xMax - g.xMin)}
                  height={mmToPx(g.yMax - g.yMin)}
                  fill={valueToColor(g.avgValue)}
                  stroke='none'
                />
                {g.avgValue != null && (
                  <text
                    x={mmToPx((g.xMin + g.xMax) / 2)}
                    y={mmToPxY((g.yMin + g.yMax) / 2)}
                    textAnchor='middle'
                    alignmentBaseline='middle'
                    fontSize={12}
                    fill='#111'
                    style={{ userSelect: 'none' }}>
                    {g.avgValue.toFixed(2)}
                  </text>
                )}
              </g>
            ))}

            {/* single dies */}
            {r.singleDies.map((d, di) => {
              // die rect top-left px
              const xpx = mmToPx(d.x_mm_center - fieldWidth_mm / dieCols / 2)
              const ypx = mmToPxY(d.y_mm_center + fieldHeight_mm / dieRows / 2)
              return (
                <g key={`d-${si}-${di}`}>
                  <rect
                    x={xpx}
                    y={ypx}
                    width={mmToPx(fieldWidth_mm / dieCols)}
                    height={mmToPx(fieldHeight_mm / dieRows)}
                    fill={valueToColor(
                      d.points.length ? d.points.reduce((a, b) => a + (b.value ?? 0), 0) / d.points.length : null,
                    )}
                    stroke={d.points.length ? 'rgba(0,0,0,0.25)' : '#eee'}
                    strokeWidth={0.5}
                  />
                  {d.points.length > 0 && (
                    <text
                      x={mmToPx(d.x_mm_center)}
                      y={mmToPxY(d.y_mm_center)}
                      textAnchor='middle'
                      alignmentBaseline='middle'
                      fontSize={10}
                      fill='#111'>
                      {(d.points.reduce((a, b) => a + (b.value ?? 0), 0) / d.points.length).toFixed(2)}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        )
      })}

      {/* color bar beneath wafer (not clipped) */}
      <defs>
        <linearGradient id='gradV7' x1='0' x2='1'>
          <stop offset='0%' stopColor='#00f' />
          <stop offset='50%' stopColor='#0f0' />
          <stop offset='100%' stopColor='#f00' />
        </linearGradient>
      </defs>
      <rect
        x={-mmToPx(waferRadius_mm) * 0.5}
        y={mmToPx(waferRadius_mm) + 40}
        width={mmToPx(waferRadius_mm)}
        height={14}
        fill='url(#gradV7)'
        stroke='#666'
        strokeWidth={0.6}
      />
      <text x={-mmToPx(waferRadius_mm) * 0.52} y={mmToPx(waferRadius_mm) + 70} fontSize={12} fill='#333'>
        CDU (-)
      </text>
      <text x={mmToPx(waferRadius_mm) * 0.44} y={mmToPx(waferRadius_mm) + 70} fontSize={12} fill='#333'>
        (+)
      </text>
    </svg>
  )
}

export default WaferFieldCDU_V7
