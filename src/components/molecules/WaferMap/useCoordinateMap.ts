// HEX 또는 rgb 색상 → [r,g,b] 배열로 변환
function parseColor(color: string): [number, number, number] {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '')
    const bigint = parseInt(hex, 16)
    if (hex.length === 6) {
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
    }
    if (hex.length === 3) {
      return [((bigint >> 8) & 15) * 17, ((bigint >> 4) & 15) * 17, (bigint & 15) * 17]
    }
  }
  // rgb(r,g,b) 문자열 처리
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (match) return [Number(match[1]), Number(match[2]), Number(match[3])]
  throw new Error('지원하지 않는 색상 포맷')
}

// 두 색상 사이 보간
function lerpColor(c1: [number, number, number], c2: [number, number, number], t: number): [number, number, number] {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ]
}

// value(0~1)에 따라 gradient 색상 반환
export function getGradientColor(value: number, startColor: string, endColor: string): string {
  const c1 = parseColor(startColor)
  const c2 = parseColor(endColor)
  const rgb = lerpColor(c1, c2, Math.max(0, Math.min(1, value)))
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
}
// Die 정보 타입
export type DieInfo = {
  dieXIndex: number
  dieYIndex: number
  dieAbsX: number
  dieAbsY: number
  dataIndex: number
  seqIndex: number
  shotIndex: { x: number; y: number }
}

// originData에 die 정보 및 인덱스 추가
export function addDieInfoToOriginData(
  originData: OriginDataTuple[],
  dieCountX: number,
  dieCountY: number,
  shotXMin: number,
  shotXMax: number,
  shotYMin: number,
  shotYMax: number,
): Array<{ xIndex: number; yIndex: number; xAxis: number; yAxis: number; value: number } & DieInfo> {
  const dieWidth = (shotXMax - shotXMin) / dieCountX
  const dieHeight = (shotYMax - shotYMin) / dieCountY
  return originData.map((row) => {
    const [xIndex, yIndex, xAxis, yAxis, value] = row
    const dieXIndex = Math.floor((xIndex - shotXMin) / dieWidth)
    const dieYIndex = Math.floor((yIndex - shotYMin) / dieHeight)
    const dieAbsX = shotXMin + dieXIndex * dieWidth
    const dieAbsY = shotYMin + dieYIndex * dieHeight
    const dataIndex = dieYIndex * dieCountX + dieXIndex
    const seqIndex = dieXIndex * dieCountY + dieYIndex
    const shotIndex = { x: dieXIndex, y: dieYIndex }
    return {
      xIndex,
      yIndex,
      xAxis,
      yAxis,
      value,
      dieXIndex,
      dieYIndex,
      dieAbsX,
      dieAbsY,
      dataIndex,
      seqIndex,
      shotIndex,
    }
  })
}

// die별 그룹화 및 min/max 좌표 계산
export function groupDieMinMax(
  dieDataArr: Array<OriginDataTuple & DieInfo>,
): Record<string, { minX: number; maxX: number; minY: number; maxY: number; data: Array<OriginDataTuple & DieInfo> }> {
  const group: Record<
    string,
    { minX: number; maxX: number; minY: number; maxY: number; data: Array<OriginDataTuple & DieInfo> }
  > = {}
  dieDataArr.forEach((row) => {
    const key = `${row.dieXIndex},${row.dieYIndex}`
    if (!group[key]) {
      group[key] = {
        minX: row[0],
        maxX: row[0],
        minY: row[1],
        maxY: row[1],
        data: [],
      }
    }
    group[key].minX = Math.min(group[key].minX, row[0])
    group[key].maxX = Math.max(group[key].maxX, row[0])
    group[key].minY = Math.min(group[key].minY, row[1])
    group[key].maxY = Math.max(group[key].maxY, row[1])
    group[key].data.push(row)
  })
  return group
}

// shotIndex를 포함한 히트맵 변환 결과 타입
export type HeatmapPointWithShot = {
  x: number
  y: number
  value: number
  shotIndex: { x: number; y: number }
}

