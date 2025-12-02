import { useMemo } from 'react'
import type { Field, PointDataSet } from '../types'

interface UsePointDataOptions {
  fields: Field[]
  includeNullDies?: boolean // true면 cdu가 null인 die도 포인트로 포함
}

/**
 * Field/Die 데이터를 PointDataSet으로 변환
 * - diePoints: 모든 die의 (x, y, value) 포인트 배열
 * - fieldPoints: 모든 field의 중심점 및 평균값 배열
 */
export function usePointData({
  fields,
  includeNullDies = false,
}: UsePointDataOptions): PointDataSet {
  return useMemo(() => {
    const diePoints: PointDataSet['diePoints'] = []
    const fieldPoints: PointDataSet['fieldPoints'] = []

    fields.forEach((field, fieldIndex) => {
      // Field의 그리드 좌표 계산 (중앙 기준)
      // cx, cy를 fieldStepX/Y로 나누면 그리드 인덱스
      // 현재는 cx, cy가 이미 mm 단위 좌표이므로 field 중심을 그대로 사용
      
      // Field의 평균 CDU 계산
      const validDies = field.dies.filter(d => d.cdu !== null)
      const fieldAvg = validDies.length > 0
        ? validDies.reduce((sum, d) => sum + (d.cdu ?? 0), 0) / validDies.length
        : null

      // FieldPoint 추가
      fieldPoints.push({
        x: field.cx,
        y: field.cy,
        value: fieldAvg,
        shotIndex: field.shotIndex,
        // fieldGridX/Y는 나중에 필요시 계산 (현재는 cx/cy 사용)
      })

      // Die points 추가
      field.dies.forEach((die, dieIndex) => {
        if (includeNullDies || die.cdu !== null) {
          diePoints.push({
            x: die.x,
            y: die.y,
            value: die.cdu,
            fieldIndex,
            dieIndex,
          })
        }
      })
    })

    return {
      diePoints,
      fieldPoints,
    }
  }, [fields, includeNullDies])
}
