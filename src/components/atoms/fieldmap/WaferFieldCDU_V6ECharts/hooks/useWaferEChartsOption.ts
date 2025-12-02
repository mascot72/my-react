import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import { createShotRulerSeries, createWaferRadiusSeries } from '../components/overlays'
import { useWaferData } from './useWaferData'
import { useAxesAndGrid } from './useAxesAndGrid'
import { useContainerSize } from './useContainerSize'
import { buildOutlinesSeries, buildFieldFillSeries, buildDieFillSeries, buildValueLabelsSeries, buildDieIndexLabelsSeries, buildDieSequenceLabelsSeries, buildShotLabelsSeries, buildPointSeries } from '../components/series'
import type { WaferFieldCDU_V6Props } from '../../WaferFieldCDU_V6/types'

export function useWaferEChartsOption(props: WaferFieldCDU_V6Props & { waferRadius?: number }) {
  const {
    cduSeed,
    cduData,
    showFullGrid = false,
    fieldArraySize = [14, 13],
    offsetMicrometers = [0, 0],
    fieldSizeMicrometers = [20000, 30000],
    showValues = false,
    viewShotSequence = false,
    viewDieSequence = false,
    viewDieIndex = false,
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
    outsidePointColor = '#9aa3b2',
    outsideDiePointOpacity = 0.35,
    outsideFieldPointOpacity = 0.25,
    showFieldFill = false,
    fieldFillOpacity = 0.35,
    showShotRuler = false,
    showWaferRadius = false,
    shotRulerStepX = 1,
    shotRulerStepY = 1,
  } = props

  const {
    waferRadius,
    fieldStepX,
    fieldStepY,
    offsetMmX,
    offsetMmY,
    pointDataSet,
    bbox,
    rawDieSeriesData,
    rawFieldSeriesData,
    includedDieRects,
    includedFieldRects,
    recomputedDieSequence,
    recomputedDieIndex,
    recomputedShotSequence,
    fieldAvgMap,
  } = useWaferData({ cduSeed, cduData, fieldArraySize, offsetMicrometers, fieldSizeMicrometers, fitToContent, waferRadius: props.waferRadius })

  const { axisMinX, axisMaxX, axisMinY, axisMaxY, gridPadding } = useAxesAndGrid({ bbox, showFullGrid, fitToContent, waferRadius, showShotRuler })

  const [minVal, maxVal] = useMemo(() => {
    const vals = pointDataSet.diePoints.map((d) => d.value).filter((v): v is number => v != null)
    if (vals.length === 0) return [-1, 1]
    return [Math.min(...vals), Math.max(...vals)]
  }, [pointDataSet.diePoints])


  const option: EChartsOption = useMemo(() => {
    const includedDieKeySet = new Set<string>(includedDieRects.map((dr) => `${dr.fieldIndex}:${dr.dieIndex}`))

    const isPointInsideCircle = (x: number, y: number) => {
      const dx = x - offsetMmX
      const dy = y - offsetMmY
      return dx * dx + dy * dy <= waferRadius * waferRadius + 1e-9
    }

    const fieldInside = rawFieldSeriesData.filter((p) => {
      const x = p.value?.[0]
      const y = p.value?.[1]
      return typeof x === 'number' && typeof y === 'number' && isPointInsideCircle(x as number, y as number)
    })
    const fieldOutside = rawFieldSeriesData.filter((p) => {
      const x = p.value?.[0]
      const y = p.value?.[1]
      return !(typeof x === 'number' && typeof y === 'number' && isPointInsideCircle(x as number, y as number))
    })
    const dieInside = rawDieSeriesData.filter((p) =>
      p.fieldIndex != null && p.dieIndex != null && includedDieKeySet.has(`${p.fieldIndex}:${p.dieIndex}`)
    )
    const dieOutside = rawDieSeriesData.filter((p) =>
      !(p.fieldIndex != null && p.dieIndex != null && includedDieKeySet.has(`${p.fieldIndex}:${p.dieIndex}`))
    )

    const gyMin = Math.ceil(axisMinY / fieldStepY)
    const gyMax = Math.floor(axisMaxY / fieldStepY)
    const gxMin = Math.ceil(axisMinX / fieldStepX)
    const gxMax = Math.floor(axisMaxX / fieldStepX)
    const yTickData: Array<[number, number]> = []
    for (let gy = gyMin; gy <= gyMax; gy++) if (Math.abs(gy % shotRulerStepY) === 0) yTickData.push([gy, gy * fieldStepY])
    const xTickData: Array<[number, number]> = []
    for (let gx = gxMin; gx <= gxMax; gx++) if (Math.abs(gx % shotRulerStepX) === 0) xTickData.push([gx, gx * fieldStepX])

    const seriesList = [
      ...(showShotRuler ? createShotRulerSeries({ axisMinX, axisMinY, yTickData, xTickData }) : []),
      ...(showWaferRadius ? createWaferRadiusSeries({ offsetMmX, offsetMmY, waferRadius }) : []),
      ...(!viewPoint && showValues ? buildValueLabelsSeries({ includedDieRects }) : []),
      ...(!viewPoint && viewDieIndex ? buildDieIndexLabelsSeries({ includedDieRects, recomputedDieIndex }) : []),
      ...(!viewPoint && viewDieSequence ? buildDieSequenceLabelsSeries({ includedDieRects, recomputedDieSequence }) : []),
      ...(viewShotSequence ? buildShotLabelsSeries({ includedFieldRects, recomputedShotSequence }) : []),
      ...(showOutlinesInPointMode ? buildOutlinesSeries({ offsetMmX, offsetMmY, waferRadius, includedFieldRects, includedDieRects }) : []),
      ...(!viewPoint && showFieldFill ? buildFieldFillSeries({ includedFieldRects, fieldAvgMap, fieldFillOpacity }) : []),
      ...(!viewPoint ? buildDieFillSeries({ includedDieRects }) : []),
      ...(viewPoint ? buildPointSeries({ fieldInside, fieldOutside, dieInside, dieOutside, fieldPointRadiusPx, diePointRadiusPx, fieldPointOpacity, diePointOpacity, outsidePointColor, outsideFieldPointOpacity, outsideDiePointOpacity, showPointLabels, fitToContent }) : []),
      ...(viewPoint && viewDieSequence ? [{
        name: 'DieSequenceLabelsPoint',
        type: 'scatter',
        data: dieInside.map((p) => {
          const seq = (p.fieldIndex != null && p.dieIndex != null) ? recomputedDieSequence.get(`${p.fieldIndex}:${p.dieIndex}`) : undefined
          const x = p.value?.[0]
          const y = p.value?.[1]
          return [x, y, seq]
        }),
        symbolSize: 1,
        itemStyle: { color: 'transparent' },
        label: { show: true, formatter: '{@[2]}', position: 'bottom', color: '#b02b6c', fontSize: 10 },
        z: 12,
        encode: { x: 0, y: 1, value: 2 },
      }] : []),
      ...(viewPoint && viewDieIndex ? [{
        name: 'DieIndexLabelsPoint',
        type: 'scatter',
        data: dieInside.map((p) => {
          const idx = (p.fieldIndex != null && p.dieIndex != null) ? recomputedDieIndex.get(`${p.fieldIndex}:${p.dieIndex}`) : undefined
          const x = p.value?.[0]
          const y = p.value?.[1]
          return [x, y, idx]
        }),
        symbolSize: 1,
        itemStyle: { color: 'transparent' },
        label: { show: true, formatter: '{@[2]}', position: 'bottom', color: '#2b6cb0', fontSize: 10 },
        z: 12,
        encode: { x: 0, y: 1, value: 2 },
      }] : []),
    ].filter((s) => s != null)

    const option: EChartsOption = {
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
      grid: { left: gridPadding.left, right: gridPadding.right, top: gridPadding.top, bottom: gridPadding.bottom, containLabel: false },
      xAxis: {
        type: 'value',
        min: axisMinX,
        max: axisMaxX,
        scale: true,
        axisLine: { onZero: false },
        splitLine: { show: true, lineStyle: { color: gridLineColor, width: gridLineWidth } },
        axisTick: { show: !showShotRuler },
        axisLabel: {
          show: !showShotRuler,
          formatter: (val: number) => centerAxisCoordinates ? (val - offsetMmX).toFixed(0) : String(val),
          color: '#555',
          fontSize: 11,
        },
        name: showShotRuler ? '' : (centerAxisCoordinates ? 'ΔX (mm)' : 'X (mm)'),
      },
      yAxis: {
        type: 'value',
        min: axisMinY,
        max: axisMaxY,
        axisLine: { onZero: false },
        splitLine: { show: true, lineStyle: { color: gridLineColor, width: gridLineWidth } },
        axisTick: { show: !showShotRuler },
        axisLabel: {
          show: !showShotRuler,
          formatter: (val: number) => centerAxisCoordinates ? (val - offsetMmY).toFixed(0) : String(val),
          color: '#555',
          fontSize: 11,
        },
        name: showShotRuler ? '' : (centerAxisCoordinates ? 'ΔY (mm)' : 'Y (mm)'),
        scale: true,
      },
      visualMap: [
        {
          show: true,
          type: 'continuous',
          min: minVal,
          max: maxVal,
          dimension: 2,
          calculable: true,
          inRange: { color: ['#0033ff', '#66cc66', '#ff3300'] },
          left: 10,
          bottom: 10,
        },
      ],
      series: seriesList as unknown as EChartsOption['series'],
    }

    return option
  }, [
    axisMinX, axisMaxX, axisMinY, axisMaxY,
    gridPadding.left, gridPadding.right, gridPadding.top, gridPadding.bottom,
    waferRadius, minVal, maxVal,
    rawFieldSeriesData, rawDieSeriesData,
    includedDieRects, includedFieldRects,
    recomputedDieSequence, recomputedDieIndex, recomputedShotSequence,
    viewPoint, fieldPointRadiusPx, diePointRadiusPx, fieldPointOpacity, diePointOpacity, showPointLabels,
    offsetMmX, offsetMmY,
    showOutlinesInPointMode, centerAxisCoordinates, gridLineColor, gridLineWidth,
    showValues, viewShotSequence, viewDieSequence, viewDieIndex, showFieldFill, fieldFillOpacity,
    outsidePointColor, outsideDiePointOpacity, outsideFieldPointOpacity,
    showShotRuler, showWaferRadius,
    fieldStepX, fieldStepY, shotRulerStepX, shotRulerStepY,
    fieldAvgMap,
    fitToContent,
  ])

  const { containerWidthPx, containerHeightPx } = useContainerSize({ axisMinX, axisMaxX, axisMinY, axisMaxY, waferRadius, showShotRuler })

  return { option, containerWidthPx, containerHeightPx }
}
