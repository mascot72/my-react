import React, { useState } from 'react'
import styled from 'styled-components'

const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
`

const GridContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`

const WaferContainer = styled.div`
  position: relative;
  width: 90%;
  height: 90%;
  margin: auto;
  z-index: 2;
`

const AxisLabels = styled.div`
  position: absolute;
  font-size: 0.8rem;
  color: #333;
`

const TopLabels = styled(AxisLabels)`
  top: 0;
  left: 10%;
  width: 80%;
  display: flex;
  justify-content: space-between;
`

const LeftLabels = styled(AxisLabels)`
  left: 0;
  top: 10%;
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const GraphContainer = styled.div`
  width: 100%;
  height: 20%;
  margin-top: auto;
`

// 체크박스 그룹 컨테이너 스타일 수정
const ControlContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  z-index: 3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

// 체크박스 라벨 스타일 개선
const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  user-select: none;

  input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  &:hover {
    color: #0078d7;
  }
`

// 데이터 타입 정의
interface Point {
  x: number
  y: number
  value: number
}

// 라벨 텍스트를 위한 인터페이스
interface ControlOption {
  id: string
  label: string
  description: string
}

// controlOptions에 die map 옵션 추가
const controlOptions: ControlOption[] = [
  {
    id: 'points',
    label: '측정 포인트',
    description: '웨이퍼 상의 측정 위치를 표시',
  },
  {
    id: 'values',
    label: '측정값',
    description: '각 포인트의 측정된 수치를 표시',
  },
  {
    id: 'dieMap',
    label: 'Die Map',
    description: '웨이퍼의 die 영역을 격자로 표시',
  },
]

// 칼라 스케일 유틸리티 함수 개선
const getColor = (value: number, min: number, max: number): string => {
  const ratio = (value - min) / (max - min)
  // HSL 색상 사용으로 부드러운 그라디언트 구현
  const hue = ((1 - ratio) * 240).toString(10) // 240(파랑) -> 0(빨강)
  return `hsl(${hue}, 100%, 50%)`
}

// 보간 함수 추가
const interpolateValue = (x: number, y: number, points: Point[]): number => {
  let totalWeight = 0
  let weightedSum = 0

  points.forEach((point) => {
    const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2))
    // IDW (Inverse Distance Weighting) 방식 사용
    const weight = distance === 0 ? 1 : 1 / Math.pow(distance, 2)
    totalWeight += weight
    weightedSum += point.value * weight
  })

  return weightedSum / totalWeight
}

// 랜덤 포인트 생성 함수 추가
const generateRandomPoints = (count: number): Point[] => {
  const points: Point[] = []
  // const centerPoint = { x: 50, y: 50, value: 4.18 } // 중심점은 고정
  // points.push(centerPoint)

  for (let i = 0; i < count - 1; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * 35 + 10 // 10 ~ 45 범위
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)

    // 값은 중심점으로부터의 거리에 따라 계산
    const distanceFromCenter = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2))
    const value = 4.18 + (Math.random() - 0.5) * (distanceFromCenter / 10)

    points.push({ x, y, value: Math.max(2.0, Math.min(5.8, value)) })
  }
  return points
}

// 개선된 보간 함수
const improvedInterpolateValue = (x: number, y: number, points: Point[]): number => {
  let totalWeight = 0
  let weightedSum = 0
  const distanceInfluence = 2.5 // 거리 영향력 조정

  points.forEach((point) => {
    const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2))

    // 가우시안 가중치 함수 사용
    const weight = Math.exp(-Math.pow(distance / distanceInfluence, 2))

    // 값의 크기에 따른 가중치 조정
    const valueWeight = Math.pow(point.value / 4.0, 2)

    const finalWeight = weight * valueWeight
    totalWeight += finalWeight
    weightedSum += point.value * finalWeight
  })

  return weightedSum / totalWeight
}

// SVG 필터 정의를 위한 컴포넌트
const GradientFilter = () => (
  <defs>
    <filter id='blur' x='-50%' y='-50%' width='200%' height='200%'>
      <feGaussianBlur in='SourceGraphic' stdDeviation='2' />
    </filter>
  </defs>
)

// 포인트 값 레이블 컴포넌트
const DataPointLabel = styled.text`
  font-size: 2.5px;
  fill: #000;
  text-anchor: middle;
  pointer-events: none;
`

