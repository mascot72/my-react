import { useMemo } from 'react'
import type { SemPoint } from '../../../../../types/semPoint'
import { mapSemPointsToFields } from '../utils/semPointMapper'
import type { SemPointDataSet, DiePointWithSemPoints, FieldPointWithSemPoints } from '../types'

interface UseSemPointDataOptions {
  semPoints: SemPoint[]
  fieldStepX: number
  fieldStepY: number
  fieldWidth: number
  fieldHeight: number
  dieCols: number
  dieRows: number
}

/**
 * Hierarchical SEM 포인트 데이터 생성 훅
 * 
 * === 계층 구조 ===
 * Wafer
 *   └─ Field (gridX, gridY)
 *       └─ Die (col, row)
 *           └─ SemPoints[]
 * 
 * === 변환 프로세스 ===
 * 1. mapSemPointsToFields: 절대좌표 SemPoint → Field/Die 좌표 + Die 내부 상대좌표
 * 2. Field/Die 기반 그룹핑: indexX/Y, dieCol/Row를 키로 그룹화
 * 3. 계층별 평균값 계산:
 *    - FieldPointWithSemPoints.value: 이 Field의 모든 SemPoint 평균
 *    - DieGroupedSemPoints.value: Die별 SemPoint 평균
 *    - DiePointWithSemPoints.value: Die 내 SemPoint 평균
 * 
 * === 출력 구조 ===
 * SemPointDataSet:
 *   - diePointsWithSem[]: Die 포인트 + 포함 SemPoint
 *   - fieldPointsWithSem[]: Field 포인트 + 포함 SemPoint (Die별 그룹화)
 *   - allSemPointsMapped[]: 모든 매핑 SemPoint (캐시용)
 * 
 * === 사용 예제 ===
 * // Die 레벨 접근
 * diePointsWithSem.forEach(die => {
 *   console.log(`Die(${die.dieCol}, ${die.dieRow}):`, die.semPoints)
 * })
 * 
 * // Field 레벨 접근
 * fieldPointsWithSem.forEach(field => {
 *   field.dieGroupedSemPoints.forEach(dieGroup => {
 *     console.log(`Field(${field.fieldGridX}, ${field.fieldGridY}) Die(${dieGroup.dieCol}, ${dieGroup.dieRow}):`, dieGroup.semPoints)
 *   })
 * })
 */
