import { useMemo } from 'react'
import type { Field, Die, MergeGroup } from '../types'

interface UseMergeGroupsOptions {
  fields: Field[]
  dieWidth: number
  dieHeight: number
  dieCols: number
  dieRows: number
  enabled: boolean
  mergeThreshold?: number
}

/**
 * 필드 간 병합 알고리즘
 * enabled가 false이면 병합하지 않음
 */
export function useMergeGroups({
  fields,
  dieWidth,
  dieHeight,
  dieCols,
  dieRows,
  enabled,
  mergeThreshold = 0.05,
}: UseMergeGroupsOptions) {
  return useMemo(() => {
    if (!enabled || !fields.length) {
      // 병합 비활성화 시: 각 다이를 individual로 처리
      return {
        fieldsWithMerge: fields,
      }
    }

    // 병합 활성화: 원래 로직 실행
    type DieWithField = Die & { fieldIndex: number; dieIndex: number; gridX: number; gridY: number }
    const allDies: DieWithField[] = []
    const fieldMap = new Map<string, { field: Field; fieldIndex: number }>()

    // 전체 다이를 flat 배열로 수집
    fields.forEach((f, fieldIndex) => {
      const fx = Math.round(f.cx / (dieWidth * dieCols))
      const fy = Math.round(f.cy / (dieHeight * dieRows))
      fieldMap.set(`${fx},${fy}`, { field: f, fieldIndex })

      f.dies.forEach((d, dieIndex) => {
        const j = Math.floor(dieIndex / dieCols)
        const i = dieIndex % dieCols
        allDies.push({
          ...d,
          fieldIndex,
          dieIndex,
          gridX: fx * dieCols + i,
          gridY: fy * dieRows + j,
        })
      })
    })

    // 병합 그룹 할당
    let mergeId = 1
    for (let idx = 0; idx < allDies.length; idx++) {
      const a = allDies[idx]
      if (a.cdu == null) continue

      const neighbors = [
        [a.gridX - 1, a.gridY],
        [a.gridX + 1, a.gridY],
        [a.gridX, a.gridY - 1],
        [a.gridX, a.gridY + 1],
      ]

      for (const [nx, ny] of neighbors) {
        const b = allDies.find((d) => d.gridX === nx && d.gridY === ny)
        if (!b || b.cdu == null) continue

        if (Math.abs((a.cdu ?? 0) - (b.cdu ?? 0)) < mergeThreshold) {
          if (!a.mergeGroup && !b.mergeGroup) {
            a.mergeGroup = b.mergeGroup = mergeId++
          } else if (a.mergeGroup && !b.mergeGroup) {
            b.mergeGroup = a.mergeGroup
          } else if (!a.mergeGroup && b.mergeGroup) {
            a.mergeGroup = b.mergeGroup
          } else if (a.mergeGroup !== b.mergeGroup) {
            const old = b.mergeGroup
            const neu = a.mergeGroup
            allDies.forEach((z) => {
              if (z.mergeGroup === old) z.mergeGroup = neu
            })
          }
        }
      }
    }

    // 병합 결과를 원래 필드에 반영
    allDies.forEach((d) => {
      fields[d.fieldIndex].dies[d.dieIndex].mergeGroup = d.mergeGroup
    })

    return {
      fieldsWithMerge: fields,
    }
  }, [fields, dieWidth, dieHeight, dieCols, dieRows, enabled, mergeThreshold])
}