// BowChart 컴포넌트 수정
const BowChart: React.FC = () => {
  // 상태 추가
  const [showPoints, setShowPoints] = useState(true)
  const [showValues, setShowValues] = useState(true)
  const [showDieMap, setShowDieMap] = useState(true)

  // 랜덤 포인트 생성
  const heatmapData: Point[] = React.useMemo(() => generateRandomPoints(15), [])

  // 격자 크기 증가
  const gridSize = 75 // 더 섬세한 히트맵을 위해 해상도 증가

  // 격자 생성 함수 수정
  const generateHeatmapGrid = () => {
    const grid: Point[] = []
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = (i / gridSize) * 100
        const y = (j / gridSize) * 100

        const distanceFromCenter = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2))
        if (distanceFromCenter <= 45) {
          const value = improvedInterpolateValue(x, y, heatmapData)
          grid.push({ x, y, value })
        }
      }
    }
    return grid
  }

  const gridPoints = generateHeatmapGrid()
  const minValue = Math.min(...heatmapData.map((p) => p.value))
  const maxValue = Math.max(...heatmapData.map((p) => p.value))

  // 색상 계산 함수 개선
  const getEnhancedColor = (value: number, min: number, max: number): string => {
    const ratio = (value - min) / (max - min)
    const hue = ((1 - ratio) * 240).toString(10)
    const saturation = 85 + Math.sin(ratio * Math.PI) * 15 // 채도 변화 추가
    const lightness = 50 + Math.cos(ratio * Math.PI) * 10 // 명도 변화 추가
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  // die 크기 설정
  const dieSize = 5

  // die map 렌더링 함수
  const renderDieMap = () => {
    const dies: JSX.Element[] = []
    const dieCount = Math.floor(90 / dieSize) // 웨이퍼 지름(90)을 die 크기로 나눔

    for (let i = 0; i < dieCount; i++) {
      for (let j = 0; j < dieCount; j++) {
        const x = i * dieSize
        const y = j * dieSize
        const centerX = x + dieSize / 2
        const centerY = y + dieSize / 2

        // 원 안에 있는 die만 표시
        const distanceFromCenter = Math.sqrt(Math.pow(centerX - 45, 2) + Math.pow(centerY - 45, 2))

        if (distanceFromCenter <= 45) {
          // die 영역 내의 점들의 평균 값 계산
          const pointsInDie = gridPoints.filter(
            (point) => point.x >= x && point.x < x + dieSize && point.y >= y && point.y < y + dieSize,
          )

          const avgValue =
            pointsInDie.length > 0 ? pointsInDie.reduce((sum, p) => sum + p.value, 0) / pointsInDie.length : 0

          dies.push(
            <rect
              key={`die-${i}-${j}`}
              x={x}
              y={y}
              width={dieSize}
              height={dieSize}
              fill={getEnhancedColor(avgValue, minValue, maxValue)}
              stroke='#666'
              strokeWidth='0.2'
              opacity='0.7'
            />,
          )
        }
      }
    }
    return dies
  }

  return (
    <ChartContainer>
      <ControlContainer>
        {controlOptions.map((option) => (
          <CheckboxLabel key={option.id} title={option.description}>
            <input
              type='checkbox'
              checked={option.id === 'points' ? showPoints : option.id === 'values' ? showValues : showDieMap}
              onChange={(e) => {
                if (option.id === 'points') setShowPoints(e.target.checked)
                else if (option.id === 'values') setShowValues(e.target.checked)
                else setShowDieMap(e.target.checked)
              }}
            />
            {option.label}
          </CheckboxLabel>
        ))}
      </ControlContainer>

      <TopLabels>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={`top-${i}`}>{i * 10}</span>
        ))}
      </TopLabels>

      <LeftLabels>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={`left-${i}`}>{90 - i * 10}</span>
        ))}
      </LeftLabels>

      <GridContainer>
        <svg width='100%' height='100%'>
          {Array.from({ length: 10 }).map((_, i) => (
            <React.Fragment key={`grid-${i}`}>
              <line x1={`${i * 10}%`} y1='0' x2={`${i * 10}%`} y2='100%' stroke='#ccc' strokeWidth='0.5' />
              <line x1='0' y1={`${i * 10}%`} x2='100%' y2={`${i * 10}%`} stroke='#ccc' strokeWidth='0.5' />
            </React.Fragment>
          ))}
        </svg>
      </GridContainer>

      <WaferContainer>
        <svg width='100%' height='100%' viewBox='0 0 100 100'>
          <GradientFilter />
          <defs>
            <clipPath id='waferClip'>
              <circle cx='50' cy='50' r='45' />
            </clipPath>
          </defs>

          <g clipPath='url(#waferClip)'>
            {/* 부드러운 히트맵 그리드 렌더링 */}
            <g filter='url(#blur)'>
              {gridPoints.map((point, index) => (
                <circle
                  key={`heatmap-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r='1.5'
                  fill={getEnhancedColor(point.value, minValue, maxValue)}
                  opacity='0.7'
                />
              ))}
            </g>

            {/* Die Map 레이어 */}
            {showDieMap && <g>{renderDieMap()}</g>}

            {/* 데이터 포인트와 값 표시 - 조건부 렌더링 */}
            {heatmapData.map((point, index) => (
              <g key={`data-point-group-${index}`}>
                {showPoints && <circle cx={point.x} cy={point.y} r='0.8' fill='black' opacity='0.8' />}
                {showValues && (
                  <DataPointLabel x={point.x} y={point.y - (showPoints ? 1.5 : 0)} fontSize='2px'>
                    {point.value.toFixed(2)}
                  </DataPointLabel>
                )}
              </g>
            ))}
          </g>

          {/* 웨이퍼 테두리 */}
          <circle cx='50' cy='50' r='45' fill='none' stroke='black' strokeWidth='0.5' />

          {/* 중앙 값 표시 - 크게 */}
          <text x='50' y='50' textAnchor='middle' dominantBaseline='middle' fill='black' fontSize='6' fontWeight='bold'>
            {heatmapData.find((p) => p.x === 50 && p.y === 50)?.value.toFixed(2)}
          </text>
        </svg>
      </WaferContainer>

      {/* 하단 그래프 개선 */}
      <GraphContainer>
        <svg width='100%' height='100%'>
          <defs>
            <linearGradient id='lineGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
              {heatmapData.map((point, index) => (
                <stop
                  key={`gradient-stop-${index}`}
                  offset={`${(point.x / 100) * 100}%`}
                  stopColor={getColor(point.value, minValue, maxValue)}
                />
              ))}
            </linearGradient>
          </defs>
          <path
            d={`M 0 50 
              C ${heatmapData.map((point, i) => `${point.x} ${50 - point.value * 5}`).join(' ')} 
              100 50`}
            fill='none'
            stroke='url(#lineGradient)'
            strokeWidth='1.5'
          />
        </svg>
      </GraphContainer>
    </ChartContainer>
  )
}

export default BowChart
