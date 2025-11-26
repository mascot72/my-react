import React from 'react'

interface ColorBarProps {
  waferRadius: number
  mm2px: (mm: number) => number
}

export const ColorBar: React.FC<ColorBarProps> = ({ waferRadius, mm2px }) => {
  return (
    <>
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
    </>
  )
}
