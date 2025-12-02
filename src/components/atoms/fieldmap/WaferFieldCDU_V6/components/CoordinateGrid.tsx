import React from 'react'

interface CoordinateGridProps {
  fieldArraySize: [number, number] // [x개수, y개수]
  fieldStepX: number // X 방향 필드 간격 (mm)
  fieldStepY: number // Y 방향 필드 간격 (mm)
  mm2px: (mm: number) => number // mm -> px 변환 함수
  svgWidthPx: number // SVG 너비
  showShotRuler?: boolean
  shotRulerStepX?: number
  shotRulerStepY?: number
  waferRadius?: number
  centerAxisCoordinates?: boolean
  offsetMm?: [number, number]
  waferTickStepMm?: number
  gridLineColor?: string
  gridLineWidth?: number
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
  showShotRuler = true,
  shotRulerStepX = 1,
  shotRulerStepY = 1,
  waferRadius = 150,
  centerAxisCoordinates = true,
  offsetMm = [0, 0],
  waferTickStepMm = 50,
  gridLineColor = '#e5e7eb',
  gridLineWidth = 1,
}) => {
  // 필드 그리드 범위 계산 (중앙 기준 분배)
  const [xCount, yCount] = fieldArraySize
  const fieldGridMinFx = -Math.floor(xCount / 2)
  const fieldGridMaxFx = Math.ceil(xCount / 2) - 1
  const fieldGridMinFy = -Math.floor(yCount / 2)
  const fieldGridMaxFy = Math.ceil(yCount / 2) - 1

  const tickFontSize = 12

  // Y축 눈금 생성 (좌측) - Y 좌표 표시
  const yTicks: Array<{ label: string; position: number }> = []
  for (let fy = fieldGridMaxFy; fy >= fieldGridMinFy; fy--) {
    if (Math.abs(fy % shotRulerStepY) !== 0) continue
    const yMm = fy * fieldStepY
    const yPx = mm2px(yMm)
    yTicks.push({
      label: (-fy).toString(),
      position: yPx,
    })
  }

  // X축 눈금 생성 (하단) - X 좌표 표시
  const xTicks: Array<{ label: string; position: number }> = []
  for (let fx = fieldGridMinFx; fx <= fieldGridMaxFx; fx++) {
    if (Math.abs(fx % shotRulerStepX) !== 0) continue
    const xMm = fx * fieldStepX
    const xPx = mm2px(xMm)
    xTicks.push({
      label: fx.toString(),
      position: xPx,
    })
  }

  const leftPos = -svgWidthPx * 0.45
  const bottomPos = svgWidthPx * 0.44
  const xMin = -svgWidthPx / 2
  const xMax = svgWidthPx / 2
  const yMin = -svgWidthPx / 2
  const yMax = svgWidthPx / 2

  if (!showShotRuler) {
    // Wafer size 기반 mm 눈금 렌더링 (좌측 Y / 하단 X)
    const yMmTicks: number[] = []
    for (let v = waferRadius; v >= -waferRadius; v -= waferTickStepMm) yMmTicks.push(v)
    if (yMmTicks[yMmTicks.length - 1] !== -waferRadius) yMmTicks.push(-waferRadius)
    const xMmTicks: number[] = []
    for (let v = -waferRadius; v <= waferRadius; v += waferTickStepMm) xMmTicks.push(v)
    if (xMmTicks[xMmTicks.length - 1] !== waferRadius) xMmTicks.push(waferRadius)


    return (
      <g pointerEvents='none'>
      {/* Ruler baselines (axis lines) */}
      <line x1={leftPos} y1={yMin} x2={leftPos} y2={yMax} stroke="#999" strokeWidth={1} />
      <line x1={xMin} y1={bottomPos} x2={xMax} y2={bottomPos} stroke="#999" strokeWidth={1} />
        {/* mm 그리드 라인 */}
        {yMmTicks.map((mm, idx) => (
          <line key={`y-mm-grid-${idx}`} x1={xMin} y1={mm2px(mm)} x2={xMax} y2={mm2px(mm)} stroke={gridLineColor} strokeWidth={gridLineWidth} opacity={0.6} />
        ))}
        {xMmTicks.map((mm, idx) => (
          <line key={`x-mm-grid-${idx}`} x1={mm2px(mm)} y1={yMin} x2={mm2px(mm)} y2={yMax} stroke={gridLineColor} strokeWidth={gridLineWidth} opacity={0.6} />
        ))}
        {/* 좌측 Y mm 눈금 */}
        {yMmTicks.map((mm, idx) => {
          const labelVal = centerAxisCoordinates ? -(mm - offsetMm[1]) : -mm
          const yPx = mm2px(mm)
          return (
            <g key={`y-mm-${idx}`}>
              <line x1={leftPos - 10} y1={yPx} x2={leftPos} y2={yPx} stroke='#999' strokeWidth={0.5} />
              <text x={leftPos - 15} y={yPx + tickFontSize / 2 - 5} fontSize={tickFontSize} fill='#666' textAnchor='end' dominantBaseline='middle' fontFamily='Arial, sans-serif'>
                {labelVal.toFixed(0)}
              </text>
            </g>
          )
        })}

        {/* 하단 X mm 눈금 */}
        {xMmTicks.map((mm, idx) => {
          const labelVal = centerAxisCoordinates ? (mm - offsetMm[0]) : mm
          const xPx = mm2px(mm)
          return (
            <g key={`x-mm-${idx}`}>
              <line x1={xPx} y1={bottomPos} x2={xPx} y2={bottomPos + 10} stroke='#999' strokeWidth={0.5} />
              <text x={xPx} y={bottomPos + 20} fontSize={tickFontSize} fill='#666' textAnchor='middle' dominantBaseline='hanging' fontFamily='Arial, sans-serif'>
                {labelVal.toFixed(0)}
              </text>
            </g>
          )
        })}

        {/* 중앙 축 표시 */}
        <line x1={-svgWidthPx / 2} y1={0} x2={svgWidthPx / 2} y2={0} stroke='#ddd' strokeWidth={0.5} strokeDasharray='2,2' opacity={0.5} />
        <line x1={0} y1={-svgWidthPx / 2} x2={0} y2={svgWidthPx / 2} stroke='#ddd' strokeWidth={0.5} strokeDasharray='2,2' opacity={0.5} />
      </g>
    )
  }

  return (
    <g pointerEvents='none'>
      {/* Ruler baselines (axis lines) */}
      <line x1={leftPos} y1={yMin} x2={leftPos} y2={yMax} stroke="#999" strokeWidth={1} />
      <line x1={xMin} y1={bottomPos} x2={xMax} y2={bottomPos} stroke="#999" strokeWidth={1} />
      {/* Shot Ruler 그리드 라인 */}
      {yTicks.map((tick, idx) => (
        <line key={`gy-grid-${idx}`} x1={xMin} y1={tick.position} x2={xMax} y2={tick.position} stroke={gridLineColor} strokeWidth={gridLineWidth} opacity={0.6} />
      ))}
      {xTicks.map((tick, idx) => (
        <line key={`gx-grid-${idx}`} x1={tick.position} y1={yMin} x2={tick.position} y2={yMax} stroke={gridLineColor} strokeWidth={gridLineWidth} opacity={0.6} />
      ))}

      {/* Y축 눈금 (좌측) - Y 좌표 표시 */}
      {yTicks.map((tick, idx) => (
        <g key={`y-tick-${idx}`}>
          {/* 눈금 선 */}
          <line
            x1={leftPos-10}
            y1={tick.position}
            x2={leftPos}
            y2={tick.position}
            stroke='#999'
            strokeWidth={0.5}
          />
          {/* 눈금 텍스트 */}
          <text
            x={leftPos-15}
            y={tick.position + tickFontSize / 2 -5}
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
            y1={bottomPos}
            x2={tick.position}
            y2={bottomPos +10}
            stroke='#999'
            strokeWidth={0.5}
          />
          {/* 눈금 텍스트 */}
          <text
            x={tick.position}
            y={bottomPos +20}
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
