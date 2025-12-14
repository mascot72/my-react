import type { SemPoint } from '../../../../../types/semPoint'

/**
 * SEM 포인트를 절대 좌표로 변환하고 Die에 매핑
 */
export interface SemPointMapped {
  semPoint: SemPoint
  /** Field 중심 절대 좌표 (mm) */
  fieldCenterX: number
  fieldCenterY: number
  /** SEM 포인트 절대 좌표 (mm) */
  absoluteX: number
  absoluteY: number
  /** 속한 Die의 상대 인덱스 (Field 내부) */
  dieCol: number | null
  dieRow: number | null
  /** Die 내부 상대 좌표 (mm, die left-bottom 기준) */
  dieLocalX: number | null
  dieLocalY: number | null
}

/**
 * Field 그리드 인덱스를 절대 좌표로 변환
 * indexX, indexY는 FieldPoint.fieldGridX, fieldGridY와 동일한 값 (중앙 기준)
 */
function fieldGridToCenter(
  gridX: number,
  gridY: number,
  fieldStepX: number,
  fieldStepY: number
): { cx: number; cy: number } {
  return {
    cx: gridX * fieldStepX,
    cy: gridY * fieldStepY,
  }
}

/**
 * 전체 SEM 포인트의 좌표 범위를 계산
 */
