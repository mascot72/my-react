/**
 * SEM 측정 포인트 데이터 타입
 * [indexX, indexY, x, y, value, siteSeq]
 * - indexX, indexY: Field 그리드 인덱스
 * - x, y: Field 내부 상대 좌표 (μm, left-bottom 기준)
 * - value: 측정값
 * - siteSeq: 사이트 시퀀스 번호
 */
export type SemPointRaw = [number, number, number, number, number, number]

/**
 * SEM 측정 포인트 (구조화된 형태)
 */
export interface SemPoint {
  /** Field X 인덱스 (그리드 좌표) */
  indexX: number
  /** Field Y 인덱스 (그리드 좌표) */
  indexY: number
  /** Field 내부 상대 X 좌표 (μm, left-bottom 기준) */
  x: number
  /** Field 내부 상대 Y 좌표 (μm, left-bottom 기준) */
  y: number
  /** 측정값 */
  value: number
  /** 사이트 시퀀스 */
  siteSeq: number
}

/**
 * SemPointRaw를 SemPoint 구조체로 변환
 */
export function parseSemPoint(raw: SemPointRaw): SemPoint {
  return {
    indexX: raw[0],
    indexY: raw[1],
    x: raw[2],
    y: raw[3],
    value: raw[4],
    siteSeq: raw[5],
  }
}

/**
 * 배열 형태의 SEM 포인트 데이터를 구조화
 */
export function parseSemPoints(rawPoints: SemPointRaw[]): SemPoint[] {
  return rawPoints.map(parseSemPoint)
}
