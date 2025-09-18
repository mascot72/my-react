import React, { useEffect, useRef, useState } from 'react'
import { drawHeatmap, generateSampleData, heatmapConfig } from './heatmap'
import styled from 'styled-components'

const ControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.95rem;
`

const WarpChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [radius, setRadius] = useState(heatmapConfig.radius)
  const [power, setPower] = useState(heatmapConfig.power)
  const [minOpacity, setMinOpacity] = useState(heatmapConfig.minOpacity)
  const [maxOpacity, setMaxOpacity] = useState(heatmapConfig.maxOpacity)
  const [count, setCount] = useState(30)
  const [showPoints, setShowPoints] = useState(true)
  const [pointOnTop, setPointOnTop] = useState(true)
  const [dieX, setDieX] = useState(8)
  const [dieY, setDieY] = useState(8)
  const [showGrid, setShowGrid] = useState(true)
  const [isDark, setIsDark] = useState(false)
  // sampleData는 최초 마운트 시 1회만 생성, 이후 유지
  const [sampleData] = useState(() => {
    // 최초 렌더 시 canvas 크기 알 수 없으므로 기본값 사용
    return generateSampleData(count, 400, 400)
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // 바둑판 격자 그리기 함수
  function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, nx: number, ny: number) {
    ctx.save()
    ctx.strokeStyle = isDark ? '#888' : '#444'
    ctx.lineWidth = 1
    for (let i = 0; i <= nx; i++) {
      const x = (width / nx) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let j = 0; j <= ny; j++) {
      const y = (height / ny) * j
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    ctx.restore()
  }

  // 검정색 포인트 그리기 함수
  function drawPoints(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[], top: boolean) {
    if (!points.length) return
    if (!top) ctx.save()
    ctx.fillStyle = '#000'
    points.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
      ctx.fill()
    })
    if (!top) ctx.restore()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      // 부모 크기 기준으로 canvas 크기 설정 (clip)
      const parent = canvas.parentElement
      const w = parent ? parent.offsetWidth : 400
      const h = parent ? parent.offsetHeight : 400
      canvas.width = w
      canvas.height = h
      // sampleData는 최초 생성된 값 사용
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, w, h)
      ctx.clip()
      // 2. 포인트 레이어 (아래)
      if (showPoints && !pointOnTop) drawPoints(ctx, sampleData, false)
      // 3. heatmap 레이어
      drawHeatmap(canvas, sampleData, {
        ...heatmapConfig,
        radius,
        power,
        minOpacity,
        maxOpacity,
      })
      // 4. 포인트 레이어 (위)
      if (showPoints && pointOnTop) drawPoints(ctx, sampleData, true)
      // 5. 격자 레이어 (맨 위)
      if (showGrid) drawGrid(ctx, w, h, dieX, dieY)
      ctx.restore()
    }
    // 언마운트 시 자원 릴리즈
    return () => {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius, power, minOpacity, maxOpacity, showPoints, pointOnTop, dieX, dieY, showGrid, isDark])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ControlPanel style={{ color: isDark ? '#eee' : '#222' }}>
        <label>
          반경(radius):&nbsp;
          <input type='range' min={10} max={400} value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
          {radius}
        </label>
        <label>
          영향력(power):&nbsp;
          <input type='range' min={1} max={20} value={power} onChange={(e) => setPower(Number(e.target.value))} />
          {power}
        </label>
        <label>
          최소 투명도(minOpacity):&nbsp;
          <input
            type='range'
            min={0}
            max={1}
            step={0.01}
            value={minOpacity}
            onChange={(e) => setMinOpacity(Number(e.target.value))}
          />
          {minOpacity}
        </label>
        <label>
          최대 투명도(maxOpacity):&nbsp;
          <input
            type='range'
            min={0.1}
            max={1}
            step={0.01}
            value={maxOpacity}
            onChange={(e) => setMaxOpacity(Number(e.target.value))}
          />
          {maxOpacity}
        </label>
        <label>
          데이터 개수:&nbsp;
          <input type='number' min={5} max={200} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </label>
        <label>
          <input type='checkbox' checked={showPoints} onChange={(e) => setShowPoints(e.target.checked)} /> 포인트 표시
        </label>
        <label>
          <input type='checkbox' checked={pointOnTop} onChange={(e) => setPointOnTop(e.target.checked)} /> 포인트를 위에
          표시
        </label>
        <label>
          가로 die:&nbsp;
          <input
            type='number'
            min={1}
            max={32}
            value={dieX}
            onChange={(e) => setDieX(Number(e.target.value))}
            style={{ width: 40 }}
          />
        </label>
        <label>
          세로 die:&nbsp;
          <input
            type='number'
            min={1}
            max={32}
            value={dieY}
            onChange={(e) => setDieY(Number(e.target.value))}
            style={{ width: 40 }}
          />
        </label>
        <label>
          <input type='checkbox' checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} /> 격자(바둑판) 표시
        </label>
      </ControlPanel>
      <div
        style={{
          width: '100%',
          height: 'calc(100% - 80px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: isDark ? '#222' : '#fff',
          overflow: 'hidden',
        }}>
        <canvas
          ref={canvasRef}
          style={{
            border: isDark ? '1px solid #444' : '1px solid #eee',
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}

export default WarpChart
