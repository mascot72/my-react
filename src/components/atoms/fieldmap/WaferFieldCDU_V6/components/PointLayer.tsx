import React from 'react'
import type { DiePoint, FieldPoint } from '../types'

interface PointLayerProps {
  diePoints?: DiePoint[]
  fieldPoints?: FieldPoint[]
  mm2px: (mm: number) => number
  cduToColor: (v: number | null) => string
  diePointRadiusPx?: number
  fieldPointRadiusPx?: number
  diePointOpacity?: number
  fieldPointOpacity?: number
  onDieHover?: (info: { x: number; y: number; value: number | null; fieldIndex?: number; dieIndex?: number }) => void
  onFieldHover?: (info: { x: number; y: number; value: number | null; shotIndex?: number }) => void
  onHoverEnd?: () => void
}

export const PointLayer: React.FC<PointLayerProps> = ({
  diePoints = [],
  fieldPoints = [],
  mm2px,
  cduToColor,
  diePointRadiusPx = 2,
  fieldPointRadiusPx = 3,
  diePointOpacity = 0.9,
  fieldPointOpacity = 0.5,
  onDieHover,
  onFieldHover,
  onHoverEnd,
}) => {
  return (
    <g>
      {/* Field 중심 포인트 (배경 레이어로 약하게 표시) */}
      {fieldPoints.map((p, idx) => (
        <circle
          key={`fp-${idx}`}
          cx={mm2px(p.x)}
          cy={mm2px(p.y)}
          r={fieldPointRadiusPx}
          fill={cduToColor(p.value ?? null)}
          fillOpacity={fieldPointOpacity}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={0.5}
          onMouseEnter={() => onFieldHover && onFieldHover({ x: p.x, y: p.y, value: p.value ?? null, shotIndex: p.shotIndex })}
          onMouseMove={() => onFieldHover && onFieldHover({ x: p.x, y: p.y, value: p.value ?? null, shotIndex: p.shotIndex })}
          onMouseLeave={() => onHoverEnd && onHoverEnd()}
        />
      ))}

      {/* Die 포인트 (전경 레이어로 강조) */}
      {diePoints.map((p, idx) => (
        <circle
          key={`dp-${idx}`}
          cx={mm2px(p.x)}
          cy={mm2px(p.y)}
          r={diePointRadiusPx}
          fill={cduToColor(p.value ?? null)}
          fillOpacity={diePointOpacity}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth={0.4}
          onMouseEnter={() => onDieHover && onDieHover({ x: p.x, y: p.y, value: p.value ?? null, fieldIndex: p.fieldIndex, dieIndex: p.dieIndex })}
          onMouseMove={() => onDieHover && onDieHover({ x: p.x, y: p.y, value: p.value ?? null, fieldIndex: p.fieldIndex, dieIndex: p.dieIndex })}
          onMouseLeave={() => onHoverEnd && onHoverEnd()}
        />
      ))}
    </g>
  )
}