export function useSemPointData({
  semPoints,
  fieldStepX,
  fieldStepY,
  fieldWidth,
  fieldHeight,
  dieCols,
  dieRows,
}: UseSemPointDataOptions): SemPointDataSet {
  return useMemo(() => {
    if (semPoints.length === 0) {
      return {
        diePointsWithSem: [],
        fieldPointsWithSem: [],
        allSemPointsMapped: [],
      }
    }

    // 1. SEM 포인트를 Field/Die에 매핑
    const mappedSemPoints = mapSemPointsToFields(
      semPoints,
      fieldStepX,
      fieldStepY,
      fieldWidth,
      fieldHeight,
      dieCols,
      dieRows
    )

    // 2. Field Grid 기반으로 SEM 포인트 그룹핑
    // indexX, indexY (FieldPoint.fieldGridX, fieldGridY)를 키로 사용
    const fieldSemPointsMap = new Map<string, typeof mappedSemPoints>()

    mappedSemPoints.forEach((mapped) => {
      const key = `${mapped.semPoint.indexX},${mapped.semPoint.indexY}`
      if (!fieldSemPointsMap.has(key)) {
        fieldSemPointsMap.set(key, [])
      }
      fieldSemPointsMap.get(key)!.push(mapped)
    })

    // 3. Die 기반으로 SEM 포인트 그룹핑
    // (fieldGridX, fieldGridY, dieCol, dieRow)의 조합을 키로 사용
    const dieSemPointsMap = new Map<string, typeof mappedSemPoints>()

    mappedSemPoints.forEach((mapped) => {
      const { semPoint, dieCol, dieRow } = mapped
      if (dieCol !== null && dieRow !== null) {
        const key = `${semPoint.indexX},${semPoint.indexY},${dieCol},${dieRow}`
        if (!dieSemPointsMap.has(key)) {
          dieSemPointsMap.set(key, [])
        }
        dieSemPointsMap.get(key)!.push(mapped)
      }
    })

    // 4. DiePoint 데이터 생성 (SEM 포인트 포함)
    const diePointsWithSem: DiePointWithSemPoints[] = Array.from(
      dieSemPointsMap.entries()
    ).map(([key, semPointsList]) => {
      const [indexX, indexY, dieCol, dieRow] = key
        .split(',')
        .map((v, i) => (i < 2 ? parseInt(v) : parseInt(v)))

      // Die의 절대 좌표 계산
      const fieldCenterX = indexX * fieldStepX
      const fieldCenterY = indexY * fieldStepY
      const dieWidth = fieldWidth / dieCols
      const dieHeight = fieldHeight / dieRows

      // Die의 좌측 하단 기준 상대 좌표
      const dieLeftX = fieldCenterX - fieldWidth / 2 + dieCol * dieWidth
      const dieBottomY = fieldCenterY - fieldHeight / 2 + dieRow * dieHeight

      // Die 중심 좌표
      const x = dieLeftX + dieWidth / 2
      const y = dieBottomY + dieHeight / 2

      // SEM 포인트 값의 평균
      const avgValue =
        semPointsList.length > 0
          ? semPointsList.reduce((sum, sp) => sum + sp.semPoint.value, 0) /
            semPointsList.length
          : null

      return {
        x,
        y,
        value: avgValue,
        fieldGridX: indexX,
        fieldGridY: indexY,
        dieCol,
        dieRow,
        semPoints: semPointsList.map((mp) => ({
          ...mp.semPoint,
          dieLocalX: mp.dieLocalX,
          dieLocalY: mp.dieLocalY,
        })),
      }
    })

    // 5. FieldPoint 데이터 생성 (SEM 포인트 포함)
    const fieldPointsWithSem: FieldPointWithSemPoints[] = Array.from(
      fieldSemPointsMap.entries()
    ).map(([key, semPointsList]) => {
      const [indexX, indexY] = key.split(',').map(Number)
      const fieldCenterX = indexX * fieldStepX
      const fieldCenterY = indexY * fieldStepY

      // SEM 포인트 값의 평균
      const avgValue =
        semPointsList.length > 0
          ? semPointsList.reduce((sum, sp) => sum + sp.semPoint.value, 0) /
            semPointsList.length
          : null

      // Field 내 Die별 SEM 포인트 그룹핑
      const dieGroups = new Map<string, typeof semPointsList>()
      semPointsList.forEach((sp) => {
        const { dieCol, dieRow } = sp
        if (dieCol !== null && dieRow !== null) {
          const dieKey = `${dieCol},${dieRow}`
          if (!dieGroups.has(dieKey)) {
            dieGroups.set(dieKey, [])
          }
          dieGroups.get(dieKey)!.push(sp)
        }
      })

      return {
        x: fieldCenterX,
        y: fieldCenterY,
        value: avgValue,
        fieldGridX: indexX,
        fieldGridY: indexY,
        semPoints: semPointsList.map((mp) => ({
          ...mp.semPoint,
          dieLocalX: mp.dieLocalX,
          dieLocalY: mp.dieLocalY,
        })),
        dieGroupedSemPoints: Array.from(dieGroups.entries()).map(
          ([dieKey, points]) => {
            const [dieCol, dieRow] = dieKey.split(',').map(Number)
            const avgDieValue =
              points.length > 0
                ? points.reduce((sum, sp) => sum + sp.semPoint.value, 0) /
                  points.length
                : null
            return {
              dieCol,
              dieRow,
              value: avgDieValue,
              semPoints: points.map((mp) => ({
                ...mp.semPoint,
                dieLocalX: mp.dieLocalX,
                dieLocalY: mp.dieLocalY,
              })),
            }
          }
        ),
      }
    })

    return {
      diePointsWithSem,
      fieldPointsWithSem,
      allSemPointsMapped: mappedSemPoints,
    }
  }, [semPoints, fieldStepX, fieldStepY, fieldWidth, fieldHeight, dieCols, dieRows])
}
