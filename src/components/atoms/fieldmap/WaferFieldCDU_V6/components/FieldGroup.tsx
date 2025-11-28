import React from 'react'
import type { FieldRenderItem } from '../types'
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
}) => {
  const fieldKey = `field-${fieldIndex}-${item.fieldRect.x}-${item.fieldRect.y}`
  const { x, y, w, h } = item.fieldRect

  return (
    <g key={fieldIndex}>
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
    </g>
  )
}
