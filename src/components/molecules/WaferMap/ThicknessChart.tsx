import React from 'react'
import styled from 'styled-components'

const ChartContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 90%;
  position: relative;
`

const GridLines = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`

const WaferSVG = styled.svg`
  position: relative;
  z-index: 2;
`

const AxisLabels = styled.div`
  position: absolute;
  font-size: 0.8rem;
  color: #000;
  z-index: 3;
`

const TopLabels = styled(AxisLabels)`
  top: 0;
  left: 10%;
  display: flex;
  justify-content: space-between;
  width: 80%;
`

const LeftLabels = styled(AxisLabels)`
  top: 10%;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 80%;
`

const ThicknessChart: React.FC = () => {
  const curve1 = [10, 20, 30, 40, 50, 40, 30, 20, 10] // Example curve data for top
  const curve2 = [10, 15, 25, 35, 45, 35, 25, 15, 10] // Example curve data for bottom

  return (
    <ChartContainer>
      {/* Top axis labels */}
      <TopLabels>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={`top-label-${i}`}>{i * 10}</span>
        ))}
      </TopLabels>

      {/* Left axis labels */}
      <LeftLabels>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={`left-label-${i}`}>{100 - i * 10}</span>
        ))}
      </LeftLabels>

      {/* Grid lines */}
      <GridLines xmlns='http://www.w3.org/2000/svg'>
        {/* Horizontal lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h-${i}`} x1='0' y1={`${i * 10}%`} x2='100%' y2={`${i * 10}%`} stroke='#ccc' strokeWidth='0.5' />
        ))}
        {/* Vertical lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v-${i}`} x1={`${i * 10}%`} y1='0' x2={`${i * 10}%`} y2='100%' stroke='#ccc' strokeWidth='0.5' />
        ))}
      </GridLines>

      {/* Wafer SVG */}
      <WaferSVG width='100%' height='100%' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
        {/* Circle representing the wafer */}
        <circle cx='50' cy='50' r='45' fill='url(#gradient)' stroke='black' strokeWidth='1' />

        {/* Gradient for the wafer */}
        <defs>
          <radialGradient id='gradient' cx='50%' cy='50%' r='50%'>
            <stop offset='0%' stopColor='red' />
            <stop offset='50%' stopColor='yellow' />
            <stop offset='100%' stopColor='blue' />
          </radialGradient>
        </defs>

        {/* Text in the center */}
        <text x='50%' y='50%' textAnchor='middle' dy='.3em' fontSize='10' fill='white'>
          591.89
        </text>

        {/* Top curve */}
        <path
          d={`M 5 50 ${curve1.map((y, i) => `L ${5 + i * 10} ${50 - y / 2}`).join(' ')} L 95 50`}
          fill='none'
          stroke='black'
          strokeWidth='0.5'
        />

        {/* Bottom curve */}
        <path
          d={`M 5 50 ${curve2.map((y, i) => `L ${5 + i * 10} ${50 + y / 2}`).join(' ')} L 95 50`}
          fill='none'
          stroke='black'
          strokeWidth='0.5'
        />
      </WaferSVG>
    </ChartContainer>
  )
}

export default ThicknessChart
