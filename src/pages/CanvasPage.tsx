import React from 'react'
import GradientCanvas from '../components/molecules/Canvas'

const originalPoints = [
  { x: 200, y: 200, color: 'red' },
  { x: 600, y: 340, color: 'blue' },
  { x: 200, y: 600, color: 'green' },
  { x: 600, y: 500, color: 'yellow' },
  { x: 410, y: 780, color: 'purple' },
  { x: 670, y: 324, color: 'olive' },
  { x: 410, y: 780, color: 'orange' },
]
const CanvasPage: React.FC = () => {
  const width = 400 // Half of the original width
  const height = 400 // Half of the original height
  const scale = 0.5 // Adjust this value to control gradient overlap

  const points = originalPoints.map((point) => ({
    x: point.x / 2,
    y: point.y / 2,
    color: point.color,
  }))

  return (
    <div>
      <GradientCanvas points={points} width={width} height={height} scale={scale} />
    </div>
  )
}

export default CanvasPage