// 히트맵 변환 함수 결과에 shotIndex 추가
export async function convertOriginHeatmapDataToHDSHeatmapDataAsyncWithShot(
  originData: OriginDataTuple[],
  shotBasePixel: number,
  shotMin: number,
  shotMax: number,
  shotXSize: number,
  shotYSize: number,
  chipXMin: number,
  chipYMin: number,
  chipXMax: number,
  chipYMax: number,
): Promise<HeatmapPointWithShot[]> {
  const xRatio = shotXSize > shotYSize ? 1 : shotYSize / shotXSize
  const yRatio = shotXSize > shotYSize ? shotXSize / shotYSize : 1
  return originData.map((data) => {
    let x = data[0] * shotBasePixel + ((data[2] - chipXMin) / (chipXMax - chipXMin)) * shotBasePixel
    x *= xRatio
    let y = data[1] * shotBasePixel + ((data[3] - chipYMin) / (chipYMax - chipYMin)) * shotBasePixel
    y *= yRatio
    const shotIndex = { x: data[0], y: data[1] }
    if (shotXSize > shotYSize) {
      y -= (shotBasePixel * shotXSize) / shotYSize / 2
    } else if (shotXSize < shotYSize) {
      x -= (shotBasePixel * shotYSize) / shotXSize / 2
    }
    const value = (data[4] - shotMin) / (shotMax - shotMin)
    return { x, y, value, shotIndex }
  })
}
// useCoordinateMap.ts - 좌표 변환 및 히트맵 데이터 변환 유틸
// 1. convertOriginHeatmapDataToHDSHeatmapDataAsync: 원본 데이터(shot/chip 좌표, 값)를 히트맵용 [x, y, value]로 변환
// 2. 샘플 데이터 변환 예시: heatmap.ts의 generateSampleData와 연동

import { generateSampleData } from './heatmap'

// 원본 데이터 타입
export type OriginDataTuple = [xIndex: number, yIndex: number, xAxis: number, yAxis: number, value: number]

// 변환 결과 타입
export type HeatmapPoint = {
  x: number
  y: number
  value: number
}

/**
 * convertOriginHeatmapDataToHDSHeatmapDataAsync
 * - 원본 데이터(shot/chip 좌표, 값)를 히트맵용 [x, y, value]로 변환
 * - shot/chip 좌표를 실제 x, y로 변환하고, value를 min~max로 정규화
 * - shotXSize/shotYSize에 따라 분기 처리(비율 보정)
 * - 반환: [[x, y, value], ...] 배열
 *
 * originData: [[xIndex, yIndex, xAxis, yAxis, value], ...]
 * shotOffset: shot 간격(px)
 * shotMin/shotMax: 값 정규화용 min/max
 * shotXSize/shotYSize: shot 배열 크기
 * chipXMin/chipXMax, chipYMin/chipYMax: chip 좌표 범위
 */
export async function convertOriginHeatmapDataToHDSHeatmapDataAsync(
  originData: OriginDataTuple[],
  shotOffset: number,
  shotMin: number,
  shotMax: number,
  shotXSize: number,
  shotYSize: number,
  chipXMin: number,
  chipYMin: number,
  chipXMax: number,
  chipYMax: number,
): Promise<[number, number, number][]> {
  return new Promise((resolve, reject) => {
    try {
      if (shotXSize <= shotYSize) {
        resolve(
          originData?.map((data) => {
            const x =
              (data[0] * shotOffset * shotYSize) / shotXSize +
              (((data[2] - chipXMin) / (chipXMax - chipXMin)) * shotOffset * shotYSize) / shotXSize
            const y =
              data[1] * shotOffset + ((data[3] - chipYMin) / (chipYMax - chipYMin)) * shotOffset - shotOffset / 2
            const value = (data[4] - shotMin) / (shotMax - shotMin)
            return [x, y, value]
          }),
        )
      } else {
        resolve(
          originData?.map((data) => {
            const x = data[0] * shotOffset + ((data[2] - chipXMin) / (chipXMax - chipXMin)) * shotOffset
            const y =
              (data[1] * shotOffset * shotXSize) / shotYSize +
              (((data[3] - chipYMin) / (chipYMax - chipYMin)) * shotOffset * shotXSize) / shotYSize -
              (shotOffset * shotXSize) / shotYSize / 2
            const value = (data[4] - shotMin) / (shotMax - shotMin)
            return [x, y, value]
          }),
        )
      }
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 샘플 데이터 변환 예시 함수
 * - heatmap.ts의 generateSampleData로 생성한 샘플을 본 변환 함수로 변환
 * - 실제 사용 시, originData 포맷에 맞게 변환 필요
 */
export async function convertSampleDataForHeatmap(
  count: number = 100,
  width: number = 512,
  height: number = 512,
): Promise<[number, number, number][]> {
  // 1. 샘플 데이터 생성 ([{x, y, value}])
  const sample: HeatmapPoint[] = generateSampleData(count, width, height)
  // 2. 샘플을 originData 포맷으로 변환 (임의 매핑)
  const originData: OriginDataTuple[] = sample.map((d) => [d.x, d.y, d.x, d.y, d.value])
  // 3. 변환 함수 호출 (임의 파라미터)
  const result = await convertOriginHeatmapDataToHDSHeatmapDataAsync(
    originData,
    10, // shotOffset
    0, // shotMin
    2, // shotMax
    10, // shotXSize
    10, // shotYSize
    0, // chipXMin
    0, // chipYMin
    width, // chipXMax
    height, // chipYMax
  )
  return result // [[x, y, value], ...]
}
