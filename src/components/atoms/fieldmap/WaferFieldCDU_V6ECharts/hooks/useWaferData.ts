import { useMemo } from 'react'
import { useCDUData, usePointData } from '../../WaferFieldCDU_V6/hooks'
import type { WaferFieldCDU_V6Props } from '../../WaferFieldCDU_V6/types'

export interface WaferComputedData {
  waferRadius: number
  fieldWidth: number
  fieldHeight: number
  dieCols: number
  dieRows: number
  fieldStepX: number
  fieldStepY: number
  offsetMmX: number
  offsetMmY: number
  fields: ReturnType<typeof useCDUData>
  pointDataSet: ReturnType<typeof usePointData>
  bbox: { minX: number; maxX: number; minY: number; maxY: number }
  rawDieSeriesData: Array<{ value: [number, number, number|null]; fieldIndex?: number; dieIndex?: number }>
  rawFieldSeriesData: Array<{ value: [number, number, number|null]; shotIndex?: number }>
  includedDieRects: Array<{ x: number; y: number; w: number; h: number; value: number|null; dieIndex?: number; dieSequence?: number; fieldIndex: number }>
  includedFieldRects: Array<{ x: number; y: number; w: number; h: number; cx: number; cy: number; fieldIndex: number }>
  recomputedDieSequence: Map<string, number>
  recomputedDieIndex: Map<string, number>
  recomputedShotSequence: Map<number, number>
  fieldAvgMap: Map<number, number|null>
}

export function useWaferData(props: WaferFieldCDU_V6Props & { waferRadius?: number; fitToContent?: boolean }) : WaferComputedData {
  const {
    cduSeed,
    cduData,
    fieldArraySize = [14, 13],
    offsetMicrometers = [0, 0],
    fieldSizeMicrometers = [20000, 30000],
    fitToContent = true,
  } = props

  const waferRadius = props.waferRadius ?? 150

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

  const rawDieSeriesData = useMemo(() => (
    pointDataSet.diePoints.map((p) => ({ 
      value: [p.x as number, p.y as number, (p.value as number|null)] as [number, number, number|null], 
      fieldIndex: p.fieldIndex, 
      dieIndex: p.dieIndex 
    }))
  ), [pointDataSet.diePoints])

  const rawFieldSeriesData = useMemo(() => (
    pointDataSet.fieldPoints.map((p) => ({ 
      value: [p.x as number, p.y as number, (p.value as number|null)] as [number, number, number|null], 
      shotIndex: p.shotIndex 
    }))
  ), [pointDataSet.fieldPoints])

  // Field rects
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

  const recomputedDieSequence = new Map<string, number>()
  const recomputedDieIndex = new Map<string, number>()

  const globalDieSorted = dieRectsRaw.slice().sort((a, b) => (a.y === b.y ? a.x - b.x : b.y - a.y))
  globalDieSorted.forEach((dr, i) => { recomputedDieSequence.set(`${dr.fieldIndex}:${dr.dieIndex}`, i) })

  const byField = new Map<number, typeof dieRectsRaw>()
  dieRectsRaw.forEach((dr) => {
    const key = dr.fieldIndex as number
    if (!byField.has(key)) byField.set(key, [])
    byField.get(key)!.push(dr)
  })
  byField.forEach((list, fieldIdx) => {
    const lbSorted = list.slice().sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y))
    lbSorted.forEach((dr, i) => { recomputedDieIndex.set(`${fieldIdx}:${dr.dieIndex}`, i) })
  })

  const includedDieKeySet = new Set<string>()
  includedDieRects.forEach((dr) => {
    if (typeof dr.fieldIndex === 'number' && typeof dr.dieIndex === 'number') {
      includedDieKeySet.add(`${dr.fieldIndex}:${dr.dieIndex}`)
    }
  })

  const fieldHasValidDie = new Set<number>()
  includedDieRects.forEach((dr) => { if (typeof dr.fieldIndex === 'number') fieldHasValidDie.add(dr.fieldIndex) })
  const includedFieldRects = fieldRects.filter((fr) => fieldHasValidDie.has(fr.fieldIndex))

  const recomputedShotSequence = new Map<number, number>()
  const ltFieldSorted = fieldRects.slice().sort((a, b) => (a.y === b.y ? a.x - b.x : b.y - a.y))
  ltFieldSorted.forEach((fr, i) => { recomputedShotSequence.set(fr.fieldIndex, i) })

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

  return {
    waferRadius,
    fieldWidth,
    fieldHeight,
    dieCols,
    dieRows,
    fieldStepX,
    fieldStepY,
    offsetMmX,
    offsetMmY,
    fields,
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
  }
}
