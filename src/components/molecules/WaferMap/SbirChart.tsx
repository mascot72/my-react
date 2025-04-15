import React from 'react'
import styled from 'styled-components'

const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
`

const WaferContainer = styled.div`
  position: relative;
  width: 80%;
  height: 80%;
`

const WaferSVG = styled.svg`
  width: 100%;
  height: 100%;
`

const Cell = styled.rect`
  stroke: #ccc;
  stroke-width: 0.5;
`

const ValueLabel = styled.text`
  font-size: 0.6rem;
  text-anchor: middle;
  dominant-baseline: middle;
  fill: white;
`

const GraphContainer = styled.div`
  width: 100%;
  height: 20%;
  border-top: 1px solid #ccc;
`

const SbirChart: React.FC = () => {
  const data = [
    [0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1],
    [0.2, 0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.3, 0.2],
    [0.3, 0.4, 0.5, 0.6, 0.7, 0.6, 0.5, 0.4, 0.3],
    [0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4],
    [0.5, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.5],
    [0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4],
    [0.3, 0.4, 0.5, 0.6, 0.7, 0.6, 0.5, 0.4, 0.3],
    [0.2, 0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.3, 0.2],
    [0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1],
  ]

  const colorScale = (value: number): string => {
    if (value < 0.3) return 'blue'
    if (value < 0.6) return 'green'
    return 'red'
  }

  return (
    <ChartContainer>
      <WaferContainer>
        <WaferSVG viewBox='0 0 100 100'>
          {data.map((row, i) =>
            row.map((value, j) => (
              <React.Fragment key={`${i}-${j}`}>
                <Cell x={j * 10} y={i * 10} width='10' height='10' fill={colorScale(value)} />
                {/* Display value in the center cell */}
                {i === 4 && j === 4 && (
                  <ValueLabel x={j * 10 + 5} y={i * 10 + 5}>
                    {value.toFixed(1)}
                  </ValueLabel>
                )}
              </React.Fragment>
            )),
          )}
        </WaferSVG>
      </WaferContainer>
      <GraphContainer>{/* Graph will be implemented here */}</GraphContainer>
    </ChartContainer>
  )
}

export default SbirChart
