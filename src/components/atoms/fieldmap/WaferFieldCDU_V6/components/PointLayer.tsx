import React from 'react'
import type { DiePoint, FieldPoint } from '../types'

interface PointLayerProps {
  diePoints?: DiePoint[]
  fieldPoints?: FieldPoint[]
  mm2px: (mm: number) => number
  cduToColor: (v: number | null) => string
  diePointRadiusPx?: number
  fieldPointRadiusPx?: number
}

export const PointLayer: React.FC<PointLayerProps> = ({
  diePoints = [],
  fieldPoints = [],
  mm2px,
  cduToColor,
  diePointRadiusPx = 2,
  fieldPointRadiusPx = 3,
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
          fillOpacity={0.5}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={0.5}
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
          stroke="rgba(0,0,0,0.25)"
          strokeWidth={0.4}
        />
      ))}
    </g>
  )
}
