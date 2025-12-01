import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useCDUData, usePointData } from './WaferFieldCDU_V6/hooks'
import type { WaferFieldCDU_V6Props } from './WaferFieldCDU_V6/types'

const WaferFieldCDU_V6ECharts: React.FC<WaferFieldCDU_V6Props> = ({
  cduSeed,
  cduData,
  // controls
  showFullGrid = false,
  fieldArraySize = [14, 13],
  offsetMicrometers = [0, 0],
  fieldSizeMicrometers = [20000, 30000],
  // point mode
  viewPoint = true,
  diePointRadiusPx = 2,
  fieldPointRadiusPx = 3,
  diePointOpacity = 0.9,
  fieldPointOpacity = 0.5,
  showPointLabels = false,
}) => {
  const waferRadius = 150

  const memoFieldSizeMicrometers = useMemo(() => fieldSizeMicrometers ?? [20000, 30000], [fieldSizeMicrometers])
  const fieldWidth = Math.max(1, memoFieldSizeMicrometers[0] / 1000)
  const fieldHeight = Math.max(1, memoFieldSizeMicrometers[1] / 1000)
  const dieCols = 2
  const dieRows = 3

  const fieldStepX = fieldWidth
  const fieldStepY = fieldHeight

  const offsetMmX = offsetMicrometers[0] / 1000
  const offsetMmY = offsetMicrometers[1] / 1000

  const memoFieldArraySize = useMemo(() => fieldArraySize ?? [14, 13], [fieldArraySize])

  const maxFieldCount = Math.max(memoFieldArraySize[0], memoFieldArraySize[1])
  const range = Math.ceil(maxFieldCount / 2) + 1

  const fields = useCDUData({
    waferRadius,
    fieldStepX,
    fieldStepY,
    dieRows,
    dieCols,
    dieWidth: fieldWidth / dieCols,
    dieHeight: fieldHeight / dieRows,
    fieldWidth,
    fieldHeight,
    range,
    fieldArraySize: memoFieldArraySize,
    cduSeed,
    cduData,
    offsetMm: [offsetMmX, offsetMmY],
  })

  const pointDataSet = usePointData({ fields })

  const bbox = useMemo(() => {
    if (fields.length === 0) return { minX: -waferRadius, maxX: waferRadius, minY: -waferRadius, maxY: waferRadius }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    fields.forEach((f) => {
      const x = f.cx - fieldWidth / 2
      const y = f.cy - fieldHeight / 2
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + fieldWidth)
      maxY = Math.max(maxY, y + fieldHeight)
    })
    const pad = 5
    return { minX: minX - pad, maxX: maxX + pad, minY: minY - pad, maxY: maxY + pad }
  }, [fields, fieldWidth, fieldHeight, waferRadius])

  const [minVal, maxVal] = useMemo(() => {
    const vals = pointDataSet.diePoints.map((d) => d.value).filter((v): v is number => v != null)
    if (vals.length === 0) return [-1, 1]
    return [Math.min(...vals), Math.max(...vals)]
  }, [pointDataSet.diePoints])

  const dieSeriesData = useMemo(() => (
    pointDataSet.diePoints.map((p) => ({
      value: [p.x, p.y, p.value],
      // 보조 정보는 tooltip에서 사용 가능
      fieldIndex: p.fieldIndex,
      dieIndex: p.dieIndex,
    }))
  ), [pointDataSet.diePoints])

  const fieldSeriesData = useMemo(() => (
    pointDataSet.fieldPoints.map((p) => ({ value: [p.x, p.y, p.value], shotIndex: p.shotIndex }))
  ), [pointDataSet.fieldPoints])

  const option = useMemo(() => {
    return {
      backgroundColor: '#ffffff',
      animation: false,
      title: { text: 'Wafer Field CDU (ECharts)', left: 'center' },
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p = params as { seriesName?: string; data?: any }
          const v = p.data?.value?.[2]
          const label = p.seriesName === 'Die' ? `Die ${p.data?.dieIndex ?? ''}` : (p.data?.shotIndex != null ? `Shot ${p.data?.shotIndex}` : 'Field')
          const valStr = v == null ? 'N/A' : Number(v).toFixed(3)
          return `${label}<br/>CDU: ${valStr}<br/>X: ${p.data?.value?.[0]}, Y: ${p.data?.value?.[1]}`
        },
      },
      grid: { left: 40, right: 20, top: 60, bottom: 40, containLabel: false },
      xAxis: {
        type: 'value',
        min: showFullGrid ? bbox.minX : Math.min(bbox.minX, -waferRadius),
        max: showFullGrid ? bbox.maxX : Math.max(bbox.maxX, waferRadius),
        axisLine: { onZero: false },
        splitLine: { show: true, lineStyle: { color: '#eee' } },
        name: 'mm',
      },
      yAxis: {
        type: 'value',
        min: showFullGrid ? bbox.minY : Math.min(bbox.minY, -waferRadius),
        max: showFullGrid ? bbox.maxY : Math.max(bbox.maxY, waferRadius),
        axisLine: { onZero: false },
        splitLine: { show: true, lineStyle: { color: '#eee' } },
        name: 'mm',
        scale: true,
      },
      visualMap: [
        {
          show: true,
          type: 'continuous',
          min: minVal,
          max: maxVal,
          dimension: 2, // value index
          calculable: true,
          inRange: {
            color: ['#0033ff', '#66cc66', '#ff3300'],
          },
          left: 10,
          bottom: 10,
        },
      ],
      series: [
        // Field points (밑 레이어)
        viewPoint ? {
          name: 'Field',
          type: 'scatter',
          data: fieldSeriesData,
          symbolSize: fieldPointRadiusPx * 2,
          itemStyle: { opacity: fieldPointOpacity },
          encode: { x: 0, y: 1 },
          label: showPointLabels ? {
            show: true,
            formatter: (arg: unknown) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const p = arg as { data?: any }
              return p.data?.value?.[2] == null ? 'N/A' : Number(p.data.value[2]).toFixed(3)
            },
            position: 'top',
            fontSize: 10,
            color: '#222',
          } : undefined,
          z: 2,
        } : undefined,
        // Die points (위 레이어)
        viewPoint ? {
          name: 'Die',
          type: 'scatter',
          data: dieSeriesData,
          symbolSize: diePointRadiusPx * 2,
          itemStyle: { opacity: diePointOpacity },
          encode: { x: 0, y: 1 },
          label: showPointLabels ? {
            show: true,
            formatter: (arg: unknown) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const p = arg as { data?: any }
              return p.data?.value?.[2] == null ? 'N/A' : Number(p.data.value[2]).toFixed(3)
            },
            position: 'bottom',
            fontSize: 10,
            color: '#222',
          } : undefined,
          z: 3,
        } : undefined,
      ].filter(Boolean),
    }
  }, [bbox, showFullGrid, waferRadius, minVal, maxVal, fieldSeriesData, dieSeriesData, viewPoint, fieldPointRadiusPx, diePointRadiusPx, fieldPointOpacity, diePointOpacity, showPointLabels])

  return (
    <div style={{ width: 900, height: 900 }}>
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

export default WaferFieldCDU_V6ECharts
