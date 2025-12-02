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
  outsidePointColor = '#9aa3b2',
  outsideDiePointOpacity = 0.35,
  outsideFieldPointOpacity = 0.25,
  showFieldFill = false,
  fieldFillOpacity = 0.35,
  showShotRuler = false,
  showWaferRadius = false,
  shotRulerStepX = 1,
  shotRulerStepY = 1,
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

  const pointDataSet = usePointData({ fields, includeNullDies: !fitToContent })

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

  const rawDieSeriesData = useMemo(() => (
    pointDataSet.diePoints.map((p) => ({
      value: [p.x, p.y, p.value],
      fieldIndex: p.fieldIndex,
      dieIndex: p.dieIndex,
    }))
  ), [pointDataSet.diePoints])

  const rawFieldSeriesData = useMemo(() => (
    pointDataSet.fieldPoints.map((p) => ({ value: [p.x, p.y, p.value], shotIndex: p.shotIndex }))
  ), [pointDataSet.fieldPoints])

  const option = useMemo(() => {
    // Axis extents derived from flags (used in both option and sizing)
    const axisMinX = (showFullGrid ? bbox.minX : (fitToContent ? bbox.minX : Math.min(bbox.minX, -waferRadius)))
    const axisMaxX = (showFullGrid ? bbox.maxX : (fitToContent ? bbox.maxX : Math.max(bbox.maxX, waferRadius)))
    const axisMinY = (showFullGrid ? bbox.minY : (fitToContent ? bbox.minY : Math.min(bbox.minY, -waferRadius)))
    const axisMaxY = (showFullGrid ? bbox.maxY : (fitToContent ? bbox.maxY : Math.max(bbox.maxY, waferRadius)))

    // Grid paddings (keep in sync with container size calc below)
    const gridPadding = { left: showShotRuler ? 56 : 40, right: 20, top: 60, bottom: showShotRuler ? 56 : 40 }

    // Prepare rect data
    const fieldRects = fields.map((f, fi) => ({
      x: f.cx - fieldWidth / 2,
      y: f.cy - fieldHeight / 2,
      w: fieldWidth,
      h: fieldHeight,
      shotIndex: f.shotIndex,
      cx: f.cx,
      cy: f.cy,
      fieldIndex: fi,
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
        return dx * dx + dy * dy < r * r
      })
    }

    const dieRectsRaw = fields.flatMap((f, fi) =>
      f.dies.map((d, idx) => ({
        x: d.x - fieldWidth / dieCols / 2,
        y: d.y - fieldHeight / dieRows / 2,
        w: fieldWidth / dieCols,
        h: fieldHeight / dieRows,
        value: d.cdu,
        dieIndex: d.dieIndex ?? idx,
        dieSequence: d.dieSequence ?? idx,
        fieldIndex: fi,
      }))
    )
    const includedDieRects = dieRectsRaw.filter(isRectFullyInsideCircle)

    // Normalize sequences/indexes to match SVG rules
    // Global die sequence: left-top -> right-bottom across ALL dies
    // Die index (per-field): left-bottom -> right-top
    const recomputedDieSequence = new Map<string, number>()
    const recomputedDieIndex = new Map<string, number>()

    // Global sequence over ALL dies (even those not visible), left-top -> right-bottom
    const globalDieSorted = dieRectsRaw.slice().sort((a, b) => (a.y === b.y ? a.x - b.x : b.y - a.y))
    globalDieSorted.forEach((dr, i) => {
      recomputedDieSequence.set(`${dr.fieldIndex}:${dr.dieIndex}`, i)
    })

    // Per-field index bottom-first over ALL dies in each field (including hidden)
    const byField = new Map<number, typeof dieRectsRaw>()
    dieRectsRaw.forEach((dr) => {
      const key = dr.fieldIndex as number
      if (!byField.has(key)) byField.set(key, [])
      byField.get(key)!.push(dr)
    })
    byField.forEach((list, fieldIdx) => {
      const lbSorted = list.slice().sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y))
      lbSorted.forEach((dr, i) => {
        recomputedDieIndex.set(`${fieldIdx}:${dr.dieIndex}`, i)
      })
    })

    // Field(site) sequence (shot): left-top -> right-bottom over field rects
    // (computed after includedFieldRects below)

    // Build a key set for dies whose rects are fully inside wafer (SVG parity rule)
    const includedDieKeySet = new Set<string>()
    includedDieRects.forEach((dr) => {
      if (typeof dr.fieldIndex === 'number' && typeof dr.dieIndex === 'number') {
        includedDieKeySet.add(`${dr.fieldIndex}:${dr.dieIndex}`)
      }
    })

    // Field 포함 규칙: 해당 필드의 die 중 하나라도 fully-inside면 필드 rect를 온전히 표시
    const fieldHasValidDie = new Set<number>()
    includedDieRects.forEach((dr) => { if (typeof dr.fieldIndex === 'number') fieldHasValidDie.add(dr.fieldIndex) })
    const includedFieldRects = fieldRects.filter((fr) => fieldHasValidDie.has(fr.fieldIndex))

    // Field(site) sequence (shot): left-top -> right-bottom over ALL field rects (global order)
    // Visible labels will use the global sequence but only render for included fields.
    const recomputedShotSequence = new Map<number, number>()
    // Top first: y desc, then x asc
    const ltFieldSorted = fieldRects.slice().sort((a, b) => (a.y === b.y ? a.x - b.x : b.y - a.y))
    ltFieldSorted.forEach((fr, i) => { recomputedShotSequence.set(fr.fieldIndex, i) })

    // Field 평균값 (완전 포함된 die 기준)
    const fieldAvgMap = new Map<number, number | null>()
    const sumMap = new Map<number, { s: number; c: number }>()
    includedDieRects.forEach((dr) => {
      if (dr.value != null && typeof dr.fieldIndex === 'number') {
        const cur = sumMap.get(dr.fieldIndex) ?? { s: 0, c: 0 }
        sumMap.set(dr.fieldIndex, { s: cur.s + dr.value, c: cur.c + 1 })
      }
    })
    fieldRects.forEach((fr) => {
      const agg = sumMap.get(fr.fieldIndex)
      fieldAvgMap.set(fr.fieldIndex, agg && agg.c > 0 ? agg.s / agg.c : null)
    })

    // 포인트 모드: fitToContent=true인 경우에만 웨이퍼 내부 포인트로 제한
    const isPointInsideCircle = (x: number, y: number) => {
      const dx = x - offsetMmX
      const dy = y - offsetMmY
      return dx * dx + dy * dy <= waferRadius * waferRadius + 1e-9
    }
    // 포인트 시리즈 inside/outside 분리 (fitToContent=false면 outside도 표시)
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
    // Die points: use fully-inside-rect rule (four corners inside wafer)
    const dieInside = rawDieSeriesData.filter((p) =>
      p.fieldIndex != null && p.dieIndex != null && includedDieKeySet.has(`${p.fieldIndex}:${p.dieIndex}`)
    )
    const dieOutside = rawDieSeriesData.filter((p) =>
      !(p.fieldIndex != null && p.dieIndex != null && includedDieKeySet.has(`${p.fieldIndex}:${p.dieIndex}`))
    )

    // Prepare shot ruler ticks (gx, gy centered indices)
    const gyMin = Math.ceil(axisMinY / fieldStepY)
    const gyMax = Math.floor(axisMaxY / fieldStepY)
    const gxMin = Math.ceil(axisMinX / fieldStepX)
    const gxMax = Math.floor(axisMaxX / fieldStepX)
    const yTickData = [] as Array<[number, number]> // [gy, y]
    for (let gy = gyMin; gy <= gyMax; gy++) if (Math.abs(gy % shotRulerStepY) === 0) yTickData.push([gy, gy * fieldStepY])
    const xTickData = [] as Array<[number, number]> // [gx, x]
    for (let gx = gxMin; gx <= gxMax; gx++) if (Math.abs(gx % shotRulerStepX) === 0) xTickData.push([gx, gx * fieldStepX])

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
        // Shot rulers along left (Y) and bottom (X) — labels at field centers
        ...(showShotRuler ? [{
          name: 'ShotRulerY',
          type: 'custom',
          renderItem: (_params: unknown, api: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const a = api as any
            const gy = a.value(0)
            const y = a.value(1)
            const p = a.coord([axisMinX, y])
            return {
              type: 'text',
              style: {
                x: p[0] + 8,
                y: p[1],
                text: String(gy),
                textAlign: 'left',
                textVerticalAlign: 'middle',
                fill: '#6b7280',
                fontSize: 11,
              },
              silent: true,
            }
          },
          data: yTickData,
          z: 50,
        }, {
          name: 'ShotRulerX',
          type: 'custom',
          renderItem: (_params: unknown, api: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const a = api as any
            const gx = a.value(0)
            const x = a.value(1)
            const p = a.coord([x, axisMinY])
            return {
              type: 'text',
              style: {
                x: p[0],
                y: p[1] - 8,
                text: String(gx),
                textAlign: 'center',
                textVerticalAlign: 'bottom',
                fill: '#6b7280',
                fontSize: 11,
              },
              silent: true,
            }
          },
          data: xTickData,
          z: 50,
        }] : []),
        // Wafer radius overlay — line from center to wafer edge with label
        ...(showWaferRadius ? [{
          name: 'WaferRadius',
          type: 'custom',
          renderItem: (_p: unknown, api: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const a = api as any
            const c = a.coord([offsetMmX, offsetMmY])
            const e = a.coord([offsetMmX + waferRadius, offsetMmY])
            const mx = c[0] + (e[0] - c[0]) * 0.6
            const my = c[1] + (e[1] - c[1]) * 0.6
            return {
              type: 'group',
              children: [
                {
                  type: 'line',
                  shape: { x1: c[0], y1: c[1], x2: e[0], y2: e[1] },
                  style: { stroke: '#374151', lineWidth: 1.2 },
                },
                {
                  type: 'text',
                  style: { x: mx, y: my - 6, text: `R=${waferRadius} mm`, fill: '#374151', textAlign: 'center', textVerticalAlign: 'bottom', fontSize: 11 },
                },
              ],
              silent: true,
            }
          },
          data: [[0]],
          z: 55,
        }] : []),
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
          data: includedDieRects.map((dr) => [dr.x + dr.w / 2, dr.y + dr.h / 2, recomputedDieIndex.get(`${dr.fieldIndex}:${dr.dieIndex}`) ?? dr.dieIndex]),
          symbolSize: 1,
          itemStyle: { color: 'transparent' },
          label: { show: true, formatter: '{@[2]}', position: 'inside', color: '#2b6cb0', fontSize: 10 },
          z: 12,
        }] : []),
        ...(!viewPoint && viewDieSequence ? [{
          name: 'DieSequenceLabels',
          type: 'scatter',
          data: includedDieRects.map((dr) => [dr.x + dr.w / 2, dr.y + dr.h / 2, recomputedDieSequence.get(`${dr.fieldIndex}:${dr.dieIndex}`) ?? dr.dieSequence]),
          symbolSize: 1,
          itemStyle: { color: 'transparent' },
          label: { show: true, formatter: '{@[2]}', position: 'inside', color: '#b02b6c', fontSize: 10 },
          z: 12,
        }] : []),
        ...(viewShotSequence ? [{
          name: 'ShotLabels',
          type: 'scatter',
          data: includedFieldRects.map((fr) => [fr.cx, fr.cy, recomputedShotSequence.get(fr.fieldIndex) ?? 0]),
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
              const rx = a.size([waferRadius, 0])[0]
              const ry = a.size([0, waferRadius])[1]
              const r1 = Math.min(rx, ry)
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
        // Field fill (avg CDU) behind dies
          ...(!viewPoint && showFieldFill ? [{
          name: 'FieldFill',
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
              style: { fill: a.visual('color'), stroke: 'none', opacity: fieldFillOpacity },
            }
          },
          data: includedFieldRects.map((fr) => [fr.cx, fr.cy, fieldAvgMap.get(fr.fieldIndex) ?? null]),
          encode: { x: 0, y: 1, value: 2 },
          z: 0,
        }] : []),
        // Die filled rects (use visualMap color) - rect mode only
        !viewPoint ? {
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
        } : undefined,
        // Field points (inside)
        viewPoint ? {
          name: 'Field',
          type: 'scatter',
          data: fieldInside,
          symbolSize: fieldPointRadiusPx * 2,
          itemStyle: { opacity: fieldPointOpacity },
          encode: { x: 0, y: 1 },
          label: showPointLabels ? {
            show: true,
            formatter: (arg: unknown) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const p = arg as { data?: any }
              const v = p.data?.value?.[2]
              if (v == null) return ''
              const num = Number(v)
              return Number.isNaN(num) ? '' : num.toFixed(3)
            },
            position: 'top',
            fontSize: 10,
            color: '#222',
          } : undefined,
          z: 2,
        } : undefined,
        // Field points (outside)
        viewPoint && !fitToContent ? {
          name: 'FieldOutside',
          type: 'scatter',
          data: fieldOutside.map((d) => ({ ...d, itemStyle: { color: outsidePointColor, opacity: outsideFieldPointOpacity } })),
          symbolSize: fieldPointRadiusPx * 2,
          encode: { x: 0, y: 1 },
          label: showPointLabels ? {
            show: true,
            formatter: (arg: unknown) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const p = arg as { data?: any }
              const v = p.data?.value?.[2]
              if (v == null) return ''
              const num = Number(v)
              return Number.isNaN(num) ? '' : num.toFixed(3)
            },
            position: 'top',
            fontSize: 10,
            color: '#444',
          } : undefined,
          z: 2,
        } : undefined,
        // Die points (inside)
        viewPoint ? {
          name: 'Die',
          type: 'scatter',
          data: dieInside,
          symbolSize: diePointRadiusPx * 2,
          itemStyle: { opacity: diePointOpacity },
          encode: { x: 0, y: 1 },
          label: showPointLabels ? {
            show: true,
            formatter: (arg: unknown) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const p = arg as { data?: any }
              const v = p.data?.value?.[2]
              if (v == null) return ''
              const num = Number(v)
              return Number.isNaN(num) ? '' : num.toFixed(3)
            },
            position: 'bottom',
            fontSize: 10,
            color: '#222',
          } : undefined,
          z: 3,
        } : undefined,
        // Die points (outside)
        viewPoint && !fitToContent ? {
          name: 'DieOutside',
          type: 'scatter',
          data: dieOutside.map((d) => ({ ...d, itemStyle: { color: outsidePointColor, opacity: outsideDiePointOpacity } })),
          symbolSize: diePointRadiusPx * 2,
          encode: { x: 0, y: 1 },
          label: showPointLabels ? {
            show: true,
            formatter: (arg: unknown) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const p = arg as { data?: any }
              const v = p.data?.value?.[2]
              if (v == null) return ''
              const num = Number(v)
              return Number.isNaN(num) ? '' : num.toFixed(3)
            },
            position: 'bottom',
            fontSize: 10,
            color: '#444',
          } : undefined,
          z: 3,
        } : undefined,
        // Die sequence labels in point mode (left-top -> right-bottom, start at 0)
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
        // Die index labels in point mode (left-bottom -> right-top, start at 0)
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
      ].filter(Boolean),
    }
  }, [bbox, showFullGrid, waferRadius, minVal, maxVal, rawFieldSeriesData, rawDieSeriesData, viewPoint, fieldPointRadiusPx, diePointRadiusPx, fieldPointOpacity, diePointOpacity, showPointLabels, fields, fieldWidth, fieldHeight, dieCols, dieRows, offsetMmX, offsetMmY, showOutlinesInPointMode, centerAxisCoordinates, gridLineColor, gridLineWidth, fitToContent, showValues, viewShotSequence, viewDieSequence, viewDieIndex, showFieldFill, fieldFillOpacity, outsidePointColor, outsideDiePointOpacity, outsideFieldPointOpacity, showShotRuler, showWaferRadius, fieldStepX, fieldStepY, shotRulerStepX, shotRulerStepY])

  // Dynamically size the chart container to reflect axis extents (intuitive overflow)
  const { containerWidthPx, containerHeightPx } = useMemo(() => {
    const axisMinX = (showFullGrid ? bbox.minX : (fitToContent ? bbox.minX : Math.min(bbox.minX, -waferRadius)))
    const axisMaxX = (showFullGrid ? bbox.maxX : (fitToContent ? bbox.maxX : Math.max(bbox.maxX, waferRadius)))
    const axisMinY = (showFullGrid ? bbox.minY : (fitToContent ? bbox.minY : Math.min(bbox.minY, -waferRadius)))
    const axisMaxY = (showFullGrid ? bbox.maxY : (fitToContent ? bbox.maxY : Math.max(bbox.maxY, waferRadius)))

    const rangeX = Math.max(1, axisMaxX - axisMinX)
    const rangeY = Math.max(1, axisMaxY - axisMinY)

    // Keep base scale consistent with previous 900px for 300mm wafer
    const basePxPerMm = 900 / (2 * waferRadius) // ~3 px/mm
    const gridPadding = { left: showShotRuler ? 56 : 40, right: 20, top: 60, bottom: showShotRuler ? 56 : 40 }

    const w = Math.round(rangeX * basePxPerMm) + gridPadding.left + gridPadding.right
    const h = Math.round(rangeY * basePxPerMm) + gridPadding.top + gridPadding.bottom

    return {
      containerWidthPx: Math.max(600, w),
      containerHeightPx: Math.max(600, h),
    }
  }, [bbox, showFullGrid, fitToContent, waferRadius, showShotRuler])

  return (
    <div style={{ width: containerWidthPx, height: containerHeightPx }}>
      <ReactECharts 
        option={option} 
        style={{ width: '100%', height: '100%' }}
        notMerge={true}
        lazyUpdate={false}
      />
    </div>
  )
}

export default WaferFieldCDU_V6ECharts
