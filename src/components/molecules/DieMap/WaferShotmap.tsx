// WaferShotmap.tsx - 웨이퍼 칩/포인트 시각화 컴포넌트
// 1. WaferPoint: 칩/포인트의 좌표 및 값 정보
// 2. WaferSpec: 웨이퍼 전체 스펙(크기, 칩 배열, 오프셋 등)
// 3. toAbsolute: 칩/포인트의 절대좌표(nm) 계산
// 4. WaferShotmap: 칩/포인트를 mm 단위로 변환 후, ECharts custom series로 원, 칩, 포인트, 라벨을 시각화
import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'

// ---------- 데이터 타입 ----------
export interface WaferPoint {
  chipIndexX: number
  chipIndexY: number
  chipX: number
  chipY: number
  value: number
  name?: string
  absX_nm?: number
  absY_nm?: number
}

export interface WaferSpec {
  waferSize: number // mm (예: 300)
  chipArraySizeX: number
  chipArraySizeY: number
  centerX: number // spec에서 정의된 center index (raw grid 기준)
  centerY: number
  chipSizeX: number // nm
  chipSizeY: number // nm
  offsetX: number // nm
  offsetY: number // nm
}

// ---------- 유틸: 단위 변환 ----------
const nmToMm = (nm: number) => nm / 1_000_000
const mmToNm = (mm: number) => mm * 1_000_000

// ---------- 절대좌표 변환 (chipIndex + chip 상대좌표 -> abs nm) ----------
/**
 * toAbsolute:
 *  - p.chipIndexX, p.chipIndexY, p.chipX, p.chipY, spec => p.absX_nm, p.absY_nm
 *  - formula: absX_nm = chipIndexX * chipSizeX + chipX + offsetX
 *  - absY_nm = chipIndexY * chipSizeY + chipY + offsetY
 */
export function toAbsolute(points: WaferPoint[], spec: WaferSpec): WaferPoint[] {
  return points.map((p) => ({
    ...p,
    absX_nm: p.chipIndexX * spec.chipSizeX + p.chipX + spec.offsetX,
    absY_nm: p.chipIndexY * spec.chipSizeY + p.chipY + spec.offsetY,
  }))
}

// ---------- 컴포넌트 Props ----------
export interface WaferShotmapProps {
  points: WaferPoint[] // raw points (chipIndex*, chipX/Y are required)
  waferSpec: WaferSpec
  mode?: 'mask' | 'crop' // mask: 원 밖 칩은 검정, crop: 원 밖 칩 숨김
  width?: number | string // e.g., 700 or "100%"
  height?: number | string // e.g., 700 or "100%"
}

// ---------- 컴포넌트 ----------
/**
 * WaferShotmap
 * - points: 칩/포인트 raw 데이터
 * - waferSpec: 웨이퍼 전체 스펙
 * - mode: 'mask' = 원 밖 칩은 검정, 'crop' = 원 밖 칩 숨김
 * - width/height: 차트 크기
 *
 * 동작 원리:
 * 1. 칩/포인트의 절대좌표(nm) 계산 후, mm 단위로 변환(중심 기준)
 * 2. 칩별 그룹핑 및 평균값 계산
 * 3. custom series로 원 outline, 칩 rect, 포인트, 라벨을 각각 그림
 * 4. 원 밖 칩은 mode에 따라 마스킹/숨김 처리
 * 5. 값에 따라 색상(ratioToRGBA)으로 시각화
 */
