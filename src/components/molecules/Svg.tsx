import React from 'react'

interface GradientPoint {
  x: number
  y: number
  color: string
}

interface GradientSVGProps {
  points: GradientPoint[]
  width: number
  height: number
  scale: number // New prop to control gradient overlap
}

const GradientSVG: React.FC<GradientSVGProps> = ({ points, width, height, scale }) => {
  return (
    <div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns='http://www.w3.org/2000/svg'>
        <defs>
          {points.map((point, index) => (
            <radialGradient
              key={`grad-${index}`}
              id={`grad-${index}`}
              cx={`${(point.x / width) * 100}%`}
              cy={`${(point.y / height) * 100}%`}
              r={`${scale * 100}%`}>
              {' '}
              {/* Use scale to adjust gradient radius */}
              <stop offset='0%' stopColor={point.color} stopOpacity='1' />
              <stop offset='100%' stopColor={point.color} stopOpacity='0' />
            </radialGradient>
          ))}
        </defs>

        {/* Apply gradients */}
        {points.map((_, index) => (
          <rect key={`rect-${index}`} width={width} height={height} fill={`url(#grad-${index})`} />
        ))}

        {/* Black dots at gradient centers */}
        {points.map((point, index) => (
          <circle key={`dot-${index}`} cx={point.x} cy={point.y} r={width / 160} fill='black' />
        ))}
      </svg>
    </div>
  )
}

export default GradientSVG
