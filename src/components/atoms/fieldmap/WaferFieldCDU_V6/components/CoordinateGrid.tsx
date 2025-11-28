import React from 'react'

interface CoordinateGridProps {
  fieldArraySize: [number, number] // [x개수, y개수]
  fieldStepX: number // X 방향 필드 간격 (mm)
  fieldStepY: number // Y 방향 필드 간격 (mm)
  mm2px: (mm: number) => number // mm -> px 변환 함수
  svgWidthPx: number // SVG 너비
}

/**
 * 좌표 눈금 표시 컴포넌트
 * - 중앙 필드를 기준으로 X축(오른쪽 +1, 왼쪽 -1), Y축(위로 +1, 아래로 -1)
 * - 좌측과 하단에 눈금 텍스트 표시
 */
export const CoordinateGrid: React.FC<CoordinateGridProps> = ({
  fieldArraySize,
  fieldStepX,
  fieldStepY,
  mm2px,
  svgWidthPx,
}) => {
  // 필드 그리드 범위 계산 (중앙 기준 분배)
  const [xCount, yCount] = fieldArraySize
  const fieldGridMinFx = -Math.floor(xCount / 2)
  const fieldGridMaxFx = Math.ceil(xCount / 2) - 1
  const fieldGridMinFy = -Math.floor(yCount / 2)
  const fieldGridMaxFy = Math.ceil(yCount / 2) - 1

  const tickFontSize = 9

  // Y축 눈금 생성 (좌측) - Y 좌표 표시
  const yTicks: Array<{ label: string; position: number }> = []
  for (let fy = fieldGridMaxFy; fy >= fieldGridMinFy; fy--) {
    const yMm = fy * fieldStepY
    const yPx = mm2px(yMm)
    yTicks.push({
      label: fy.toString(),
      position: yPx,
    })
  }

  // X축 눈금 생성 (하단) - X 좌표 표시
  const xTicks: Array<{ label: string; position: number }> = []
  for (let fx = fieldGridMinFx; fx <= fieldGridMaxFx; fx++) {
    const xMm = fx * fieldStepX
    const xPx = mm2px(xMm)
    xTicks.push({
      label: fx.toString(),
      position: xPx,
    })
  }

  return (
    <g>
      {/* Y축 눈금 (좌측) - Y 좌표 표시 */}
      {yTicks.map((tick, idx) => (
        <g key={`y-tick-${idx}`}>
          {/* 눈금 선 */}
          <line
            x1={-10}
            y1={tick.position}
            x2={0}
            y2={tick.position}
            stroke='#999'
            strokeWidth={0.5}
          />
          {/* 눈금 텍스트 */}
          <text
            x={-15}
            y={tick.position + tickFontSize / 2}
            fontSize={tickFontSize}
            fill='#666'
            textAnchor='end'
            dominantBaseline='middle'
            fontFamily='Arial, sans-serif'>
            {tick.label}
          </text>
        </g>
      ))}

      {/* X축 눈금 (하단) - X 좌표 표시 */}
      {xTicks.map((tick, idx) => (
        <g key={`x-tick-${idx}`}>
          {/* 눈금 선 */}
          <line
            x1={tick.position}
            y1={0}
            x2={tick.position}
            y2={10}
            stroke='#999'
            strokeWidth={0.5}
          />
          {/* 눈금 텍스트 */}
          <text
            x={tick.position}
            y={20}
            fontSize={tickFontSize}
            fill='#666'
            textAnchor='middle'
            dominantBaseline='hanging'
            fontFamily='Arial, sans-serif'>
            {tick.label}
          </text>
        </g>
      ))}

      {/* 중앙 축 표시 (선택사항) */}
      {/* 중앙 X축 */}
      <line
        x1={-svgWidthPx / 2}
        y1={0}
        x2={svgWidthPx / 2}
        y2={0}
        stroke='#ddd'
        strokeWidth={0.5}
        strokeDasharray='2,2'
        opacity={0.5}
      />
      {/* 중앙 Y축 */}
      <line
        x1={0}
        y1={-svgWidthPx / 2}
        x2={0}
        y2={svgWidthPx / 2}
        stroke='#ddd'
        strokeWidth={0.5}
        strokeDasharray='2,2'
        opacity={0.5}
      />
    </g>
  )
}
