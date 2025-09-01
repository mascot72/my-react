import React, { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { usePalette } from '../../../app/usePalette'
import Modal from './Modal'
import PaletteManager from '../ColorTheme/PaletteManager'

/**
 * WaferHeatMap 컴포넌트
 * - ChartDirector C++ 예제(heatmap.cpp)와 동일하게 20x20 격자에서 원(wafer) 영역만 데이터가 있는 히트맵을 생성합니다.
 * - 원 밖의 셀은 null로 처리하여 표시하지 않습니다.
 * - 컬러바, x/y축, 툴팁 등 주요 기능을 포함합니다.
 *
 * 동작 원리:
 * 1. 20x20 격자에 대해, 중심 기준 반지름 내 셀만 난수값(0~100) 할당, 원 밖은 null 처리
 * 2. ECharts heatmap 시리즈에 [x, y, value] 형태로 데이터 전달
 * 3. null 값은 투명하게 처리하여 원형 영역만 색상 표시
 * 4. 컬러바(visualMap)로 값의 범위와 색상 단계 지정(15단계)
 * 5. x/y축, 툴팁, 강조 효과 등 시각적 요소 설정
 */

const diameter = 20
const radius = diameter / 2
const xLabels = Array.from({ length: diameter }, (_, i) => i.toString())
const yLabels = Array.from({ length: diameter }, (_, i) => i.toString())
type WaferCell = [number, number, number | null]
function generateWaferData(): WaferCell[] {
  const data: WaferCell[] = []
  for (let y = 0; y < diameter; y++) {
    for (let x = 0; x < diameter; x++) {
      const dx = x + 0.5 - radius
      const dy = y + 0.5 - radius
      if (dx * dx + dy * dy <= radius * radius) {
        data.push([x, y, Math.floor(Math.random() * 101)])
      } else {
        data.push([x, y, null])
      }
    }
  }
  return data
}

function getPaletteColors(palette: unknown): string[] {
  if (!palette) {
    // 기본 팔레트
    return [
      '#f7fbff',
      '#deebf7',
      '#c6dbef',
      '#9ecae1',
      '#6baed6',
      '#4292c6',
      '#2171b5',
      '#08519c',
      '#08306b',
      '#f1eef6',
      '#d0d1e6',
      '#a6bddb',
      '#74a9cf',
      '#2b8cbe',
      '#045a8d',
    ]
  }
  if (palette.type === 'Gradation') {
    // 15단계 그라데이션 생성
    const [from, to] = palette.colors
    // 간단한 그라데이션 생성 (echarts가 알아서 보간)
    return [from, to]
  }
  // Step 팔레트: 색상 배열 그대로
  return palette.colors
}

/**
 * React 컴포넌트: WaferHeatMap
 * - ChartDirector 예제와 동일한 기능을 ECharts로 구현
 * - 원형 영역만 데이터가 있는 히트맵
 *
 * 주요 렌더링:
 * - 520x480 크기 div에 ECharts heatmap 렌더링
 * - option 객체에 모든 시각화 옵션 포함
 */
const WaferHeatMap = () => {
  // 중심 정렬 및 cell 크기 일치
  const diameterPx = 480 // 전체 차트 크기
  const gridLeft = 40
  const gridTop = 40
  const gridSize = diameterPx
  const waferRadiusPx = gridSize / 2
  // 셀별 die-map 경계선 계산 함수
  // die-map 경계선 굵게, grid 얇게, 원 외부 완전 마스킹
  function getCellBorder(x: number, y: number, rowSize: number, colSize: number) {
    let borderTop = 0.5,
      borderBottom = 0.5,
      borderLeft = 0.5,
      borderRight = 0.5
    let borderColor = '#fff'
    if (y % rowSize === 0) borderTop = 4
    if ((y + 1) % rowSize === 0 || y === diameter - 1) borderBottom = 4
    if (x % colSize === 0) borderLeft = 4
    if ((x + 1) % colSize === 0 || x === diameter - 1) borderRight = 4
    borderColor = borderTop === 4 || borderBottom === 4 || borderLeft === 4 || borderRight === 4 ? '#000' : '#fff'
    const dx = x + 0.5 - radius
    const dy = y + 0.5 - radius
    if (dx * dx + dy * dy > radius * radius) {
      borderTop = borderBottom = borderLeft = borderRight = 0
      borderColor = '#888'
    }
    return {
      borderWidth: `${borderTop}px ${borderRight}px ${borderBottom}px ${borderLeft}px`,
      borderColor: borderColor,
    }
  }
  const { appliedPalette } = usePalette()
  const [modalOpen, setModalOpen] = useState(false)
  // 추가: 격자선 표시 여부, die-map 크기
  const [showGridLine, setShowGridLine] = useState(true)
  const [dieMapRowSize, setDieMapRowSize] = useState(4) // 4x4 기본
  const [dieMapColSize, setDieMapColSize] = useState(4)

  // 실제 히트맵 데이터
  const data = generateWaferData()

  // 팔레트 적용
  const paletteColors = getPaletteColors(appliedPalette)

  // ECharts 옵션 객체: 시각화 설정
  const option = {
    backgroundColor: '#222',
    // 차트 타이틀
    title: {
      text: 'Wafer Map Demonstration',
      left: 'center',
      top: 10,
      textStyle: { fontWeight: 'bold', fontSize: 15 },
    },
    // 마우스 오버 시 툴팁
    tooltip: {
      position: 'top',
      // 값이 null(원 밖)이면 툴팁 미표시
      formatter: (params: any) => {
        if (params.data[2] == null) return ''
        return `X: ${params.data[0]}, Y: ${params.data[1]}<br/>Value: ${params.data[2]}`
      },
    },
    // 플롯 영역 위치/크기
    grid: {
      left: gridLeft,
      right: 40,
      top: gridTop,
      bottom: 40,
      width: gridSize,
      height: gridSize,
      backgroundColor: '#222',
      containLabel: false,
    },
    graphic: [
      {
        type: 'circle',
        left: gridLeft,
        top: gridTop,
        shape: {
          cx: waferRadiusPx,
          cy: waferRadiusPx,
          r: waferRadiusPx,
        },
        style: {
          stroke: '#888',
          lineWidth: 8,
          fill: 'rgba(0,0,0,0)',
        },
        z: 10,
      },
    ],
    // x축: 0~19, 카테고리, 스타일 지정
    xAxis: {
      type: 'category',
      data: xLabels,
      name: '',
      nameTextStyle: { fontWeight: 'bold', fontSize: 12 },
      axisLabel: { fontWeight: 'bold', fontSize: 10 },
      splitArea: { show: false },
      axisTick: { alignWithLabel: true },
      offset: 0,
      splitLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: yLabels,
      name: '',
      nameTextStyle: { fontWeight: 'bold', fontSize: 12 },
      axisLabel: { fontWeight: 'bold', fontSize: 10 },
      splitArea: { show: false },
      axisTick: { alignWithLabel: true },
      offset: 0,
      splitLine: { show: false },
    },
    // 컬러바(visualMap): 값-색상 매핑, 15단계 색상, 위치/폰트 등
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'vertical',
      right: 10,
      top: 'center',
      text: ['High', 'Low'],
      inRange: {
        // 15단계 색상 그라데이션 (파랑~보라~빨강 계열 예시)
        color: paletteColors,
      },
      textStyle: { fontWeight: 'bold', fontSize: 10 },
      // null 값은 색상 미지정(투명)
      show: true,
    },
    // 히트맵 시리즈: 데이터, 강조 효과, null 투명 처리 등
    series: [
      {
        name: 'Wafer Heat Map',
        type: 'heatmap',
        data: data,
        label: { show: false },
        itemStyle: {
          color: (params: { data: [number, number, number | null] }) => {
            const [x, y] = params.data
            const dx = x + 0.5 - radius
            const dy = y + 0.5 - radius
            if (dx * dx + dy * dy > radius * radius) return '#888'
            return undefined
          },
          borderType: 'solid',
          borderColor: (params: { data: [number, number, number | null] }) => {
            const [x, y] = params.data
            const { borderColor } = getCellBorder(x, y, dieMapRowSize, dieMapColSize)
            return borderColor
          },
          borderWidth: (params: { data: [number, number, number | null] }) => {
            const [x, y] = params.data
            const dx = x + 0.5 - radius
            const dy = y + 0.5 - radius
            if (dx * dx + dy * dy > radius * radius) return 0
            const { borderWidth } = getCellBorder(x, y, dieMapRowSize, dieMapColSize)
            return parseFloat(borderWidth.split(' ')[0])
          },
        },
        emphasis: {
          itemStyle: {
            borderColor: '#222',
            borderWidth: 2,
            borderType: 'solid',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }

  return (
    <div style={{ width: 520, height: 520 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <label style={{ marginRight: 16 }}>
            <input type='checkbox' checked={showGridLine} onChange={(e) => setShowGridLine(e.target.checked)} />
            격자선 표시
          </label>
          <label style={{ marginRight: 16 }}>
            die-map 행 크기:
            <input
              type='number'
              min={1}
              max={diameter}
              value={dieMapRowSize}
              onChange={(e) => setDieMapRowSize(Number(e.target.value))}
              style={{ width: 40, marginLeft: 4 }}
            />
          </label>
          <label>
            die-map 열 크기:
            <input
              type='number'
              min={1}
              max={diameter}
              value={dieMapColSize}
              onChange={(e) => setDieMapColSize(Number(e.target.value))}
              style={{ width: 40, marginLeft: 4 }}
            />
          </label>
        </div>
        <button
          style={{
            background: '#bf4f74',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
          onClick={() => setModalOpen(true)}>
          팔레트 선택/관리
        </button>
      </div>
      {/* ECharts 히트맵 렌더링 */}
      <ReactECharts option={option} style={{ width: '100%', height: 480 }} />
      <Modal open={modalOpen} title='컬러 팔레트 관리'>
        <PaletteManager onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}

export default WaferHeatMap
