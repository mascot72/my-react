import React from 'react'
import type { MergeGroup } from '../types'

interface MergeGroupRectProps {
  group: MergeGroup
  mm2px: (mm: number) => number
  cduToColor: (v: number | null) => string
  showValues: boolean
}

export const MergeGroupRect: React.FC<MergeGroupRectProps> = ({
  group,
  mm2px,
  cduToColor,
  showValues,
}) => {
  return (
    <g key={`mg-${group.id}`}>
      <rect
        x={mm2px(group.xMin)}
        y={mm2px(group.yMin)}
        width={mm2px(group.xMax - group.xMin)}
        height={mm2px(group.yMax - group.yMin)}
        fill={cduToColor(group.cdu)}
        stroke='none'
      />
      {group.cdu != null && showValues && (
        <text
          x={mm2px((group.xMin + group.xMax) / 2)}
          y={mm2px((group.yMin + group.yMax) / 2)}
          textAnchor='middle'
          alignmentBaseline='middle'
          fontSize={12}
          fill='#111'
          style={{ userSelect: 'none' }}>
          {group.cdu.toFixed(2)}
        </text>
      )}
    </g>
  )
}
