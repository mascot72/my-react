const MainContentContainer = styled.div`
  display: grid;
  // grid-template-columns: repeat(2, 1fr);
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  // grid-template-rows: repeat(2, minmax(320px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
`

const Chart = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  padding: 24px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  max-height: 420px;
  overflow: auto;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px) scale(1.01);
  }
`
import React from 'react'
import styled from 'styled-components'
import ThicknessChart from './ThicknessChart'
import SbirChart from './SbirChart'
import BowChart from './BowChartFile'
import WarpChart from '../HeatMap/WarpChart'

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
      <Chart style={{ width: '550px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div>WarpChart</div>
        <WarpChart />
      </Chart>
    </MainContentContainer>
  )
}

export default MainContent
