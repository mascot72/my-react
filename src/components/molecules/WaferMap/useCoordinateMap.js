// useCoordinateMap.js - 좌표 변환 및 히트맵 데이터 변환 유틸
// 1. convertOriginHeatmapDataToHDSHeatmapDataAsync: 원본 데이터(shot/chip 좌표, 값)를 히트맵용 [x, y, value]로 변환
// 2. 샘플 데이터 변환 예시: heatmap.ts의 generateSampleData와 연동

// heatmap 샘플 데이터 생성 함수 import (연동용)
import { generateSampleData } from './heatmap.ts'
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
export const convertOriginHeatmapDataToHDSHeatmapDataAsync = async (
  originData,
  shotOffset,
  shotMin,
  shotMax,
  shotXSize,
  shotYSize,
  chipXMin,
  chipYMin,
  chipXMax,
  chipYMax,
) => {
  const promise = new Promise((resolve, reject) => {
    try {
      // shotXSize <= shotYSize: Y축 기준 비율 보정
      if (shotXSize <= shotYSize) {
        return resolve(
          originData?.map((data) => {
            // x 좌표 변환: shotIndex + chip 상대좌표 비율 보정
            const x =
              (data[0] * shotOffset * shotYSize) / shotXSize +
              (((data[2] - chipXMin) / (chipXMax - chipXMin)) * shotOffset * shotYSize) / shotXSize
            // y 좌표 변환: shotIndex + chip 상대좌표 비율 보정
            const y =
              data[1] * shotOffset + ((data[3] - chipYMin) / (chipYMax - chipYMin)) * shotOffset - shotOffset / 2
            // value 정규화
            const value = (data[4] - shotMin) / (shotMax - shotMin)
            return [x, y, value]
          }),
        )
      }
      // shotXSize > shotYSize: X축 기준 비율 보정
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
    } catch (e) {
      reject(e)
    }
  })
  const result = await promise.then((res) => res)
  return result
}

/**
 * 샘플 데이터 변환 예시 함수
 * - heatmap.ts의 generateSampleData로 생성한 샘플을 본 변환 함수로 변환
 * - 실제 사용 시, originData 포맷에 맞게 변환 필요
 */
export async function convertSampleDataForHeatmap(count = 100, width = 512, height = 512) {
  // 1. 샘플 데이터 생성 ([{x, y, value}])
  const sample = generateSampleData(count, width, height)
  // 2. 샘플을 originData 포맷으로 변환 (임의 매핑)
  //    실제 데이터 구조에 맞게 변환 필요
  const originData = sample.map((d) => [d.x, d.y, d.x, d.y, d.value])
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
