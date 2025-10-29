import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

const WaferFieldCDUChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return
    const chart = echarts.init(chartRef.current)

    // === 웨이퍼 및 필드 파라미터 ===
    const waferRadius = 150 // mm (300mm wafer)
    const fieldWidth = 26
    const fieldHeight = 33
    const scale = 2 // mm -> px
    const radiusPx = waferRadius * scale

    // CDU 색상 매핑
    const getColor = (v: number) => {
      const ratio = (v + 5) / 10
      if (ratio < 0.25) return '#00f'
      if (ratio < 0.5) return '#0ff'
      if (ratio < 0.75) return '#0f0'
      if (ratio < 0.9) return '#ff0'
      return '#f00'
    }

    // === 필드 리스트 생성 ===
    const cols = Math.ceil((waferRadius * 2) / fieldWidth)
    const rows = Math.ceil((waferRadius * 2) / fieldHeight)
    const fields: { x: number; y: number; cdu: number }[] = []

    for (let r = -rows / 2; r < rows / 2; r++) {
      for (let c = -cols / 2; c < cols / 2; c++) {
        const cx = c * fieldWidth
        const cy = r * fieldHeight

        // 필드 네 꼭짓점 (mm)
        const corners = [
          [cx - fieldWidth / 2, cy - fieldHeight / 2],
          [cx + fieldWidth / 2, cy - fieldHeight / 2],
          [cx - fieldWidth / 2, cy + fieldHeight / 2],
          [cx + fieldWidth / 2, cy + fieldHeight / 2],
        ]

        // 모든 꼭짓점이 웨이퍼 안쪽인지 검사
        const inside = corners.every(([x, y]) => Math.sqrt(x * x + y * y) < waferRadius)
        if (!inside) continue

        const cdu = Math.random() * 10 - 5 // -5~+5 nm
        fields.push({ x: cx, y: cy, cdu })
      }
    }

    // === ECharts Custom Series Option ===
    const option: echarts.EChartsOption = {
      backgroundColor: '#111',
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const { data } = params
          return `
            <b>Field</b><br/>
            X: ${data.x.toFixed(1)} mm<br/>
            Y: ${data.y.toFixed(1)} mm<br/>
            CDU: ${data.cdu.toFixed(2)} nm
          `
        },
      },
      xAxis: {
        min: -waferRadius,
        max: waferRadius,
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        min: -waferRadius,
        max: waferRadius,
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
      },
      series: [
        // === 웨이퍼 외곽 ===
        {
          type: 'custom',
          name: 'wafer',
          renderItem: (params, api) => {
            const cx = api.coord([0, 0])[0]
            const cy = api.coord([0, 0])[1]
            const r = waferRadius * scale
            return {
              type: 'circle',
              shape: { cx, cy, r },
              style: { stroke: '#aaa', lineWidth: 2, fill: 'none' },
            }
          },
          data: [0],
          z: 1,
        },
        // === 필드 표시 ===
        {
          type: 'custom',
          name: 'field',
          renderItem: (params, api) => {
            const dataIndex = params.dataIndex
            const f = fields[dataIndex]
            const x = api.coord([f.x, f.y])[0]
            const y = api.coord([f.x, f.y])[1]

            return {
              type: 'rect',
              shape: {
                x: x - (fieldWidth * scale) / 2,
                y: y - (fieldHeight * scale) / 2,
                width: fieldWidth * scale,
                height: fieldHeight * scale,
              },
              style: {
                fill: getColor(f.cdu),
                stroke: '#333',
              },
            }
          },
          encode: { x: 0, y: 1 },
          data: fields,
          z: 2,
          emphasis: {
            itemStyle: {
              stroke: '#fff',
              lineWidth: 1.5,
            },
          },
        },
      ],
    }

    chart.setOption(option)

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [])

  return <div ref={chartRef} style={{ width: '600px', height: '600px' }} />
}

export default WaferFieldCDUChart
