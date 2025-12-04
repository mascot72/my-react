import type { PaletteGroup } from '../../../../../app/usePalette'

/**
 * 팔레트에서 백분율(0~100)에 해당하는 색상을 반환합니다.
 * @param percentage 0~100 범위의 값
 * @param palette PaletteGroup (null이면 기본 색상 반환)
 * @returns 16진수 색상 코드 (#RRGGBB)
 */
export function getColorFromPalette(percentage: number, palette: PaletteGroup | null): string {
  if (!palette) {
    // 기본 색상: 파란색 -> 빨간색 그라데이션
    const t = Math.max(0, Math.min(1, percentage / 100))
    const r = Math.floor(255 * t)
    const g = Math.floor(255 * (1 - Math.abs(t - 0.5) * 2))
    const b = Math.floor(255 * (1 - t))
    return `rgb(${r},${g},${b})`
  }

  // Clamp percentage to 0-100
  const p = Math.max(0, Math.min(100, percentage))

  if (palette.type === 'Gradation') {
    // Gradation: 두 색상 사이의 선형 보간
    return interpolateColor(palette.colors[0], palette.colors[1], p / 100)
  }

  // Step: 구간에 맞는 색상 선택
  if (palette.stops && palette.stops.length > 0) {
    for (let i = 0; i < palette.stops.length; i++) {
      const stop = palette.stops[i]
      if (p >= stop.from && p <= stop.to) {
        return palette.colors[i] || '#000000'
      }
    }
  }

  // Fallback
  return palette.colors[0] || '#000000'
}

/**
 * 두 색상 사이를 선형 보간합니다.
 * @param color1 시작 색상 (16진수)
 * @param color2 종료 색상 (16진수)
 * @param t 보간 비율 (0~1)
 * @returns 보간된 색상 (16진수)
 */
function interpolateColor(color1: string, color2: string, t: number): string {
  const c1 = parseHexColor(color1)
  const c2 = parseHexColor(color2)

  const r = Math.round(c1.r + (c2.r - c1.r) * t)
  const g = Math.round(c1.g + (c2.g - c1.g) * t)
  const b = Math.round(c1.b + (c2.b - c1.b) * t)

  return `rgb(${r}, ${g}, ${b})`
}

/**
 * 16진수 색상 코드를 RGB 객체로 파싱합니다.
 * @param hex 16진수 색상 (#RRGGBB 또는 #RRGGBBAA)
 * @returns { r, g, b } 객체
 */
function parseHexColor(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  let h = hex.replace('#', '')

  // Handle 8-char (with alpha) by removing alpha
  if (h.length === 8) {
    h = h.substring(0, 6)
  }

  // Pad to 6 chars if needed
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }

  const num = parseInt(h, 16)
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  }
}

/**
 * SEM Point들의 value 배열에서 Field별 평균을 계산하고,
 * 전체 평균을 백분율로 정규화합니다.
 *
 * @param fieldValueMap Field 그리드 좌표 -> value 배열 매핑
 *   예: { "-5,0": [1.43, 1.46], "-4,-2": [1.49], ... }
 * @returns Field 그리드 좌표 -> 백분율 매핑
 *   예: { "-5,0": 10.5, "-4,-2": 20.3, ... }
 */
export function calculateFieldPercentages(fieldValueMap: Record<string, number[]>): Record<string, number> {
  const fieldAverages: Record<string, number> = {}

  // 1. 각 Field의 평균값 계산
  for (const key in fieldValueMap) {
    const values = fieldValueMap[key]
    if (values.length > 0) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      fieldAverages[key] = avg
    }
  }

  // 2. 전체 평균들의 min/max 구하기
  const averageValues = Object.values(fieldAverages)
  if (averageValues.length === 0) {
    return {}
  }

  const minAvg = Math.min(...averageValues)
  const maxAvg = Math.max(...averageValues)
  const rangeAvg = maxAvg - minAvg

  // 3. 백분율로 정규화 (0~100)
  const fieldPercentages: Record<string, number> = {}
  for (const key in fieldAverages) {
    if (rangeAvg === 0) {
      fieldPercentages[key] = 50 // min == max일 때는 50%
    } else {
      const percentage = ((fieldAverages[key] - minAvg) / rangeAvg) * 100
      fieldPercentages[key] = percentage
    }
  }

  return fieldPercentages
}

/**
 * SEM Point 배열에서 Field별 value 맵을 생성합니다.
 *
 * @param semPoints SEM 포인트 배열
 * @returns Field 그리드 좌표 -> value 배열 매핑
 */
export function buildFieldValueMap(semPoints: Array<{ indexX: number; indexY: number; value: number }>): Record<string, number[]> {
  const map: Record<string, number[]> = {}

  for (const point of semPoints) {
    const key = `${point.indexX},${point.indexY}`
    if (!map[key]) {
      map[key] = []
    }
    map[key].push(point.value)
  }

  return map
}

/**
 * Field의 백분율을 가져옵니다.
 * @param fieldGridX Field 그리드 X 좌표
 * @param fieldGridY Field 그리드 Y 좌표
 * @param fieldPercentages Field별 백분율 맵
 * @returns 백분율 (0~100) 또는 null (데이터 없음)
 */
export function getFieldPercentage(
  fieldGridX: number,
  fieldGridY: number,
  fieldPercentages: Record<string, number>
): number | null {
  const key = `${fieldGridX},${fieldGridY}`
  return fieldPercentages[key] ?? null
}
