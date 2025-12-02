import React from 'react'
import ReactECharts from 'echarts-for-react'
import type { WaferFieldCDU_V6Props } from '../WaferFieldCDU_V6/types'
import { useWaferEChartsOption } from './hooks/useWaferEChartsOption'

const WaferFieldCDU_V6ECharts: React.FC<WaferFieldCDU_V6Props> = (props) => {
  const { option, containerWidthPx, containerHeightPx } = useWaferEChartsOption(props)
  return (
    <div style={{ width: containerWidthPx, height: containerHeightPx }}>
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} notMerge={true} lazyUpdate={false} />
    </div>
  )
}

export default WaferFieldCDU_V6ECharts
