import React, { useState, useRef, useEffect, useMemo } from 'react'
import type { WaferFieldCDU_V6Props } from './types'
import { useCDUData, useMergeGroups, useFieldRenderItems, usePointData } from './hooks'
import { WaferOutline, ColorBar, FieldGroup, CoordinateGrid, PointLayer, OutlineLayer } from './components'

const WaferFieldCDU_V6: React.FC<WaferFieldCDU_V6Props> = ({
  cduSeed,
  cduData,
  showValues = true,
  onFieldHover,
  mergeOptions = { enabled: false, threshold: 0.05 }, // mergeGroup 기본적으로 비활성화
  enablePointData = false, // pointData 모드 사용 여부
  viewPoint = false, // 포인트 렌더링 토글
  diePointRadiusPx,
  fieldPointRadiusPx,
  diePointOpacity,
  fieldPointOpacity,
  showOutlinesInPointMode = true,
  showPointLabels = false,
  // controller props (defaults maintained here)
  showFullGrid = false,
  viewDieSequence = false,
  viewDieIndex = false,
  viewShotSequence = false,
  fieldArraySize = [14, 13],
  offsetMicrometers = [0, 0],
  fieldSizeMicrometers = [20000, 30000],
}) => {
  // Parameters
  const waferRadius = 150
  
  // fieldSizeMicrometers로 동적 필드 크기 계산 (마이크로미터 -> mm)
  // 기본값: 20000 μm = 20 mm, 30000 μm = 30 mm
  const memoFieldSizeMicrometers = useMemo(() => fieldSizeMicrometers ?? [20000, 30000], [fieldSizeMicrometers])
  const fieldWidth = Math.max(1, memoFieldSizeMicrometers[0] / 1000)
  const fieldHeight = Math.max(1, memoFieldSizeMicrometers[1] / 1000)
  const dieCols = 2
  const dieRows = 3

  const svgWidthPx = 900
  const marginRatio = 0.06

  const waferDiameterPx = svgWidthPx * (1 - marginRatio * 2)
  const scale = waferDiameterPx / (waferRadius * 2)

  const dieWidth = fieldWidth / dieCols
  const dieHeight = fieldHeight / dieRows
  const fieldStepX = fieldWidth
  const fieldStepY = fieldHeight

  // Offset을 mm 단위로 변환 (마이크로미터 -> mm)
  // Wafer 개념에서 offset은 Wafer의 상대적 위치를 의미합니다
  // 따라서 Die Rect는 고정이고, Wafer Circle이 offset만큼 이동합니다
  const offsetMmX = offsetMicrometers[0] / 1000
  const offsetMmY = offsetMicrometers[1] / 1000

  // offsetMm 배열은 렌더마다 새로 생성되면 참조가 바뀌어
  // useCDUData의 의존성으로 인해 불필요한 재계산을 유발합니다.
  // 따라서 값이 변경될 때만 새로운 배열을 생성하도록 memoize 합니다.
  const offsetMm = useMemo(() => [offsetMmX, offsetMmY] as [number, number], [offsetMmX, offsetMmY])

  // fieldArraySize와 mergeOptions도 참조 안정성이 필요할 수 있어 memoize 합니다.
  const memoFieldArraySize = useMemo(() => fieldArraySize ?? [14, 13], [fieldArraySize])
  const memoMergeOptions = useMemo(() => mergeOptions ?? { enabled: false, threshold: 0.05 }, [mergeOptions])

  // DEBUG: offset과 field size 변경 확인
  console.log('WaferFieldCDU_V6 rendered with offsetMicrometers:', offsetMicrometers, 'fieldSizeMicrometers:', fieldSizeMicrometers, 'fieldSize (mm):', [fieldWidth, fieldHeight])

  // color map
  function cduToColor(v: number | null) {
    if (v == null) return 'transparent'
    const t = (v + 1) / 2
    const r = Math.floor(255 * t)
    const g = Math.floor(255 * (1 - Math.abs(t - 0.5) * 2))
    const b = Math.floor(255 * (1 - t))
    return `rgb(${r},${g},${b})`
  }

  // range 계산: fieldArraySize를 기반으로 동적 조정
  // fieldArraySize는 [x개수, y개수]를 의미
  // range는 -range ~ +range 범위에서 필드를 생성하므로, 
  // 최대값을 기반으로 range를 설정
  const maxFieldCount = Math.max(memoFieldArraySize[0], memoFieldArraySize[1])
  const range = Math.ceil(maxFieldCount / 2) + 1

  console.log('Field Array Size:', memoFieldArraySize, '-> range:', range)

  // hooks
  const fields = useCDUData({
    waferRadius,
    fieldStepX,
    fieldStepY,
    dieRows,
    dieCols,
    dieWidth,
    dieHeight,
    fieldWidth,
    fieldHeight,
    range,
    fieldArraySize: memoFieldArraySize,
    cduSeed,
    cduData,
    offsetMm,
  })

  const { fieldsWithMerge } = useMergeGroups({
    fields,
    dieWidth,
    dieHeight,
    dieCols,
    dieRows,
    enabled: memoMergeOptions.enabled,
    mergeThreshold: memoMergeOptions.threshold,
  })

  const fieldRenderItems = useFieldRenderItems({
    fields: fieldsWithMerge,
    dieWidth,
    dieHeight,
    dieCols,
    dieRows,
  })

  // PointData 생성 (enablePointData=true일 때 사용)
  const pointDataSet = usePointData({
    fields,
  })

  // DEBUG: pointData 출력
  if (enablePointData) {
    console.log('PointDataSet:', {
      diePointsCount: pointDataSet.diePoints.length,
      fieldPointsCount: pointDataSet.fieldPoints.length,
      sampleDiePoints: pointDataSet.diePoints.slice(0, 5),
      sampleFieldPoints: pointDataSet.fieldPoints.slice(0, 5),
    })
  }

  const mm2px = (mm: number) => mm * scale

  // offset은 Wafer Circle의 위치 변이 (Die Rect 기준으로)
  const offsetPxX = mm2px(offsetMmX)
  const offsetPxY = mm2px(offsetMmY)

  // State
  const [hoverField, setHoverField] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [tooltip, setTooltip] = useState<
    | {
        kind: 'die' | 'field'
        x: number
        y: number
        value: number | null
        label?: string
      }
    | null
  >(null)

  // items to render (respect showFullGrid)
  const renderItems = fieldRenderItems.filter((item) => item.included || showFullGrid)

  // viewBox 계산: 기본은 SVG 중심을 기준으로 하되,
  // showFullGrid가 켜져있으면 모든 필드를 포함하도록 bbox를 계산하고
  // 약간의 padding을 추가하여 스트로크가 잘리지 않도록 처리합니다.
  let viewBoxX = -svgWidthPx / 2
  let viewBoxY = -svgWidthPx / 2
  let viewBoxWidth = svgWidthPx
  let viewBoxHeight = svgWidthPx + 140

  if (showFullGrid && renderItems.length > 0) {
    const padMm = 1 // 1mm padding
    const padPx = padMm * scale
    let minPxX = Infinity
    let minPxY = Infinity
    let maxPxX = -Infinity
    let maxPxY = -Infinity

    for (const it of renderItems) {
      const fx = mm2px(it.fieldRect.x)
      const fy = mm2px(it.fieldRect.y)
      const fw = mm2px(it.fieldRect.w)
      const fh = mm2px(it.fieldRect.h)
      minPxX = Math.min(minPxX, fx)
      minPxY = Math.min(minPxY, fy)
      maxPxX = Math.max(maxPxX, fx + fw)
      maxPxY = Math.max(maxPxY, fy + fh)
    }

    // add padding to avoid clipped strokes
    minPxX -= padPx
    minPxY -= padPx
    maxPxX += padPx
    maxPxY += padPx

    viewBoxX = minPxX
    viewBoxY = minPxY
    viewBoxWidth = Math.max(1, maxPxX - minPxX)
    viewBoxHeight = Math.max(1, maxPxY - minPxY)
  }

  // ResizeObserver
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({
          width: rect.width,
          height: rect.height,
        })
      }
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    const currentRef = containerRef.current

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  const svgSize = {
    width: svgWidthPx,
    height: svgWidthPx + 140,
  }

  const needsScroll =
    (containerSize.width > 0 && svgSize.width > containerSize.width) ||
    (containerSize.height > 0 && svgSize.height > containerSize.height)

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '400px',
    overflow: needsScroll ? 'auto' : 'hidden',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }

  return (
    <div ref={containerRef} style={containerStyle}>
      <div
        style={{
          minWidth: svgSize.width,
          minHeight: svgSize.height,
          position: 'relative',
        }}>
        <svg
          width={svgSize.width}
          height={svgSize.height}
          viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
          style={{
            background: 'white',
            display: 'block',
          }}>
          {/* Rect 기반 vs Point 기반 렌더링 토글 */}
          {enablePointData && viewPoint ? (
            <>
              {/* Points first */}
              <PointLayer
                diePoints={pointDataSet.diePoints}
                fieldPoints={pointDataSet.fieldPoints}
                mm2px={mm2px}
                cduToColor={cduToColor}
                diePointRadiusPx={diePointRadiusPx}
                fieldPointRadiusPx={fieldPointRadiusPx}
                diePointOpacity={diePointOpacity}
                fieldPointOpacity={fieldPointOpacity}
                showLabels={showPointLabels}
                onDieHover={(info) =>
                  setTooltip({ kind: 'die', x: info.x, y: info.y, value: info.value, label: `Die ${info.dieIndex ?? ''}` })
                }
                onFieldHover={(info) => {
                  setTooltip({ kind: 'field', x: info.x, y: info.y, value: info.value, label: info.shotIndex !== undefined ? `Shot ${info.shotIndex}` : 'Field' })
                  if (onFieldHover) {
                    onFieldHover(
                      { id: `field-${info.x}-${info.y}`, avgCdu: info.value, cx: info.x, cy: info.y },
                      undefined,
                      undefined
                    )
                  }
                }}
                onHoverEnd={() => setTooltip(null)}
              />
              {/* Outlines on top for visibility */}
              {showOutlinesInPointMode && (
                <OutlineLayer
                  items={fieldRenderItems.filter((item) => item.included || showFullGrid)}
                  dieWidth={dieWidth}
                  dieHeight={dieHeight}
                  mm2px={mm2px}
                  showShotSequence={viewShotSequence}
                />
              )}
            </>
          ) : (
            fieldRenderItems
              .filter(item => item.included || showFullGrid)
              .map((item, fi) => (
                <FieldGroup
                  key={fi}
                  item={item}
                  fieldIndex={fi}
                  dieWidth={dieWidth}
                  dieHeight={dieHeight}
                  mm2px={mm2px}
                  cduToColor={cduToColor}
                  showValues={showValues}
                  hoverField={hoverField}
                  onMouseEnter={(fieldKey, e) => {
                    setHoverField(fieldKey)
                    if (onFieldHover) {
                      onFieldHover(
                        {
                          id: fieldKey,
                          avgCdu: item.fieldAvgCdu,
                          cx: item.fieldRect.x,
                          cy: item.fieldRect.y,
                        },
                        e.clientX,
                        e.clientY
                      )
                    }
                  }}
                  onMouseLeave={(e) => {
                    setHoverField(null)
                    if (onFieldHover) {
                      onFieldHover(null, e.clientX, e.clientY)
                    }
                  }}
                  showDieIndex={viewDieIndex}
                  showDieSequence={viewDieSequence}
                  showShotSequence={viewShotSequence}
                />
              ))
          )}

          {/* Tooltip (SVG) */}
          {tooltip && (
            <g transform={`translate(${mm2px(tooltip.x)} ${mm2px(tooltip.y)})`} pointerEvents='none'>
              <g transform={`translate(8, -8)`}>
                <rect x={0} y={-24} width={120} height={30} rx={6} fill='rgba(0,0,0,0.7)' />
                <text x={8} y={-8} fontSize={11} fill='#fff' fontWeight='bold'>
                  {tooltip.label ?? (tooltip.kind === 'die' ? 'Die' : 'Field')}
                </text>
                <text x={8} y={6} fontSize={11} fill='#fff'>
                  {tooltip.value == null ? 'N/A' : `CDU: ${tooltip.value.toFixed(3)}`}
                </text>
              </g>
            </g>
          )}

          {/* 좌표 눈금 */}
          <CoordinateGrid fieldArraySize={memoFieldArraySize} fieldStepX={fieldStepX} fieldStepY={fieldStepY} mm2px={mm2px} svgWidthPx={svgWidthPx} />

          {/* 컬러바 */}
          <ColorBar waferRadius={waferRadius} mm2px={mm2px} />

          {/* Wafer Circle (offset 적용 - Die Rect 기준으로 이동) */}
          <g transform={`translate(${offsetPxX} ${offsetPxY})`}>
            <WaferOutline cx={0} cy={0} radius={waferRadius} mm2px={mm2px} />
          </g>
        </svg>
      </div>
    </div>
  )
}

export default WaferFieldCDU_V6
