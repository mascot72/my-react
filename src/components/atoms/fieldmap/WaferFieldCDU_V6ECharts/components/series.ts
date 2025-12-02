/* eslint-disable @typescript-eslint/no-explicit-any */
export function buildOutlinesSeries(args: {
  offsetMmX: number
  offsetMmY: number
  waferRadius: number
  includedFieldRects: Array<{ x: number; y: number; w: number; h: number }>
  includedDieRects: Array<{ x: number; y: number; w: number; h: number }>
}) {
  const { offsetMmX, offsetMmY, waferRadius, includedFieldRects, includedDieRects } = args
  return [
    {
      name: 'WaferOutline',
      type: 'custom',
      renderItem: (_params: unknown, api: unknown) => {
        const a = api as any
        const center = a.coord([offsetMmX, offsetMmY])
        const rx = a.size([waferRadius, 0])[0]
        const ry = a.size([0, waferRadius])[1]
        const r1 = Math.min(rx, ry)
        return { type: 'circle', shape: { cx: center[0], cy: center[1], r: r1 }, style: { stroke: '#333', fill: 'none', lineWidth: 1.2 } }
      },
      data: [[offsetMmX, offsetMmY]],
      z: 10,
    },
    {
      name: 'FieldOutlines',
      type: 'custom',
      renderItem: (params: unknown, api: unknown) => {
        const a = api as any
        const idx = (params as any).dataIndex
        const fr = includedFieldRects[idx]
        const p1 = a.coord([fr.x, fr.y])
        const p2 = a.coord([fr.x + fr.w, fr.y + fr.h])
        const x = p1[0]
        const y = p1[1]
        const w = p2[0] - p1[0]
        const h = p2[1] - p1[1]
        return { type: 'rect', shape: { x, y, width: w, height: h }, style: { stroke: '#c1c6cc', fill: 'none', lineWidth: 0.9 } }
      },
      data: includedFieldRects.map((_, i) => i),
      z: 9,
    },
    {
      name: 'DieOutlines',
      type: 'custom',
      renderItem: (params: unknown, api: unknown) => {
        const a = api as any
        const idx = (params as any).dataIndex
        const dr = includedDieRects[idx]
        const p1 = a.coord([dr.x, dr.y])
        const p2 = a.coord([dr.x + dr.w, dr.y + dr.h])
        const x = p1[0]
        const y = p1[1]
        const w = p2[0] - p1[0]
        const h = p2[1] - p1[1]
        return { type: 'rect', shape: { x, y, width: w, height: h }, style: { stroke: 'rgba(0,0,0,0.18)', fill: 'none', lineWidth: 0.3 } }
      },
      data: includedDieRects.map((_, i) => i),
      z: 8,
    },
  ]
}

export function buildFieldFillSeries(args: {
  includedFieldRects: Array<{ x: number; y: number; w: number; h: number; cx: number; cy: number; fieldIndex: number }>
  fieldAvgMap: Map<number, number|null>
  fieldFillOpacity: number
}) {
  const { includedFieldRects, fieldAvgMap, fieldFillOpacity } = args
  return [{
    name: 'FieldFill',
    type: 'custom',
    renderItem: (params: unknown, api: unknown) => {
      const a = api as any
      const idx = (params as any).dataIndex
      const fr = includedFieldRects[idx]
      const p1 = a.coord([fr.x, fr.y])
      const p2 = a.coord([fr.x + fr.w, fr.y + fr.h])
      const x = p1[0]
      const y = p1[1]
      const w = p2[0] - p1[0]
      const h = p2[1] - p1[1]
      return { type: 'rect', shape: { x, y, width: w, height: h }, style: { fill: a.visual('color'), stroke: 'none', opacity: fieldFillOpacity } }
    },
    data: includedFieldRects.map((fr) => [fr.cx, fr.cy, fieldAvgMap.get(fr.fieldIndex) ?? null]),
    encode: { x: 0, y: 1, value: 2 },
    z: 0,
  }]
}

export function buildDieFillSeries(args: { includedDieRects: Array<{ x: number; y: number; w: number; h: number; value: number|null }> }) {
  const { includedDieRects } = args
  return [{
    name: 'DieFill',
    type: 'custom',
    renderItem: (params: unknown, api: unknown) => {
      const a = api as any
      const idx = (params as any).dataIndex
      const dr = includedDieRects[idx]
      const p1 = a.coord([dr.x, dr.y])
      const p2 = a.coord([dr.x + dr.w, dr.y + dr.h])
      const x = p1[0]
      const y = p1[1]
      const w = p2[0] - p1[0]
      const h = p2[1] - p1[1]
      return { type: 'rect', shape: { x, y, width: w, height: h }, style: { fill: a.visual('color'), stroke: 'none', opacity: 0.85 }, emphasis: { style: { opacity: 1 } } }
    },
    data: includedDieRects.map((dr) => [dr.x, dr.y, dr.value]),
    encode: { x: 0, y: 1, value: 2 },
    z: 1,
  }]
}

