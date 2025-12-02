import { useMemo } from 'react'

export interface AxisExtents {
  axisMinX: number
  axisMaxX: number
  axisMinY: number
  axisMaxY: number
}

export function useAxesAndGrid(args: {
  bbox: { minX: number; maxX: number; minY: number; maxY: number }
  showFullGrid: boolean
  fitToContent: boolean
  waferRadius: number
  showShotRuler: boolean
}) {
  const { bbox, showFullGrid, fitToContent, waferRadius, showShotRuler } = args

  const axis = useMemo<AxisExtents>(() => {
    const axisMinX = (showFullGrid ? bbox.minX : (fitToContent ? bbox.minX : Math.min(bbox.minX, -waferRadius)))
    const axisMaxX = (showFullGrid ? bbox.maxX : (fitToContent ? bbox.maxX : Math.max(bbox.maxX, waferRadius)))
    const axisMinY = (showFullGrid ? bbox.minY : (fitToContent ? bbox.minY : Math.min(bbox.minY, -waferRadius)))
    const axisMaxY = (showFullGrid ? bbox.maxY : (fitToContent ? bbox.maxY : Math.max(bbox.maxY, waferRadius)))
    return { axisMinX, axisMaxX, axisMinY, axisMaxY }
  }, [bbox, showFullGrid, fitToContent, waferRadius])

  const gridPadding = useMemo(() => ({ left: showShotRuler ? 56 : 40, right: 20, top: 60, bottom: showShotRuler ? 56 : 40 }), [showShotRuler])

  return { ...axis, gridPadding }
}
