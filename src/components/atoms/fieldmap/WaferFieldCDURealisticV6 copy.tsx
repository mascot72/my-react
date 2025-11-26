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
// seed 기반 난수 생성기 (간단한 LCG)
function mulberry32(seed: number) {
  let t = seed
  return function () {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}


interface WaferFieldCDU_V6Props {
  cduSeed?: number
  /**
   * 완전히 외부에서 주입하는 CDU 값 배열 (필드별 다이별 flat 1차원 배열)
   * 예: [cdu0, cdu1, ...] (null 허용)
   */
  cduData?: (number | null)[]
  // 줌 배율 (1 = 원래 크기)
  zoom?: number
  // 다이/병합값 표시 여부
  showValues?: boolean
  /**
   * 필드 hover 콜백: 마우스가 필드(rect) 위에 올라가면 호출됨
   * info === null 일 때는 hover 해제
   * clientX, clientY는 이벤트의 브라우저 좌표로 툴팁 위치 계산에 사용
   */
  onFieldHover?: (info: { id: string; avgCdu: number | null; cx: number; cy: number } | null, clientX?: number, clientY?: number) => void
}

const WaferFieldCDU_V6: React.FC<WaferFieldCDU_V6Props> = ({ cduSeed, cduData, zoom = 1, showValues = true, onFieldHover }) => {
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
  // waferRadiusPx는 사용하지 않으므로 선언을 제거함

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

  // 마우스 오버된 필드 상태 관리
  const [hoverField, setHoverField] = React.useState<string | null>(null)

  // fields 배열 생성
  const fields: Field[] = React.useMemo(() => {
    const arr: Field[] = []
    // cduData가 있으면 그 값을 순서대로 사용, 없으면 seed 기반 난수 생성
    let cduIdx = 0
    const rand = mulberry32(typeof cduSeed === 'number' ? cduSeed : 123456789)
    for (let fy = -range; fy <= range; fy++) {
      for (let fx = -range; fx <= range; fx++) {
        const cx = fx * fieldStepX
        const cy = fy * fieldStepY
        const dies: Die[] = []
        for (let j = 0; j < dieRows; j++) {
          for (let i = 0; i < dieCols; i++) {
            const dx = cx - fieldWidth / 2 + (i + 0.5) * dieWidth
            const dy = cy - fieldHeight / 2 + (j + 0.5) * dieHeight
            let cdu: number | null
            if (Array.isArray(cduData)) {
              // 외부에서 주입된 값 사용
              cdu = cduData[cduIdx++] ?? null
            } else {
              // CDU 값이 없는 경우를 시뮬레이션 (10% 확률로 누락)
              const hasCdu = rand() > 0.1
              cdu = hasCdu ? generateCDU(dx, dy) : null
            }
            dies.push({ x: dx, y: dy, cdu, mergeGroup: null })
          }
        }
        // decide to include field in drawing: if ANY die center is inside wafer radius
        const anyDieCenterInside = dies.some((d) => Math.hypot(d.x, d.y) <= waferRadius)
        if (!anyDieCenterInside) {
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
            d.cdu = null
          }
        }
        arr.push({ cx, cy, dies })
      }
    }
    return arr
  }, [waferRadius, fieldStepX, fieldStepY, dieRows, dieCols, fieldWidth, fieldHeight, dieWidth, dieHeight, range, cduSeed, cduData])

  // 필드 간 병합(인접 필드의 다이도 병합 그룹으로 묶기)
  // 모든 다이를 flat하게 모아 인접성(좌우, 상하, 필드 경계 포함)으로 병합
  const mergeThreshold = 0.05
  let mergeId = 1
  // 다이 전체를 2차원 배열로 저장 (필드별, 다이별)
  // 각 다이의 전역 인덱스: [fieldIndex, dieIndex]
  // 병합 처리를 위해 flat 배열로 변환
  type DieWithField = Die & { fieldIndex: number; dieIndex: number; gridX: number; gridY: number }
  const allDies: DieWithField[] = []
  // 필드의 위치를 빠르게 찾기 위한 맵
  const fieldMap = new Map<string, { field: Field; fieldIndex: number }>()
  fields.forEach((f, fieldIndex) => {
    // 필드의 grid 좌표 계산 (fx, fy)
    // cx = fx * fieldStepX, cy = fy * fieldStepY
    const fx = Math.round(f.cx / fieldStepX)
    const fy = Math.round(f.cy / fieldStepY)
    fieldMap.set(`${fx},${fy}`, { field: f, fieldIndex })
    f.dies.forEach((d, dieIndex) => {
      // 다이의 grid 내 좌표 (i, j)
      const j = Math.floor(dieIndex / dieCols)
      const i = dieIndex % dieCols
      // 전역 grid 좌표: (fx * dieCols + i, fy * dieRows + j)
      allDies.push({ ...d, fieldIndex, dieIndex, gridX: fx * dieCols + i, gridY: fy * dieRows + j })
    })
  })
  // 병합 그룹 할당
  for (let idx = 0; idx < allDies.length; idx++) {
    const a = allDies[idx]
    if (a.cdu == null) continue
    // 인접 다이 후보: 좌, 우, 상, 하
    const neighbors = [
      [a.gridX - 1, a.gridY],
      [a.gridX + 1, a.gridY],
      [a.gridX, a.gridY - 1],
      [a.gridX, a.gridY + 1],
    ]
    for (const [nx, ny] of neighbors) {
      const b = allDies.find((d) => d.gridX === nx && d.gridY === ny)
      if (!b || b.cdu == null) continue
      if (Math.abs((a.cdu ?? 0) - (b.cdu ?? 0)) < mergeThreshold) {
        // 그룹 병합
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
            allDies.forEach((z) => {
              if (z.mergeGroup === old) z.mergeGroup = neu
            })
          }
        }
      }
    }
  }
  // 병합 결과를 원래 필드 구조에 반영
  allDies.forEach((d) => {
    fields[d.fieldIndex].dies[d.dieIndex].mergeGroup = d.mergeGroup
  })

  // Build merged groups bounding boxes per field
  type MergeGroup = { id: number; xMin: number; xMax: number; yMin: number; yMax: number; cdu: number | null }
  const fieldRenderItems: {
    fieldRect: { x: number; y: number; w: number; h: number } // for outline drawing (always draw)
    singleDies: Die[] // dies that are not merged (mergeGroup null) and cdu != null
    mergeGroups: MergeGroup[] // merged groups bounding boxes with representative cdu
    fieldAvgCdu: number | null // 필드(모든 다이)의 평균 CDU
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

    // 필드 전체 평균 (null 제외)
    const vals = f.dies.map((d) => d.cdu).filter((v) => v != null) as number[]
    const fieldAvg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null

    fieldRenderItems.push({ fieldRect, singleDies, mergeGroups, fieldAvgCdu: fieldAvg })
  }

  // drawing helpers: mm -> px coords
  // mm 단위를 px로 변환할 때 zoom을 반영
  const mm2px = (mm: number) => mm * scale * zoom

  // # SVG 렌더링
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 });

  // 컨테이너 크기 감지
  React.useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    updateSize();
    const observer = new ResizeObserver(updateSize);
    const currentRef = containerRef.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  // SVG 크기 계산
  const svgSize = {
    width: svgWidthPx * zoom,
    height: (svgWidthPx + 140) * zoom
  };

  // 스크롤이 필요한지 확인
  const needsScroll = 
    (containerSize.width > 0 && svgSize.width > containerSize.width) || 
    (containerSize.height > 0 && svgSize.height > containerSize.height);

  // 컨테이너 스타일
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '400px',
    overflow: needsScroll ? 'auto' : 'hidden',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <div style={{
        minWidth: svgSize.width,
        minHeight: svgSize.height,
        position: 'relative'
      }}>
        <svg
          width={svgSize.width}
          height={svgSize.height}
          viewBox={`${-svgWidthPx / 2} ${-svgWidthPx / 2} ${svgWidthPx} ${svgWidthPx + 140}`}
          style={{ 
            background: 'white',
            display: 'block'
          }}>
          {/* wafer outline */}
          {/* <circle cx={0} cy={0} r={mm2px(waferRadius)} stroke='#666' strokeWidth={1} fill='none' /> */}

          {/* fields & dies */}
          {fieldRenderItems.map((item, fi) => {
            const fx = item.fieldRect.x
            const fy = item.fieldRect.y
            const fw = item.fieldRect.w
            const fh = item.fieldRect.h

            const fieldKey = `field-${fi}-${item.fieldRect.x}-${item.fieldRect.y}`
            return (
              <g key={fi}>
                {/* draw field outline even if some dies are out (as requested) */}
                <rect
                  x={mm2px(fx)}
                  y={mm2px(fy)}
                  width={mm2px(fw)}
                  height={mm2px(fh)}
                  fill='none'
                  stroke={hoverField === fieldKey ? '#ff4da6' : '#c1c6cc'}
                  strokeWidth={hoverField === fieldKey ? 1.6 : 0.9}
                  style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                  onMouseEnter={(e) => {
                    setHoverField(fieldKey);
                    if (onFieldHover) {
                      onFieldHover(
                        { 
                          id: fieldKey, 
                          avgCdu: item.fieldAvgCdu, 
                          cx: item.fieldRect.x, 
                          cy: item.fieldRect.y 
                        }, 
                        e.clientX, 
                        e.clientY
                      );
                    }
                  }}
                  onMouseLeave={(e) => {
                    setHoverField(null);
                    if (onFieldHover) {
                      onFieldHover(null, e.clientX, e.clientY);
                    }
                  }}
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
                    {g.cdu != null && showValues && (
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
                      stroke={d.cdu == null ? '#ddddddff' : 'rgba(0, 0, 0, 0.1)'}
                      strokeWidth={0.3}
                    />
                    {d.cdu != null && showValues && (
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
      </div>
    </div>
  );
}

export default WaferFieldCDU_V6