function calculatePointBounds(semPoints: SemPoint[]): {
  minX: number
  maxX: number
  minY: number
  maxY: number
} {
  if (semPoints.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  semPoints.forEach((p) => {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  })

  return { minX, maxX, minY, maxY }
}

/**
 * 절대 좌표를 Field 상대 좌표로 비율 변환
 * @param x 절대 X 좌표
 * @param y 절대 Y 좌표
 * @param bounds 전체 포인트의 좌표 범위
 * @param fieldWidth Field 너비 (mm)
 * @param fieldHeight Field 높이 (mm)
 */
function absoluteToFieldRelative(
  x: number,
  y: number,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  fieldWidth: number,
  fieldHeight: number
): { relX: number; relY: number } {
  const rangeX = bounds.maxX - bounds.minX
  const rangeY = bounds.maxY - bounds.minY

  // 범위가 0이면 중앙으로
  // if (rangeX === 0 || rangeY === 0) {
  //   return {
  //     relX: rangeX,
  //     relY: rangeY,
  //   }
  // }

  // 정규화 (0~1 범위)
  const normalizedX = rangeX === 0 ? 0 : (x - bounds.minX) / rangeX
  const normalizedY = rangeY === 0 ? 0 : (y - bounds.minY) / rangeY

  // Field 좌표계로 스케일링 (mm, left-bottom 기준)
  const relX = normalizedX * fieldWidth
  const relY = normalizedY * fieldHeight

  return { relX, relY }
}

/**
 * SEM 포인트가 어느 Die에 속하는지 계산
 * @param relX Field 내부 상대 X (μm, left-bottom 기준)
 * @param relY Field 내부 상대 Y (μm, left-bottom 기준)
 * @param fieldWidth Field 너비 (mm)
 * @param fieldHeight Field 높이 (mm)
 * @param dieCols Die 열 개수
 * @param dieRows Die 행 개수
 */
function findDieIndex(
  relX: number,
  relY: number,
  fieldWidth: number,
  fieldHeight: number,
  dieCols: number,
  dieRows: number
): { dieCol: number | null; dieRow: number | null; dieLocalX: number | null; dieLocalY: number | null } {
  // μm → mm 변환
  const relXMm = relX / 1000
  const relYMm = relY / 1000

  // Field left-bottom을 원점으로 했을 때, Field 좌표계는:
  // - left-bottom: (0, 0)
  // - right-top: (fieldWidth, fieldHeight)
  
  // 범위 체크
  if (relXMm < 0 || relXMm > fieldWidth || relYMm < 0 || relYMm > fieldHeight) {
    return { dieCol: null, dieRow: null, dieLocalX: null, dieLocalY: null }
  }

  const dieWidth = fieldWidth / dieCols
  const dieHeight = fieldHeight / dieRows

  // Die 인덱스 계산 (left-bottom 기준)
  const dieCol = Math.floor(relXMm / dieWidth)
  const dieRow = Math.floor(relYMm / dieHeight)

  // Die 내부 상대 좌표 (die left-bottom 기준)
  const dieLocalX = relXMm - dieCol * dieWidth
  const dieLocalY = relYMm - dieRow * dieHeight

  // 경계값 처리
  const finalDieCol = Math.min(dieCol, dieCols - 1)
  const finalDieRow = Math.min(dieRow, dieRows - 1)

  return {
    dieCol: finalDieCol,
    dieRow: finalDieRow,
    dieLocalX,
    dieLocalY,
  }
}

/**
 * SEM 포인트 배열을 Field/Die에 매핑
 * indexX/Y는 FieldPoint.fieldGridX/Y와 동일 (중앙 기준 그리드 좌표)
 * x/y는 절대 좌표이며, 전체 범위를 구해 Field 상대 좌표로 비율 변환
 */
export function mapSemPointsToFields(
  semPoints: SemPoint[],
  fieldStepX: number,
  fieldStepY: number,
  fieldWidth: number,
  fieldHeight: number,
  dieCols: number,
  dieRows: number
): SemPointMapped[] {
  if (semPoints.length === 0) {
    return []
  }

  // 1. 전체 포인트의 좌표 범위 계산
  const bounds = calculatePointBounds(semPoints)

  return semPoints.map((sp) => {
    // 2. Field 그리드 인덱스를 중심 좌표로 변환
    // indexX, indexY는 FieldPoint.fieldGridX, fieldGridY와 동일
    const { cx, cy } = fieldGridToCenter(sp.indexX, sp.indexY, fieldStepX, fieldStepY)

    // 3. 절대 좌표를 Field 상대 좌표로 비율 변환 (mm)
    const { relX, relY } = absoluteToFieldRelative(
      sp.x,
      sp.y,
      bounds,
      fieldWidth,
      fieldHeight
    )

    // 4. Field 내부 상대 좌표를 절대 좌표로 변환
    // Field center 기준으로 변환: left-bottom → center
    const absoluteX = cx - fieldWidth / 2 + relX
    const absoluteY = cy - fieldHeight / 2 + relY

    // 5. Die 인덱스 계산 (relX, relY는 이미 mm 단위)
    const { dieCol, dieRow, dieLocalX, dieLocalY } = findDieIndex(
      relX * 1000, // mm → μm
      relY * 1000,
      fieldWidth,
      fieldHeight,
      dieCols,
      dieRows
    )

    return {
      semPoint: sp,
      fieldCenterX: cx,
      fieldCenterY: -cy,
      absoluteX,
      absoluteY: -absoluteY,
      dieCol,
      dieRow,
      dieLocalX,
      dieLocalY,
    }
  })
}

/**
 * 특정 Field의 SEM 포인트만 필터링
 */
export function getSemPointsForField(
  mappedPoints: SemPointMapped[],
  fieldCenterX: number,
  fieldCenterY: number,
  tolerance = 0.01 // mm
): SemPointMapped[] {
  return mappedPoints.filter(
    (mp) =>
      Math.abs(mp.fieldCenterX - fieldCenterX) < tolerance &&
      Math.abs(mp.fieldCenterY - fieldCenterY) < tolerance
  )
}

/**
 * 특정 Die의 SEM 포인트만 필터링
 */
export function getSemPointsForDie(
  fieldSemPoints: SemPointMapped[],
  dieCol: number,
  dieRow: number
): SemPointMapped[] {
  return fieldSemPoints.filter((mp) => mp.dieCol === dieCol && mp.dieRow === dieRow)
}
