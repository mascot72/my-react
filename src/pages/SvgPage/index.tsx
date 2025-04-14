import React, { useState, useEffect } from 'react'
import GradientSVG from '../../components/molecules/Svg'
import GradientCanvas from '../../components/molecules/Canvas'
import './SvgPage.css'

const originalPoints = [
  { x: 200, y: 200, color: 'red' },
  { x: 600, y: 200, color: 'blue' },
  { x: 200, y: 600, color: 'green' },
  { x: 600, y: 600, color: 'yellow' },
]

const SvgPage: React.FC = () => {
  const [showSVG, setShowSVG] = useState(false)
  const [showCanvas, setShowCanvas] = useState(false)

  const width = 400 // Half of the original width
  const height = 400 // Half of the original height
  const scale = 0.5 // Adjust this value to control gradient overlap

  // Scale points to fit the new size
  const points = originalPoints.map((point) => ({
    x: point.x / 2,
    y: point.y / 2,
    color: point.color,
  }))

  useEffect(() => {
    // Show SVG first
    const svgTimer = setTimeout(() => {
      setShowSVG(true)
    }, 500) // 0.5초 후 SVG 표시

    // Show Canvas after SVG
    const canvasTimer = setTimeout(() => {
      setShowCanvas(true)
    }, 1500) // 1.5초 후 Canvas 표시

    return () => {
      clearTimeout(svgTimer)
      clearTimeout(canvasTimer)
    }
  }, [])

  return (
    <div>
      <h1>SVG Example</h1>
      <div className={`fade-in ${showSVG ? 'visible' : ''}`}>
        <GradientSVG points={points} width={width} height={height} scale={scale} />
      </div>
      <h1>Canvas Example</h1>
      <div className={`fade-in ${showCanvas ? 'visible' : ''}`}>
        <GradientCanvas points={points} width={width} height={height} scale={scale} />
      </div>
    </div>
  )
}

export default SvgPage
