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
 */
function fieldIndexToCenter(
  indexX: number,
  indexY: number,
  fieldStepX: number,
  fieldStepY: number
): { cx: number; cy: number } {
  return {
    cx: indexX * fieldStepX,
    cy: indexY * fieldStepY,
  }
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
  return semPoints.map((sp) => {
    // Field 중심 좌표 계산 (mm)
    const { cx, cy } = fieldIndexToCenter(sp.indexX, sp.indexY, fieldStepX, fieldStepY)

    // Field 내부 상대 좌표를 절대 좌표로 변환
    // Field center 기준으로 변환: left-bottom → center
    // left-bottom (0, 0) → center (-fieldWidth/2, -fieldHeight/2)
    const relXMm = sp.x / 1000 // μm → mm
    const relYMm = sp.y / 1000

    const absoluteX = cx - fieldWidth / 2 + relXMm
    const absoluteY = cy - fieldHeight / 2 + relYMm

    // Die 인덱스 계산
    const { dieCol, dieRow, dieLocalX, dieLocalY } = findDieIndex(
      sp.x,
      sp.y,
      fieldWidth,
      fieldHeight,
      dieCols,
      dieRows
    )

    return {
      semPoint: sp,
      fieldCenterX: cx,
      fieldCenterY: cy,
      absoluteX,
      absoluteY,
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
