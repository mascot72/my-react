import React from 'react'
import type { FieldRenderItem } from '../types'
import type { SemPointMapped } from '../utils/semPointMapper'
import { DieRect } from './DieRect'
import { MergeGroupRect } from './MergeGroupRect'

interface FieldGroupProps {
  item: FieldRenderItem
  fieldIndex: number
  dieWidth: number
  dieHeight: number
  mm2px: (mm: number) => number
  cduToColor: (v: number | null) => string
  showValues: boolean
  hoverField: string | null
  onMouseEnter: (fieldKey: string, e: React.MouseEvent<SVGRectElement>) => void
  onMouseLeave: (e: React.MouseEvent<SVGRectElement>) => void
  showDieIndex?: boolean
  showDieSequence?: boolean
  showShotSequence?: boolean
  showFieldFill?: boolean
  fieldFillOpacity?: number
  onDieHover?: (info: { x: number; y: number; value: number | null; fieldIndex: number; dieIndex?: number; dieSequence?: number }) => void
  onDieHoverEnd?: () => void
  // SEM Points
  semPoints?: SemPointMapped[]
  showSemPoints?: boolean
  semPointRadiusPx?: number
  semPointOpacity?: number
  semPointColor?: string
}

export const FieldGroup: React.FC<FieldGroupProps> = ({
  item,
  fieldIndex,
  dieWidth,
  dieHeight,
  mm2px,
  cduToColor,
  showValues,
  hoverField,
  onMouseEnter,
  onMouseLeave,
  showDieIndex = false,
  showDieSequence = false,
  showShotSequence = false,
  showFieldFill = false,
  fieldFillOpacity = 0.35,
  onDieHover,
  onDieHoverEnd,
  semPoints = [],
  showSemPoints = false,
  semPointRadiusPx = 4,
  semPointOpacity = 0.85,
  semPointColor = '#ff6b35',
}) => {
  const fieldKey = `field-${fieldIndex}-${item.fieldRect.x}-${item.fieldRect.y}`
  const { x, y, w, h } = item.fieldRect

  return (
    <g key={fieldIndex}
       onMouseEnter={(e) => onMouseEnter(fieldKey, e as unknown as React.MouseEvent<SVGRectElement>)}
       onMouseLeave={onMouseLeave}
    >
      {/* 필드 fill (평균 CDU) */}
      {showFieldFill && (
        <rect
          x={mm2px(x)}
          y={mm2px(y)}
          width={mm2px(w)}
          height={mm2px(h)}
          fill={cduToColor(item.fieldAvgCdu)}
          fillOpacity={fieldFillOpacity}
          stroke='none'
        />
      )}
      {/* 필드 outline */}
      <rect
        x={mm2px(x)}
        y={mm2px(y)}
        width={mm2px(w)}
        height={mm2px(h)}
        fill='none'
        stroke={hoverField === fieldKey ? '#ff4da6' : '#c1c6cc'}
        strokeWidth={hoverField === fieldKey ? 1.6 : 0.9}
        style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
        onMouseEnter={(e) => onMouseEnter(fieldKey, e)}
        onMouseLeave={onMouseLeave}
      />

      {/* shot index 표시 (필드 좌상단) - 항상 표시 */}
      {item.shotIndex !== undefined && (
        <text
          x={mm2px(x) + 4}
          y={mm2px(y) + 12}
          fontSize={10}
          fill='#0066ff'
          fontWeight='bold'>
          Shot: {item.shotIndex}
        </text>
      )}



      {/* 병합된 그룹 */}
      {item.mergeGroups.map((g) => (
        <MergeGroupRect
          key={`mg-${g.id}`}
          group={g}
          mm2px={mm2px}
          cduToColor={cduToColor}
          showValues={showValues}
        />
      ))}

      {/* 개별 다이 */}
      {item.singleDies.map((d) => (
        <DieRect
          key={`d-${fieldIndex}-${d.dieIndex}`}
          die={d}
          dieWidth={dieWidth}
          dieHeight={dieHeight}
          mm2px={mm2px}
          cduToColor={cduToColor}
          showValues={showValues}
          showDieIndex={showDieIndex}
          showDieSequence={showDieSequence}
          fieldIndex={fieldIndex}
          onDieHover={(info) => onDieHover && onDieHover({ ...info, fieldIndex })}
          onHoverEnd={onDieHoverEnd}
        />
      ))}

      {/* shot sequence (on-top) - only numeric value with opaque background for visibility */}
      {showShotSequence && item.shotIndex !== undefined && (
        <g>
          <rect
            x={mm2px(x + w - dieWidth / 2 - 2)}
            y={mm2px(y + 1)}
            width={mm2px(dieWidth / 2 + 4)}
            height={14}
            fill='rgba(255,255,255,0.8)'
            rx={3}
          />
          <text
            x={mm2px(x + w - 3)}
            y={mm2px(y) + 12}
            fontSize={10}
            fill='#ff6600'
            fontWeight='bold'
            textAnchor='end'
          >
            {item.shotIndex}
          </text>
        </g>
      )}

      {/* SEM 포인트 렌더링 */}
      {showSemPoints && semPoints && semPoints.length > 0 && (
        <g className="sem-points">
          {semPoints.map((sp, idx) => (
            <circle
              key={`sem-${idx}`}
              cx={mm2px(sp.absoluteX)}
              cy={mm2px(sp.absoluteY)}
              r={semPointRadiusPx}
              fill={semPointColor}
              opacity={semPointOpacity}
              stroke="#fff"
              strokeWidth={0.5}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => {
                if (onDieHover) {
                  onDieHover({
                    x: sp.absoluteX,
                    y: sp.absoluteY,
                    value: sp.semPoint.value,
                    fieldIndex,
                  })
                }
              }}
              onMouseLeave={() => {
                if (onDieHoverEnd) {
                  onDieHoverEnd()
                }
              }}
            >
              <title>{`SEM Site ${sp.semPoint.siteSeq}\nValue: ${sp.semPoint.value.toFixed(3)}\nDie: (${sp.dieCol}, ${sp.dieRow})`}</title>
            </circle>
          ))}
        </g>
      )}
      
    </g>
  )
}
