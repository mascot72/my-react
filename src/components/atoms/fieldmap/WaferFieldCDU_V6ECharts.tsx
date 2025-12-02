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
  showValues = false,
  viewShotSequence = false,
  viewDieSequence = false,
  viewDieIndex = false,
  // point mode
  viewPoint = true,
  diePointRadiusPx = 2,
  fieldPointRadiusPx = 3,
  diePointOpacity = 0.9,
  fieldPointOpacity = 0.5,
  showPointLabels = false,
  showOutlinesInPointMode = true,
  centerAxisCoordinates = true,
  gridLineColor = '#eeeeee',
  gridLineWidth = 1,
  fitToContent = true,
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
    // Prepare outline data
    const fieldRects = fields.map((f) => ({
      x: f.cx - fieldWidth / 2,
      y: f.cy - fieldHeight / 2,
      w: fieldWidth,
      h: fieldHeight,
      shotIndex: f.shotIndex,
      cx: f.cx,
      cy: f.cy,
    }))
    
    // Helper: check if all 4 corners of rect lie inside wafer circle
    const isRectFullyInsideCircle = (rect: { x: number; y: number; w: number; h: number }) => {
      const cx = offsetMmX
      const cy = offsetMmY
      const r = waferRadius
      const corners: [number, number][] = [
        [rect.x, rect.y],
        [rect.x + rect.w, rect.y],
        [rect.x, rect.y + rect.h],
        [rect.x + rect.w, rect.y + rect.h],
      ]
      return corners.every(([px, py]) => {
        const dx = px - cx
        const dy = py - cy
        return dx * dx + dy * dy <= r * r + 1e-9
      })
    }

    const includedFieldRects = fieldRects.filter(isRectFullyInsideCircle)

    const dieRectsRaw = fields.flatMap((f) =>
      f.dies.map((d, idx) => ({
        x: d.x - fieldWidth / dieCols / 2,
        y: d.y - fieldHeight / dieRows / 2,
        w: fieldWidth / dieCols,
        h: fieldHeight / dieRows,
        value: d.cdu,
        dieIndex: d.dieIndex ?? idx,
        dieSequence: d.dieSequence ?? idx,
      }))
    )
    const includedDieRects = dieRectsRaw.filter(isRectFullyInsideCircle)

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
        min: (showFullGrid ? bbox.minX : (fitToContent ? bbox.minX : Math.min(bbox.minX, -waferRadius))),
        max: (showFullGrid ? bbox.maxX : (fitToContent ? bbox.maxX : Math.max(bbox.maxX, waferRadius))),
        axisLine: { onZero: false },
        splitLine: { show: true, lineStyle: { color: gridLineColor, width: gridLineWidth } },
        axisLabel: {
          formatter: (val: number) => centerAxisCoordinates ? (val - offsetMmX).toFixed(0) : String(val),
          color: '#555',
          fontSize: 11,
        },
        name: centerAxisCoordinates ? 'ΔX (mm)' : 'X (mm)',
      },
      yAxis: {
        type: 'value',
        min: (showFullGrid ? bbox.minY : (fitToContent ? bbox.minY : Math.min(bbox.minY, -waferRadius))),
        max: (showFullGrid ? bbox.maxY : (fitToContent ? bbox.maxY : Math.max(bbox.maxY, waferRadius))),
        axisLine: { onZero: false },
        splitLine: { show: true, lineStyle: { color: gridLineColor, width: gridLineWidth } },
        axisLabel: {
          formatter: (val: number) => centerAxisCoordinates ? (val - offsetMmY).toFixed(0) : String(val),
          color: '#555',
          fontSize: 11,
        },
        name: centerAxisCoordinates ? 'ΔY (mm)' : 'Y (mm)',
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
        // Rect mode labels (values / indices / sequences)
        ...(!viewPoint && showValues ? [{
          name: 'DieValueLabels',
          type: 'scatter',
          data: includedDieRects.map((dr) => [dr.x + dr.w / 2, dr.y + dr.h / 2, dr.value]),
          symbolSize: 1,
          itemStyle: { color: 'transparent' },
          label: {
            show: true,
            formatter: (arg: unknown) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const p = arg as any
              const v = p.data?.[2]
              return v == null ? 'N/A' : Number(v).toFixed(3)
            },
            position: 'inside',
            color: '#111',
            fontSize: 10,
          },
          encode: { x: 0, y: 1, value: 2 },
          z: 12,
        }] : []),
        ...(!viewPoint && viewDieIndex ? [{
          name: 'DieIndexLabels',
          type: 'scatter',
          data: includedDieRects.map((dr) => [dr.x + dr.w / 2, dr.y + dr.h / 2, dr.dieIndex]),
          symbolSize: 1,
          itemStyle: { color: 'transparent' },
          label: { show: true, formatter: '{@[2]}', position: 'inside', color: '#2b6cb0', fontSize: 10 },
          z: 12,
        }] : []),
        ...(!viewPoint && viewDieSequence ? [{
          name: 'DieSequenceLabels',
          type: 'scatter',
          data: includedDieRects.map((dr) => [dr.x + dr.w / 2, dr.y + dr.h / 2, dr.dieSequence]),
          symbolSize: 1,
          itemStyle: { color: 'transparent' },
          label: { show: true, formatter: '{@[2]}', position: 'inside', color: '#b02b6c', fontSize: 10 },
          z: 12,
        }] : []),
        ...(viewShotSequence ? [{
          name: 'ShotLabels',
          type: 'scatter',
          data: includedFieldRects.map((fr) => [fr.cx, fr.cy, fr.shotIndex]),
          symbolSize: 2,
          itemStyle: { color: 'transparent' },
          label: { show: true, formatter: '{@[2]}', position: 'top', color: '#666', fontSize: 11 },
          z: 11,
        }] : []),
        // Outlines (conditional)
        ...(showOutlinesInPointMode ? [
          {
            name: 'WaferOutline',
            type: 'custom',
            renderItem: (_params: unknown, api: unknown) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const a = api as any
              const center = a.coord([offsetMmX, offsetMmY])
              const r1 = a.size([waferRadius, 0])[0]
              return {
                type: 'circle',
                shape: { cx: center[0], cy: center[1], r: r1 },
                style: { stroke: '#333', fill: 'none', lineWidth: 1.2 },
              }
            },
            data: [[offsetMmX, offsetMmY]],
            z: 10,
          },
          {
            name: 'FieldOutlines',
            type: 'custom',
            renderItem: (params: unknown, api: unknown) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const a = api as any
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const idx = (params as any).dataIndex
              const fr = includedFieldRects[idx]
              const p1 = a.coord([fr.x, fr.y])
              const p2 = a.coord([fr.x + fr.w, fr.y + fr.h])
              const x = p1[0]
              const y = p1[1]
              const w = p2[0] - p1[0]
              const h = p2[1] - p1[1]
              return {
                type: 'rect',
                shape: { x, y, width: w, height: h },
                style: { stroke: '#c1c6cc', fill: 'none', lineWidth: 0.9 },
              }
            },
            data: includedFieldRects.map((_, i) => i),
            z: 9,
          },
          {
            name: 'DieOutlines',
            type: 'custom',
            renderItem: (params: unknown, api: unknown) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const a = api as any
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const idx = (params as any).dataIndex
              const dr = includedDieRects[idx]
              const p1 = a.coord([dr.x, dr.y])
              const p2 = a.coord([dr.x + dr.w, dr.y + dr.h])
              const x = p1[0]
              const y = p1[1]
              const w = p2[0] - p1[0]
              const h = p2[1] - p1[1]
              return {
                type: 'rect',
                shape: { x, y, width: w, height: h },
                style: { stroke: 'rgba(0,0,0,0.18)', fill: 'none', lineWidth: 0.3 },
              }
            },
            data: includedDieRects.map((_, i) => i),
            z: 8,
          },
        ] : []),
        // Die filled rects (use visualMap color)
        {
          name: 'DieFill',
          type: 'custom',
          renderItem: (params: unknown, api: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const a = api as any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const idx = (params as any).dataIndex
            const dr = includedDieRects[idx]
            const p1 = a.coord([dr.x, dr.y])
            const p2 = a.coord([dr.x + dr.w, dr.y + dr.h])
            const x = p1[0]
            const y = p1[1]
            const w = p2[0] - p1[0]
            const h = p2[1] - p1[1]
            return {
              type: 'rect',
              shape: { x, y, width: w, height: h },
              style: { fill: a.visual('color'), stroke: 'none', opacity: 0.85 },
              emphasis: { style: { opacity: 1 } },
            }
          },
          data: includedDieRects.map((dr) => [dr.x, dr.y, dr.value]),
          encode: { x: 0, y: 1, value: 2 },
          z: 1,
        },
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
  }, [bbox, showFullGrid, waferRadius, minVal, maxVal, fieldSeriesData, dieSeriesData, viewPoint, fieldPointRadiusPx, diePointRadiusPx, fieldPointOpacity, diePointOpacity, showPointLabels, fields, fieldWidth, fieldHeight, dieCols, dieRows, offsetMmX, offsetMmY, showOutlinesInPointMode, centerAxisCoordinates, gridLineColor, gridLineWidth, fitToContent, showValues, viewShotSequence, viewDieSequence, viewDieIndex])

  return (
    <div style={{ width: 900, height: 900 }}>
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

export default WaferFieldCDU_V6ECharts