const WaferShotmap = ({ points, waferSpec, mode = 'mask', width = 700, height = 700 }: WaferShotmapProps) => {
  // 1) 칩/포인트의 절대좌표(nm) 계산
  const absPoints = useMemo(() => toAbsolute(points, waferSpec), [points, waferSpec])

  // 2) 웨이퍼 반지름(mm) 계산
  const waferRadiusMm = waferSpec.waferSize / 2 // mm

  // 3) 웨이퍼 중심 기준 절대좌표(nm) 계산
  const waferCenterAbsX_nm = waferSpec.centerX * waferSpec.chipSizeX + waferSpec.offsetX
  const waferCenterAbsY_nm = waferSpec.centerY * waferSpec.chipSizeY + waferSpec.offsetY

  // 4) mm 단위 좌표로 변환(중심 기준)
  const mmPoints: Array<WaferPoint & { x_mm: number; y_mm: number }> = useMemo(() => {
    return absPoints.map((p) => {
      const x_mm = nmToMm((p.absX_nm ?? 0) - waferCenterAbsX_nm)
      const y_mm = nmToMm((p.absY_nm ?? 0) - waferCenterAbsY_nm)
      return { ...p, x_mm, y_mm }
    })
  }, [absPoints, waferCenterAbsX_nm, waferCenterAbsY_nm])

  // 5) 데이터가 없으면 안내 메시지 표시
  if (mmPoints.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
        데이터 없음
      </div>
    )
  }

  // 6) 칩별 그룹핑 및 평균값 계산
  type ChipGroup = {
    chipIndexX: number
    chipIndexY: number
    avgValue: number
    points: (WaferPoint & { x_mm: number; y_mm: number })[]
  }
  const chipMap = new Map<string, ChipGroup>()

  // 칩 인덱스별로 그룹핑, 평균값 계산
  for (const p of mmPoints) {
    const key = `${p.chipIndexX},${p.chipIndexY}`
    const existing = chipMap.get(key)
    if (!existing) {
      chipMap.set(key, {
        chipIndexX: p.chipIndexX,
        chipIndexY: p.chipIndexY,
        avgValue: p.value,
        points: [p],
      })
    } else {
      existing.points.push(p)
      existing.avgValue = existing.avgValue + (p.value - existing.avgValue) / existing.points.length
    }
  }

  // 칩 그룹 배열로 변환
  const chips = Array.from(chipMap.values())

  // 7) 전체 값 범위(min/max) 계산, 색상 매핑에 사용
  const values = mmPoints.map((p) => p.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  // 값 범위가 0일 때 안전하게 처리
  const valueRangeSpan = Math.max(maxValue - minValue, 1e-9)

  // 8) 값 비율(ratio)에 따라 색상(rgba) 반환 (녹색~적색 ramp)
  const ratioToRGBA = (ratio: number) => `rgba(${Math.round(255 * (1 - ratio))}, ${Math.round(255 * ratio)}, 80, 0.85)`

  // 9) ECharts series 배열 생성
  const series: echarts.SeriesOption[] = []

  // 10) 웨이퍼 원 outline custom series
  series.push({
    type: 'custom',
    name: 'wafer-outline',
    coordinateSystem: 'cartesian2d',
    renderItem: (params: echarts.CustomSeriesRenderItemParams, api: any): unknown => {
      // center in data-space = [0,0]
      const [cxPx, cyPx] = api.coord([0, 0])
      // pixel length for waferRadiusMm along x axis
      const sizePixel = api.size([waferRadiusMm, 0])
      const rPx = Math.abs(sizePixel[0])
      return {
        type: 'circle',
        shape: { cx: cxPx, cy: cyPx, r: rPx },
        style: {
          stroke: '#000',
          fill: 'none',
          lineWidth: 2,
        },
      }
    },
    data: [[0, 0]],
  })

  // 11) 칩 영역 custom series (칩별 평균값 색상, 원 밖은 mode에 따라 마스킹/숨김)
  series.push({
    type: 'custom',
    name: 'chip-rects',
    coordinateSystem: 'cartesian2d',
    data: chips,
    renderItem: (params, api) => {
      const chip = params.data as ChipGroup
      const rectOriginAbsX_nm = chip.chipIndexX * waferSpec.chipSizeX + waferSpec.offsetX
      const rectOriginAbsY_nm = chip.chipIndexY * waferSpec.chipSizeY + waferSpec.offsetY
      const rectX_mm = nmToMm(rectOriginAbsX_nm - waferCenterAbsX_nm)
      const rectY_mm = nmToMm(rectOriginAbsY_nm - waferCenterAbsY_nm)
      const w_mm = nmToMm(waferSpec.chipSizeX)
      const h_mm = nmToMm(waferSpec.chipSizeY)
      const topLeftPx = api.coord([rectX_mm, rectY_mm])
      const bottomRightPx = api.coord([rectX_mm + w_mm, rectY_mm + h_mm])
      const xPx = Math.min(topLeftPx[0], bottomRightPx[0])
      const yPx = Math.min(topLeftPx[1], bottomRightPx[1])
      const widthPx = Math.abs(bottomRightPx[0] - topLeftPx[0])
      const heightPx = Math.abs(bottomRightPx[1] - topLeftPx[1])
      const chipCenterX_mm = rectX_mm + w_mm / 2
      const chipCenterY_mm = rectY_mm + h_mm / 2
      const distCenter = Math.sqrt(chipCenterX_mm * chipCenterX_mm + chipCenterY_mm * chipCenterY_mm)
      if (distCenter > waferRadiusMm) {
        if (mode === 'crop') return null
        if (mode === 'mask')
          return { type: 'rect', shape: { x: xPx, y: yPx, width: widthPx, height: heightPx }, style: { fill: '#000' } }
      }
      const ratio = (chip.avgValue - minValue) / valueRangeSpan
      const color = ratioToRGBA(ratio)
      return {
        type: 'rect',
        shape: { x: xPx, y: yPx, width: widthPx, height: heightPx },
        style: { fill: color, stroke: '#666', lineWidth: 0.5 },
      }
    },
  })

  // 12) 포인트 데이터 (좌표, 값, 이름)
  const scatterData: Array<[number, number, number, string | undefined]> = mmPoints.map((p) => [
    p.x_mm,
    p.y_mm,
    p.value,
    p.name,
  ])

  // 13) 포인트(검정 점) scatter series
  series.push({
    type: 'scatter',
    name: 'points',
    coordinateSystem: 'cartesian2d',
    symbol: 'circle',
    symbolSize: 4,
    itemStyle: { color: '#000' },
    data: scatterData.map((d) => ({ value: [d[0], d[1], d[2]], name: d[3] })),
    encode: { x: 0, y: 1, tooltip: 2 },
    tooltip: {
      formatter: (params: unknown) => {
        // params type may be object; do runtime-safe access
        try {
          const p = params as { value?: (number | string)[]; name?: string }
          const val = Array.isArray(p.value) ? p.value[2] : undefined
          return `name: ${p.name ?? ''}<br/>value: ${typeof val === 'number' ? val.toFixed(4) : val}`
        } catch {
          return ''
        }
      },
    },
  })

  // 14) 값 라벨 scatter series (포인트 옆에 값 표시)
  series.push({
    type: 'scatter',
    name: 'labels',
    coordinateSystem: 'cartesian2d',
    symbol: 'none',
    label: {
      show: true,
      position: 'right',
      formatter: (params: unknown) => {
        try {
          const p = params as { value?: (number | string)[] }
          const val = Array.isArray(p.value) ? p.value[2] : undefined
          return typeof val === 'number' ? val.toFixed(2) : ''
        } catch {
          return ''
        }
      },
      fontSize: 10,
      color: '#000',
    },
    data: scatterData.map((d) => ({ value: [d[0], d[1], d[2]] })),
    encode: { x: 0, y: 1 },
    silent: true,
  })

  // 15) ECharts option 객체 생성 (mm 좌표축, series 포함)
  const axisLimit = waferRadiusMm * 1.05
  const option = {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: {
      type: 'value',
      min: -axisLimit,
      max: axisLimit,
      show: false,
      scale: true,
    },
    yAxis: {
      type: 'value',
      min: -axisLimit,
      max: axisLimit,
      show: false,
      scale: true,
    },
    series,
  }

  // 16) ECharts 렌더링
  return <ReactECharts option={option} style={{ width, height }} />
}

export default WaferShotmap
