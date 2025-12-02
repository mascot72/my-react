import { useMemo } from 'react'
import type { AxisExtents } from './useAxesAndGrid'

export function useContainerSize(args: AxisExtents & { waferRadius: number; showShotRuler: boolean }) {
  const { axisMinX, axisMaxX, axisMinY, axisMaxY, waferRadius, showShotRuler } = args
  return useMemo(() => {
    const rangeX = Math.max(1, axisMaxX - axisMinX)
    const rangeY = Math.max(1, axisMaxY - axisMinY)

    const basePxPerMm = 900 / (2 * waferRadius)
    const gridPadding = { left: showShotRuler ? 56 : 40, right: 20, top: 60, bottom: showShotRuler ? 56 : 40 }

    const w = Math.round(rangeX * basePxPerMm) + gridPadding.left + gridPadding.right
    const h = Math.round(rangeY * basePxPerMm) + gridPadding.top + gridPadding.bottom

    return { containerWidthPx: Math.max(600, w), containerHeightPx: Math.max(600, h) }
  }, [axisMinX, axisMaxX, axisMinY, axisMaxY, waferRadius, showShotRuler])
}
