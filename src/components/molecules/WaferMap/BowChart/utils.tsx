import React from 'react' // JSX 반환을 위해 React를 import
import type { Point } from './types' // Point 타입 정의를 import

export const generateRandomPoints = (count: number): Point[] => {
  const points: Point[] = []
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * 35 + 10
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    const value = Math.random() * 5 + 1
    points.push({ x, y, value })
  }
  return points
}

export const GradientFilter = () => (
  <defs>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
    </filter>
  </defs>
)

export const getEnhancedColor = (value: number, min: number, max: number): string => {
  if (min === max) return 'hsl(240, 100%, 50%)' // min과 max가 같을 경우 기본 색상 반환
  const ratio = (value - min) / (max - min)
  const hue = ((1 - ratio) * 240).toString(10)
  const saturation = 85 + Math.sin(ratio * Math.PI) * 15
  const lightness = 50 + Math.cos(ratio * Math.PI) * 10
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export const renderDieMap = (heatmapData: Point[], minValue: number, maxValue: number) => {
  const dies: JSX.Element[] = []
  const dieSize = 5
  const dieCount = Math.floor(90 / dieSize)

  for (let i = 0; i < dieCount; i++) {
    for (let j = 0; j < dieCount; j++) {
      const x = i * dieSize
      const y = j * dieSize
      const centerX = x + dieSize / 2
      const centerY = y + dieSize / 2

      const distanceFromCenter = Math.sqrt(Math.pow(centerX - 45, 2) + Math.pow(centerY - 45, 2))
      if (distanceFromCenter <= 45) {
        const pointsInDie = heatmapData.filter(
          (point) => point.x >= x && point.x < x + dieSize && point.y >= y && point.y < y + dieSize,
        )
        const avgValue =
          pointsInDie.length > 0 ? pointsInDie.reduce((sum, p) => sum + p.value, 0) / pointsInDie.length : 0

        dies.push(
          <rect
            key={`die-${i}-${j}`}
            x={x}
            y={y}
            width={dieSize}
            height={dieSize}
            fill={getEnhancedColor(avgValue, minValue, maxValue)}
            stroke="#666"
            strokeWidth="0.2"
            opacity="0.7"
          />,
        )
      }
    }
  }
  return dies
}
