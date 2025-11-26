import { useMemo } from 'react'
import type { Field, FieldRenderItem, MergeGroup } from '../types'

interface UseFieldRenderItemsOptions {
  fields: Field[]
  dieWidth: number
  dieHeight: number
  dieCols: number
  dieRows: number
}

/**
 * 필드를 렌더링 가능한 구조로 변환
 */
export function useFieldRenderItems({
  fields,
  dieWidth,
  dieHeight,
  dieCols,
  dieRows,
}: UseFieldRenderItemsOptions) {
  return useMemo(() => {
    const items: FieldRenderItem[] = []

    for (const f of fields) {
      const fieldRect = {
        x: f.cx - (dieWidth * dieCols) / 2,
        y: f.cy - (dieHeight * dieRows) / 2,
        w: dieWidth * dieCols,
        h: dieHeight * dieRows,
      }

      const singleDies = f.dies.filter((d) => d.mergeGroup == null)
      const groupsMap = new Map<number, typeof f.dies>()

      for (const d of f.dies) {
        if (d.mergeGroup != null) {
          const id = d.mergeGroup
          if (!groupsMap.has(id)) groupsMap.set(id, [])
          groupsMap.get(id)!.push(d)
        }
      }

      const mergeGroups: MergeGroup[] = []
      for (const [id, list] of groupsMap.entries()) {
        const xMin = Math.min(...list.map((z) => z.x - dieWidth / 2))
        const xMax = Math.max(...list.map((z) => z.x + dieWidth / 2))
        const yMin = Math.min(...list.map((z) => z.y - dieHeight / 2))
        const yMax = Math.max(...list.map((z) => z.y + dieHeight / 2))
        const avgCdu = list.reduce((a, b) => a + (b.cdu ?? 0), 0) / list.length
        mergeGroups.push({
          id,
          xMin,
          xMax,
          yMin,
          yMax,
          cdu: isFinite(avgCdu) ? avgCdu : null,
        })
      }

      // 필드 전체 평균
      const vals = f.dies.map((d) => d.cdu).filter((v) => v != null) as number[]
      const fieldAvg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null

      items.push({
        fieldRect,
        singleDies,
        mergeGroups,
        fieldAvgCdu: fieldAvg,
        shotIndex: f.shotIndex,
        included: (f as unknown as { included?: boolean }).included,
      })
    }

    return items
  }, [fields, dieWidth, dieHeight, dieCols, dieRows])
}
