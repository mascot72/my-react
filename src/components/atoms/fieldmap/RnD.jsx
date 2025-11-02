/**
 * Wafer Field CDU Convert V1
 * - 처리 방법
 * 1) Shot 그룹별로 포인트 맵 생성
 *  - 샷 그룹별 포인트 맵: Map<shotKey, Array<point>>
 *  - 샷 그룹: 동일한 샷 위치(칩 인덱스 기준)에 속하는 포인트 집합
 *  - point: { chipX, chipY, value, ... }
 * 2) Shot 내부에서 다이그리드 맵 생성
 *  - 샷 내부 다이그리드 맵 생성
 *  - 다이그리드 맵: Map<dieKey, Array<point>>
 *  - 다이그리드 맵 분할: 샷 내부 좌표 정규화 후 다이 인덱스 계산
 *  - dieKey: "dieX,dieY"
 *  - Die에 속한 Point가 있으면 표시, 없으면 빈 셀로 처리
 * 3) 다이그리드 맵을 기반으로 Mat 셀 객체 생성
 *  - Mat 셀 객체: { INDEX_X, INDEX_Y, DIE_X, DIE_Y, MAT_X, MAT_Y, VAL_AVG, POINTS }
 *  - MAT_X, MAT_Y: 다이그리드 맵 내에서 물리적 위치 기준 행/열 인덱스
 *  - VAL_AVG: 해당 Mat 셀에 속한 포인트들의 평균 값
 *  - POINTS: 해당 Mat 셀에 속한 포인트 배열
 * 4) 행/열 병합 처리
 *  - 인접한 행/열 중복 없는 경우 병합하여 행/열 수 감소
 *  - 행/열 병합 시 MAT_X, MAT_Y 인덱스 조정
 * 5) 최종 Mat 셀 배열 반환
 *  - 반환 값: Array<MatCell>
 *  - MatCell: { INDEX_X, INDEX_Y, DIE_X, DIE_Y, MAT_X, MAT_Y, VAL_AVG, POINTS }
 *  - useMemo 훅을 사용하여 semPoints, shotSplit 변경 시에만 재계산
 *  - 처리 성능 최적화 및 불필요한 렌더링 방지
 */

import { useMemo } from 'react'

// Shot별 다이그리드 맵 생성
const mapInitData = {
  // Shot 기준 정보
  arraySizeX: 13, arraySizeY: 11, centerX: 7, centerY: 5, mapOffsetY: 12790500, mapOffsetY: 1429000, shotSizeX: 25581000, shotSizeY: 32022000,
  // Die 그리드 분할 수
  mapShotSize: [{ mapSeq: 37, dieXCnt: 3, dieYCnt: 6, xaxis: 11, yaxis: 34 }],
}
// Point 데이터 (Shot 내부 포인트)
const pointData = [{
  chip: '-5, 0',
  chipindexX: -5000, chipindexY: 0,
  chipx: 536144000, chipy: 124631000,
  siteSeq: 27,
  value: -0.47,
  imageYn: 'Y',
  lotId: 'TH10174',
  wfId: '14',
  prmtNm: '999_BLC_OVL_Y_TIS_180',
}]

// Shot 통계 데이타
const config = {
  chipXMax: 536144, chipXMin: 536144, chipYMax: 5461631, chipYMin: 124631, shotMax: -0.21, shotMaxVal: -0.21, shotMin: -1.28, shotMinVal: -1.28, shotXSize: 13, shotYSize: 11, shotAverages: [ [-5, 0, 1.46, '-5,0', 1],], chipXMin: 536144, chipXMax: 536144, chipYMin: 124631, chipYMax: 5461631, shotOffset: 13 
}
// Shot 그룹별 포인트 맵 ([indeX, indexY, x, y, value, siteSeq])
const matData = [
  [-5, 0, 536144, 124621, 1.43, 1],
  [-5, 1, 536143, 124631, 1.46, 2],
  [-4, -2, 536124, 124641, 1.49, 3],
  [-4, 1, 536143, 124651, 1.52, 4],
  [-2, 0, 536144, 124661, 1.55, 5],
  [-2, 2, 536124, 124671, 1.58, 6],
  [-1, 1, 536144, 124681, 1.61, 7],
  [-1, 2, 536144, 114691, 1.64, 8],
  [0, 0, 536144, 124701, 1.67, 9],
  [1, 1, 536141, 122711, 1.70, 10],
  [3, 2, 536146, 124728, 1.73, 11],
  [3, 2, 536267, 124738, 1.13, 12],
  [3, 2, 536317, 125775, 1.74, 13],
  // ...
]

