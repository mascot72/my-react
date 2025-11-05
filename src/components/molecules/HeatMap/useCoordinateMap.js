// useCoordinateMap.js - 좌표 변환 및 히트맵 데이터 변환 유틸
// 1. convertOriginHeatmapDataToHDSHeatmapDataAsync: 원본 데이터(shot/chip 좌표, 값)를 히트맵용 [x, y, value]로 변환
// 2. 샘플 데이터 변환 예시: heatmap.ts의 generateSampleData와 연동

// heatmap 샘플 데이터 생성 함수 import (연동용)
import { generateSampleData } from './heatmap.ts'

// 값 정규화 비율 계산 함수
export const getRatio = (value, min, max) => {
  if (max === min) return 0 // 분모 0 방지
  return (value - min) / (max - min)
}

/**
 * convertOriginHeatmapDataToHDSHeatmapDataAsync
 * - 원본 데이터(shot/chip 좌표, 값)를 히트맵용 [x, y, value]로 변환
 * - shot/chip 좌표를 실제 x, y로 변환하고, value를 min~max로 정규화
 * - shotXSize/shotYSize에 따라 분기 처리(비율 보정)
 * - 반환: [[x, y, value], ...] 배열
 *
 * originData: [[chipIndexX, chipIndexY, xAxis, yAxis, value], ...]
 * shotBasePixel: shot 간격(px), 1개의 shot width pixels 크기: 예) 32.103515625
 * shotMin/shotMax: 값 정규화용 min/max
 * shotXSize/shotYSize: shot 배열 크기 13 / 11
 * chipXMin/chipXMax, chipYMin/chipYMax: chip 좌표 범위
 */

// shotIndex 계산: chipIndexX, chipIndexY를 shotIndex로 사용
// 결과에 shotIndex 추가
export const convertOriginHeatmapDataToHDSHeatmapDataAsync = async (
  originData,
  shotBasePixel,
  shotMin,
  shotMax,
  shotXSize,
  shotYSize,
  chipXMin,
  chipYMin,
  chipXMax,
  chipYMax,
) => {
  // shotXSize와 shotYSize의 비율에 따라 보정값 결정
  const xRatio = shotXSize > shotYSize ? 1 : shotYSize / shotXSize
  const yRatio = shotXSize > shotYSize ? shotXSize / shotYSize : 1

  const result = originData?.map((data) => {
    // data: [chipIndexX, chipIndexY, x, y, value]
    // chipIndexX, chipIndexY: shot 배열 내 인덱스
    // xAxis, yAxis: chip 좌표값
    // value: 측정값
    const [chipIndexX, chipIndexY, chipX, chipY, pointValue] = data

    // x 좌표 변환 (공통)
    let x = chipIndexX * shotBasePixel + getRatio(chipX, chipXMin, chipXMax) * shotBasePixel
    x *= xRatio

    // y 좌표 변환 (공통)
    let y = chipIndexY * shotBasePixel + getRatio(chipY, chipYMin, chipYMax) * shotBasePixel
    y *= yRatio

    // shotIndex 계산 (chipIndexX, chipIndexY)
    const shotIndex = { x: chipIndexX, y: chipIndexY }

    // 중앙 보정 (shot 배열 비정방일 때만 적용)
    if (shotXSize > shotYSize) {
      y -= (shotBasePixel * shotXSize) / shotYSize / 2
    } else if (shotXSize < shotYSize) {
      x -= (shotBasePixel * shotYSize) / shotXSize / 2
    } else {
      // 정방 shot 배열일 때는 중앙 보정 없음
    }

    // value 정규화
    const value = getRatio(pointValue, shotMin,)
    return { x, y, value, shotIndex }
  })
  return result
}

// die별 그룹화 및 min/max 좌표 계산 함수
export const groupDieMinMax = (dieDataArr) => {
  // dieDataArr: addDieInfoToOriginData 결과 배열
  // dieXIndex, dieYIndex 기준으로 그룹화 후 각 그룹의 min/max 계산
  const group = {}
  dieDataArr.forEach((row) => {
    const key = `${row.dieXIndex},${row.dieYIndex}`
    if (!group[key]) {
      group[key] = {
        minX: row.x,
        maxX: row.x,
        minY: row.y,
        maxY: row.y,
        data: [],
      }
    }
    group[key].minX = Math.min(group[key].minX, row.x)
    group[key].maxX = Math.max(group[key].maxX, row.x)
    group[key].minY = Math.min(group[key].minY, row.y)
    group[key].maxY = Math.max(group[key].maxY, row.y)
    group[key].data.push(row)
  })
  return group // { '0,0': {minX, maxX, minY, maxY, data: [...]}, ... }
}

export const addDieInfoToOriginData = (originData, dieCountX, dieCountY, shotXMin, shotXMax, shotYMin, shotYMax) => {
  const dieWidth = (shotXMax - shotXMin) / dieCountX
  const dieHeight = (shotYMax - shotYMin) / dieCountY
  return originData.map((row, i) => {
    const [x, y, ...rest] = row
    const dieXIndex = Math.floor((x - shotXMin) / dieWidth)
    const dieYIndex = Math.floor((y - shotYMin) / dieHeight)
    // 절대좌표 계산
    const dieAbsX = shotXMin + dieXIndex * dieWidth
    const dieAbsY = shotYMin + dieYIndex * dieHeight
    // dataIndex: wafer 전체에서 좌상단부터 우하단까지
    const dataIndex = dieYIndex * dieCountX + dieXIndex
    // seqIndex: y축으로 증가, 맨 위까지 올라가면 x축 오른쪽으로 이동
    const seqIndex = dieXIndex * dieCountY + dieYIndex
    // shotIndex: x, y 좌표를 die 기준으로 역산
    const shotIndex = { x: Math.floor((x - shotXMin) / dieWidth), y: Math.floor((y - shotYMin) / dieHeight) }
    return {
      ...row,
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
    10, // shotBasePixel
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
