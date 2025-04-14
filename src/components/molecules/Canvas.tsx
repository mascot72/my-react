import React, { useEffect, useRef } from 'react'

interface GradientPoint {
  x: number
  y: number
  color: string
}

interface GradientCanvasProps {
  points: GradientPoint[]
  width: number
  height: number
  scale: number // New prop to control gradient overlap
}

const GradientCanvas: React.FC<GradientCanvasProps> = ({ points, width, height, scale }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear the canvas
    ctx.clearRect(0, 0, width, height)

    // Apply a blur filter for smooth blending
    ctx.filter = 'blur(50px)'

    // Set blending mode to make gradients mix naturally
    ctx.globalCompositeOperation = 'lighter'

    // Draw gradients with dynamic radius based on scale
    points.forEach((point) => {
      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        width * scale, // Use scale to adjust gradient radius
      )
      gradient.addColorStop(0, point.color)
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    })

    // Reset filter and blending mode
    ctx.filter = 'none'
    ctx.globalCompositeOperation = 'source-over'

    // Draw black dots at gradient centers
    points.forEach((point) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, width / 160, 0, Math.PI * 2) // Adjust dot size
      ctx.fillStyle = 'black'
      ctx.fill()
    })
  }, [points, width, height, scale])

  return <canvas ref={canvasRef} width={width} height={height} style={{ border: '1px solid #ccc' }} />
}

export default GradientCanvas
