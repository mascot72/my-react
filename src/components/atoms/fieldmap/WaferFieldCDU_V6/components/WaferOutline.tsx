import React from 'react'

interface WaferOutlineProps {
  cx: number
  cy: number
  radius: number
  mm2px: (mm: number) => number
}

export const WaferOutline: React.FC<WaferOutlineProps> = ({ cx, cy, radius, mm2px }) => {
  return (
    <circle
      cx={mm2px(cx)}
      cy={mm2px(cy)}
      r={mm2px(radius)}
      stroke='#666'
      strokeWidth={1}
      fill='none'
    />
  )
}
