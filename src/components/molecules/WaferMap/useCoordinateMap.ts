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