export function buildValueLabelsSeries(args: { includedDieRects: Array<{ x: number; y: number; w: number; h: number; value: number|null }> }) {
  const { includedDieRects } = args
  return [{
    name: 'DieValueLabels',
    type: 'scatter',
    data: includedDieRects.map((dr) => [dr.x + dr.w / 2, dr.y + dr.h / 2, dr.value]),
    symbolSize: 1,
    itemStyle: { color: 'transparent' },
    label: { show: true, formatter: (arg: unknown) => { const p = arg as any; const v = p.data?.[2]; return v == null ? 'N/A' : Number(v).toFixed(3) }, position: 'inside', color: '#111', fontSize: 10 },
    encode: { x: 0, y: 1, value: 2 },
    z: 12,
  }]
}

export function buildDieIndexLabelsSeries(args: { includedDieRects: Array<{ x: number; y: number; w: number; h: number; dieIndex?: number; fieldIndex: number }>; recomputedDieIndex: Map<string, number> }) {
  const { includedDieRects, recomputedDieIndex } = args
  return [{
    name: 'DieIndexLabels',
    type: 'scatter',
    data: includedDieRects.map((dr) => [dr.x + dr.w / 2, dr.y + dr.h / 2, recomputedDieIndex.get(`${dr.fieldIndex}:${dr.dieIndex}`) ?? dr.dieIndex]),
    symbolSize: 1,
    itemStyle: { color: 'transparent' },
    label: { show: true, formatter: '{@[2]}', position: 'inside', color: '#2b6cb0', fontSize: 10 },
    z: 12,
  }]
}

export function buildDieSequenceLabelsSeries(args: { includedDieRects: Array<{ x: number; y: number; w: number; h: number; dieIndex?: number; fieldIndex: number; dieSequence?: number }>; recomputedDieSequence: Map<string, number> }) {
  const { includedDieRects, recomputedDieSequence } = args
  return [{
    name: 'DieSequenceLabels',
    type: 'scatter',
    data: includedDieRects.map((dr) => [dr.x + dr.w / 2, dr.y + dr.h / 2, recomputedDieSequence.get(`${dr.fieldIndex}:${dr.dieIndex}`) ?? dr.dieSequence]),
    symbolSize: 1,
    itemStyle: { color: 'transparent' },
    label: { show: true, formatter: '{@[2]}', position: 'inside', color: '#b02b6c', fontSize: 10 },
    z: 12,
  }]
}

export function buildShotLabelsSeries(args: { includedFieldRects: Array<{ cx: number; cy: number; fieldIndex: number }>; recomputedShotSequence: Map<number, number> }) {
  const { includedFieldRects, recomputedShotSequence } = args
  return [{
    name: 'ShotLabels',
    type: 'scatter',
    data: includedFieldRects.map((fr) => [fr.cx, fr.cy, recomputedShotSequence.get(fr.fieldIndex) ?? 0]),
    symbolSize: 2,
    itemStyle: { color: 'transparent' },
    label: { show: true, formatter: '{@[2]}', position: 'top', color: '#666', fontSize: 11 },
    z: 11,
  }]
}

export function buildPointSeries(args: {
  fieldInside: any[]
  fieldOutside: any[]
  dieInside: any[]
  dieOutside: any[]
  fieldPointRadiusPx: number
  diePointRadiusPx: number
  fieldPointOpacity: number
  diePointOpacity: number
  outsidePointColor: string
  outsideFieldPointOpacity: number
  outsideDiePointOpacity: number
  showPointLabels: boolean
  fitToContent: boolean
}) {
  const {
    fieldInside, fieldOutside, dieInside, dieOutside,
    fieldPointRadiusPx, diePointRadiusPx,
    fieldPointOpacity, diePointOpacity,
    outsidePointColor, outsideFieldPointOpacity, outsideDiePointOpacity,
    showPointLabels, fitToContent,
  } = args

  const labelOpt = (color: string) => ({
    show: true,
    formatter: (arg: unknown) => { const p = arg as any; const v = p.data?.value?.[2]; if (v == null) return ''; const num = Number(v); return Number.isNaN(num) ? '' : num.toFixed(3) },
    position: 'top', fontSize: 10, color,
  })

  return [
    {
      name: 'Field', type: 'scatter', data: fieldInside, symbolSize: fieldPointRadiusPx * 2, itemStyle: { opacity: fieldPointOpacity }, encode: { x: 0, y: 1 }, label: showPointLabels ? labelOpt('#222') : undefined, z: 2,
    },
    !fitToContent ? {
      name: 'FieldOutside', type: 'scatter', data: fieldOutside.map((d: any) => ({ ...d, itemStyle: { color: outsidePointColor, opacity: outsideFieldPointOpacity } })), symbolSize: fieldPointRadiusPx * 2, encode: { x: 0, y: 1 }, label: showPointLabels ? labelOpt('#444') : undefined, z: 2,
    } : undefined,
    {
      name: 'Die', type: 'scatter', data: dieInside, symbolSize: diePointRadiusPx * 2, itemStyle: { opacity: diePointOpacity }, encode: { x: 0, y: 1 }, label: showPointLabels ? { ...labelOpt('#222'), position: 'bottom' } : undefined, z: 3,
    },
    !fitToContent ? {
      name: 'DieOutside', type: 'scatter', data: dieOutside.map((d: any) => ({ ...d, itemStyle: { color: outsidePointColor, opacity: outsideDiePointOpacity } })), symbolSize: diePointRadiusPx * 2, encode: { x: 0, y: 1 }, label: showPointLabels ? { ...labelOpt('#444'), position: 'bottom' } : undefined, z: 3,
    } : undefined,
  ].filter(Boolean)
}
