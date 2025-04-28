import React from 'react'
import { WaferContainer } from './styles'
import { GradientFilter, getEnhancedColor, renderDieMap } from './utils'
import type { Point } from './types'

interface WaferProps {
  heatmapData: Point[]
  showPoints: boolean
  showValues: boolean
  showDieMap: boolean
}

const Wafer: React.FC<WaferProps> = ({ heatmapData, showPoints, showValues, showDieMap }) => {
  const minValue = Math.min(...heatmapData.map((p) => p.value))
  const maxValue = Math.max(...heatmapData.map((p) => p.value))

  return (
    <WaferContainer>
      <svg width='100%' height='100%' viewBox='0 0 100 100'>
        <GradientFilter />
        <defs>
          <clipPath id='waferClip'>
            <circle cx='50' cy='50' r='45' />
          </clipPath>
        </defs>
        <g clipPath='url(#waferClip)'>
          {heatmapData.map((point, index) => (
            <circle
              key={`heatmap-${index}`}
              cx={point.x}
              cy={point.y}
              r='1.5'
              fill={getEnhancedColor(point.value, minValue, maxValue)}
              opacity='0.7'
            />
          ))}
          {showDieMap && renderDieMap(heatmapData, minValue, maxValue)}
        </g>
        <circle cx='50' cy='50' r='45' fill='none' stroke='black' strokeWidth='0.5' />
      </svg>
    </WaferContainer>
  )
}

export default Wafer
