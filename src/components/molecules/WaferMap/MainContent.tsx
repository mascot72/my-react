import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import ThicknessChart from './ThicknessChart'
import SbirChart from './SbirChart'
import BowChart from './BowChartFile'
import { drawHeatmap, generateWaferSampleData, heatmapConfig } from './heatmap'

const MainContentContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  height: 100%;
`

const Chart = styled.div`
  background-color: white;
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  width: 100%;
  height: 350px;
`

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

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      const sampleData = generateWaferSampleData(count, canvas.width, canvas.height)
      drawHeatmap(canvas, sampleData, {
        ...heatmapConfig,
        radius,
        power,
        minOpacity,
        maxOpacity,
      })
    }
  }, [radius, power, minOpacity, maxOpacity, count])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ControlPanel>
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
      </ControlPanel>
      <div
        style={{
          width: '100%',
          height: 'calc(100% - 80px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <canvas ref={canvasRef} style={{ border: '1px solid #eee', width: '90%', height: '90%' }} />
      </div>
    </div>
  )
}

const MainContent: React.FC = () => {
  return (
    <MainContentContainer>
      <Chart>
        <SbirChart />
      </Chart>
      <Chart>
        <ThicknessChart />
      </Chart>
      <Chart>
        <BowChart />
      </Chart>
      <Chart>
        <WarpChart />
      </Chart>
    </MainContentContainer>
  )
}

export default MainContent
