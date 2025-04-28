import React from 'react'
import styled from 'styled-components'
import ThicknessChart from './ThicknessChart'
import SbirChart from './SbirChart'
import BowChart from './BowChartFile'

const MainContentContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`

const Chart = styled.div`
  background-color: white;
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
`

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
      <Chart>WARP</Chart>
    </MainContentContainer>
  )
}

export default MainContent
