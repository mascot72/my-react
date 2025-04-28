import React, { useState, useMemo } from 'react'
import { ChartContainer, GraphContainer } from './styles'
import Controls from './Controls'
import TopLabels from './TopLabels'
import LeftLabels from './LeftLabels'
import Grid from './Grid'
import Wafer from './Wafer'
import Graph from './Graph'
import { generateRandomPoints } from './utils'
import type { Point } from './types'

const BowChart: React.FC = () => {
  const [showPoints, setShowPoints] = useState(true)
  const [showValues, setShowValues] = useState(true)
  const [showDieMap, setShowDieMap] = useState(true)

  const heatmapData: Point[] = useMemo(() => generateRandomPoints(15), [])

  return (
    <ChartContainer>
      <Controls
        showPoints={showPoints}
        setShowPoints={setShowPoints}
        showValues={showValues}
        setShowValues={setShowValues}
        showDieMap={showDieMap}
        setShowDieMap={setShowDieMap}
      />
      <TopLabels />
      <LeftLabels />
      <Grid />
      <Wafer heatmapData={heatmapData} showPoints={showPoints} showValues={showValues} showDieMap={showDieMap} />
      <GraphContainer>
        <Graph data={heatmapData} />
      </GraphContainer>
    </ChartContainer>
  )
}

export default BowChart
