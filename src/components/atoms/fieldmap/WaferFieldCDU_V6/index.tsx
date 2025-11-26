import React, { useState, useRef, useEffect } from 'react'
import type { WaferFieldCDU_V6Props } from './types'
import { useCDUData, useMergeGroups, useFieldRenderItems } from './hooks'
import { WaferOutline, ColorBar, FieldGroup } from './components'

const WaferFieldCDU_V6: React.FC<WaferFieldCDU_V6Props> = ({
  cduSeed,
  cduData,
  zoom = 1,
  showValues = true,
  onFieldHover,
  mergeOptions = { enabled: true, threshold: 0.05 },
  // controller props (defaults maintained here)
  showFullGrid = false,
  viewDieSequence = false,
  viewDieIndex = false,
  fieldArraySize = [10, 10],
  offsetMicrometers = [0, 0],
  fieldSizeMicrometers = [20000, 30000],
}) => {
  // Parameters
  const waferRadius = 150
  
  // fieldSizeMicrometers로 동적 필드 크기 계산 (마이크로미터 -> mm)
  // 기본값: 20000 μm = 20 mm, 30000 μm = 30 mm
  const fieldWidth = Math.max(1, fieldSizeMicrometers[0] / 1000)
  const fieldHeight = Math.max(1, fieldSizeMicrometers[1] / 1000)
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
  const offsetMmX = offsetMicrometers[0] / 1000
  const offsetMmY = offsetMicrometers[1] / 1000

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
  const maxFieldCount = Math.max(fieldArraySize[0], fieldArraySize[1])
  const range = Math.ceil(maxFieldCount / 2) + 1

  console.log('Field Array Size:', fieldArraySize, '-> range:', range)

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
    fieldArraySize,
    cduSeed,
    cduData,
  })

  const { fieldsWithMerge } = useMergeGroups({
    fields,
    dieWidth,
    dieHeight,
    dieCols,
    dieRows,
    enabled: mergeOptions.enabled,
    mergeThreshold: mergeOptions.threshold,
  })

  const fieldRenderItems = useFieldRenderItems({
    fields: fieldsWithMerge,
    dieWidth,
    dieHeight,
    dieCols,
    dieRows,
  })

  const mm2px = (mm: number) => mm * scale * zoom

  // viewBox에 offset을 적용
  const viewBoxX = -svgWidthPx / 2 - mm2px(offsetMmX)
  const viewBoxY = -svgWidthPx / 2 - mm2px(offsetMmY)

  // State
  const [hoverField, setHoverField] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

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
    width: svgWidthPx * zoom,
    height: (svgWidthPx + 140) * zoom,
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
          viewBox={`${viewBoxX} ${viewBoxY} ${svgWidthPx} ${svgWidthPx + 140}`}
          style={{
            background: 'white',
            display: 'block',
          }}>
          {/* 오프셋을 적용하는 그룹 */}
          <g transform={`translate(${mm2px(offsetMmX)} ${mm2px(offsetMmY)})`}>
            {/* 필드 및 다이 렌더링 */}
            {fieldRenderItems.filter(item => item.included || showFullGrid).map((item, fi) => (
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
              />
            ))}

            {/* 컬러바 */}
            <ColorBar waferRadius={waferRadius} mm2px={mm2px} />

            {/* wafer 테두리 */}
            <WaferOutline cx={0} cy={0} radius={waferRadius} mm2px={mm2px} />
          </g>
        </svg>
      </div>
    </div>
  )
}

export default WaferFieldCDU_V6
