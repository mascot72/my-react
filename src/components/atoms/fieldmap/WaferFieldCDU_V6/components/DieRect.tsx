import React from 'react'
import type { Die } from '../types'

interface DieRectProps {
  die: Die
  dieWidth: number
  dieHeight: number
  mm2px: (mm: number) => number
  cduToColor: (v: number | null) => string
  showValues: boolean
  showDieIndex?: boolean
  showDieSequence?: boolean
  fieldIndex?: number
  onDieHover?: (info: { x: number; y: number; value: number | null; fieldIndex?: number; dieIndex?: number; dieSequence?: number }) => void
  onHoverEnd?: () => void
}

export const DieRect: React.FC<DieRectProps> = ({
  die,
  dieWidth,
  dieHeight,
  mm2px,
  cduToColor,
  showValues,
  showDieIndex = false,
  showDieSequence = false,
  fieldIndex,
  onDieHover,
  onHoverEnd,
}) => {
  const dieKey = `die-${die.dieIndex}`

  return (
    <g key={dieKey}>
      <rect
        x={mm2px(die.x - dieWidth / 2)}
        y={mm2px(die.y - dieHeight / 2)}
        width={mm2px(dieWidth)}
        height={mm2px(dieHeight)}
        fill={die.cdu == null ? '#fff' : cduToColor(die.cdu)}
        stroke={die.cdu == null ? '#ddddddff' : 'rgba(0, 0, 0, 0.1)'}
        strokeWidth={0.3}
        onMouseEnter={() => onDieHover && onDieHover({ x: die.x, y: die.y, value: die.cdu ?? null, fieldIndex, dieIndex: die.dieIndex, dieSequence: die.dieSequence })}
        onMouseMove={() => onDieHover && onDieHover({ x: die.x, y: die.y, value: die.cdu ?? null, fieldIndex, dieIndex: die.dieIndex, dieSequence: die.dieSequence })}
        onMouseLeave={() => onHoverEnd && onHoverEnd()}
      />
      {die.cdu != null && showValues && (
        <text
          x={mm2px(die.x)}
          y={mm2px(die.y)}
          textAnchor='middle'
          alignmentBaseline='middle'
          fontSize={10}
          fill='#111'>
          {die.cdu.toFixed(2)}
        </text>
      )}
      {/* die index 표시 (좌상단) - left-bottom to right-top */}
      {showDieIndex && die.dieIndex !== undefined && (
        <text
          x={mm2px(die.x - dieWidth / 2 + 1)}
          y={mm2px(die.y - dieHeight / 2 + 2)}
          fontSize={8}
          fill='#666'
          opacity={0.5}>
          D{die.dieIndex}
        </text>
      )}
      {/* die sequence 표시 (우하단) - left-top to right-bottom */}
      {showDieSequence && die.dieSequence !== undefined && (
        <text
          x={mm2px(die.x + dieWidth / 2 - 1)}
          y={mm2px(die.y + dieHeight / 2 - 1)}
          fontSize={8}
          fill='#0066ff'
          opacity={0.7}
          textAnchor='end'>
          S{die.dieSequence}
        </text>
      )}
    </g>
  )
}