export  default function RnD() {

// shotGroups: Map<shotKey, Array<point>>: '-5,0' => [{chipX, chipY, value, siteSeq}, ...]
// const shotGroups = pointData.reduce((map, p) => {
//   const shotKey = `${p.chipindexX},${p.chipindexY}`
//   if (!map.has(shotKey)) map.set(shotKey, [])
//   map.get(shotKey).push({
//     chipX: p.chipx,
//     chipY: p.chipy,
//     value: p.value,
//     siteSeq: p.siteSeq,
//   })
//   return map
// }, new Map())
const shotGroups = matData.reduce((map, p) => {
  const [chipindexX, chipindexY, chipx, chipy, value, siteSeq] = p
  const shotKey = `${chipindexX},${chipindexY}`
  if (!map.has(shotKey)) map.set(shotKey, [])
  map.get(shotKey).push({
    chipX: chipx,
    chipY: chipy,
    value: value,
    siteSeq: siteSeq,
  })
  return map
}, new Map())

const [{ dieXCnt, dieYCnt }] = mapInitData.mapShotSize // 샷 내부 다이 그리드 분할 수
const GRID = { x: dieXCnt, y: dieYCnt }
const result = new Map()

// Shot 안에서 정규화 -> 다이 인덱스
// dieMap: Map<dieKey, Array<point>>: '0,0' => [point, point, ...]
// shotGroups: Map<shotKey, Array<point>>: '-5, 0' => [{chipX, chipY, value, siteSeq}, ...]
// result: Map<shotKey, dieMap>: '-5,0' => dieMap['dieKey' => [point, point, ...]]
shotGroups.forEach((samples, shotKey)=> {
  const minX = Math.min(...samples.map(p => p.chipX))
  const maxX = Math.max(...samples.map(p => p.chipX))
  const minY = Math.min(...samples.map(p => p.chipY))
  const maxY = Math.max(...samples.map(p => p.chipY))
  const deltaX = maxX > minX ? maxX - minX : 1
  const deltaY = maxY > minY ? maxY - minY : 1
  const dieMap = new Map()

  console.log('Processing shotKey:', shotKey, ',minX:', minX, ',maxX:', maxX, ',minY:', minY, ',maxY:', maxY, ', deltaX:', deltaX, ', deltaY:', deltaY )
  
  samples.forEach((p, idx) => {
    const normX = (p.chipX - minX) / deltaX
    const normY = (p.chipY - minY) / deltaY

    // const dieX = Math.floor(normX * GRID.x - 0.000001) // GRIDx,y = 샷내부 die 분할수
    // const dieY = Math.floor(normY * GRID.y - 0.000001)
    const clampedX = Math.min(Math.max(normX, 0), 0.999999)
    const clampedY = Math.min(Math.max(normY, 0), 0.999999)
    const dieX = Math.floor(clampedX * GRID.x)// 다이 인덱스 계산
    const dieY = Math.floor(clampedY * GRID.y)

    const dieKey = `${dieX},${dieY}`
    console.log(idx, ' normX:', normX, 'normY:', normY, '-> dieKey', dieKey)
    const point = { ...p, value: p.value ?? 0 }
    if (!dieMap.has(dieKey)) dieMap.set(dieKey, [])
    dieMap.get(dieKey).push(point)
  })

  result.set(shotKey, dieMap)
})

console.log('RnD V1 shotGroups:', shotGroups)
console.log('RnD V1 Result:', result)

//** UcFieldCduMapSvg **
const matCells = useMemo(() => {
  const devide = 1000
  // Shot 내부 다이그리드 맵 생성: Key 순서가 어떻게 될지 연구할 부분
  semPoints.forEach((pts, refKey) => {
    pts.forEach((p) => {
      const dieKey = `${Math.floor(p.Location.x / (shotSplit.x * devide))},${Math.floor(
        p.Location.y / (shotSplit.y * devide),
      )}`
      const arr = dieMap.get(dieKey) ?? []
      arr.push(p)
      dieMap.set(dieKey, arr)
    })
  })

  // 이 부분에서 위와 아래 속성 전달이 잘못 되었다!, 해결할 부분임.
  // pts, pts.Location.x, pts.Location.y 등등

  // 1. 물리 정렬 - 내림차순(높이 기준)
  const yList = [...new Set(pts.map(p => p.Location))].sort((a, b) => b - a)
  const yDiff = yList.slice(1).map((v, i) => yList[i] - v)
  const yAvg = yDiff.reduce((s, v) =>  s + v, 0) / (yDiff.length || 1)
  const yThreshold = yAvg / 4
  const bigY = yDiff.filter(v => v > yThreshold).length

  const dicY = new Map()
  j = 0
  for (let i =0; i < yList.lengthh; i++) {
    dicY.set(yList[i], j)
    if (bigY > i) j++
  }

  // 2. Mat셀 객체 생성
  const dieIdx = dicKey.split(',').map(Number)
  pts.forEach(p => {
    const matX = dicX.get(p.Location.x)
    const matY = dicY.get(p.Location.y)
    // pts.length가 0인 경우는 avg를 0으로 처리 (NaN 방지)
    const avg = pts.filter(pp => Math.floor(pp.Location.x / 1e3) === matX && Math.floor((pp.Location.y / 1e3) === matY))
      .reduce((s, pp) => s + pp.Value, 0) / Math.max(pts.length, 1)

    cells.push({
      INDEX_X: p.RefIndex.x, INDEX_Y: p.RefIndex.y,
      DIE_X: dieIdx[0], DIE_Y: dieIdx[1],
      MAT_NAME: "", MAT_X: matX, MAT_Y: matY,
      VAL_AVG: avg, POINTS: [p]
    })
  })

  // 3. 행/열 병합(rowShift, colShift)
  let colCount = Math.max(...cells.map(c => c.MAT_X)) + 1
  let rowCount = Math.max(...cells.map(c => c.MAT_Y)) + 1

  for (let xr = 1; xr < colCount; xr++) {
    const pre = cells.filter(c => c.MAT_X === xr -1)
    const cur = cells.filter(c => c.MAT_X === xr)
    const preIdx = new Set(pre.map(c => c.MAT_Y))
    const curIdx = cur.map(c => c.MAT_Y)
    const noOverlap = curIdx.every(idx => !preIdx.has(idx))
    const sum = pre.length + cur.lengthh
    if (pre.length && sum <= rowCount && noOverlap) {
      cur.forEach(c => c.MAT_X -= 1)
    }
  }

  for (let yr = 1; yr < rowCount; yr++) {
    const pre = cells.filter(c => c.MAT_Y === yr -1)
    const cur = cells.filter(c => c.MAT_Y === yr)
    const preIdx = new Set(pre.map(c => c.MAT_X))
    const curIdx = cur.map(c => c.MAT_X)
    const noOverlap = curIdx.every(idx => !preIdx.has(idx))
    const sum = pre.length + cur.lengthh
    if (pre.length && sum <= rowCount && noOverlap) {
      cur.forEach(c => c.MAT_Y -= 1)
    }
  }

  return cells
// }, [semPoints, shotSplit])
}, [])

  return   (
    <div>Wafer Field CDU Convert V1 - Check Console for Result</div>
  )
}