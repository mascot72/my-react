import React from 'react'

const WaferFieldCDUSVG_Grid: React.FC = () => {
  const waferRadius = 180 // 웨이퍼 반경(px)
  const gridSize = 9 // 9x9 필드
  const fieldSize = 35 // 각 필드의 한 변 길이(px)

  // CDU 데이터 생성 (-5~+5 nm)
  const fields = Array.from({ length: gridSize * gridSize }, (_, i) => {
    const row = Math.floor(i / gridSize)
    const col = i % gridSize
    const x = (col - gridSize / 2 + 0.5) * fieldSize
    const y = (row - gridSize / 2 + 0.5) * fieldSize
    const cdu = Math.random() * 10 - 5 // -5~+5
    return { x, y, cdu }
  })

  // CDU 값 → 색상 (파랑→초록→노랑→빨강)
  const getColor = (v: number) => {
    const ratio = (v + 5) / 10 // normalize 0~1
    if (ratio < 0.25) return '#00f' // 낮음
    if (ratio < 0.5) return '#0ff' // 중하
    if (ratio < 0.75) return '#0f0' // 중상
    return '#f00' // 높음
  }

  return (
    <svg
      width={450}
      height={450}
      viewBox='-225 -225 450 450'
      style={{ background: '#111', display: 'block', margin: 'auto' }}>
      {/* 웨이퍼 외곽선 */}
      <circle cx={0} cy={0} r={waferRadius} fill='none' stroke='#aaa' strokeWidth={2} />

      {/* 필드 배열 */}
      {fields.map((f, i) => {
        const distance = Math.sqrt(f.x * f.x + f.y * f.y)
        const diagonal = (Math.sqrt(2) * fieldSize) / 2

        // 웨이퍼 밖의 필드는 제외 (필드 중심이 웨이퍼 반경보다 크면 패스)
        if (distance + diagonal - 2 > waferRadius) return null

        return (
          <g key={i} transform={`translate(${f.x},${f.y})`}>
            <rect
              x={-fieldSize / 2}
              y={-fieldSize / 2}
              width={fieldSize}
              height={fieldSize}
              fill={getColor(f.cdu)}
              stroke='#333'
              strokeWidth={1}
              rx={4}
            />
            <text x={0} y={4} textAnchor='middle' fontSize='10' fill='#fff' fontWeight='bold'>
              {f.cdu.toFixed(1)}
            </text>
          </g>
        )
      })}

      {/* 중심 표시 */}
      <circle cx={0} cy={0} r={3} fill='#fff' />

      {/* 제목 */}
      <text x={0} y={-200} textAnchor='middle' fontSize='16' fill='#eee' fontWeight='600'>
        Wafer Field CDU Map (Stepper Field Grid)
      </text>

      {/* 범례 */}
      <g transform='translate(120,160)'>
        <rect x='0' y='0' width='100' height='10' fill='url(#grad)' />
        <text x='0' y='25' fontSize='10' fill='#fff'>
          -5 nm
        </text>
        <text x='100' y='25' fontSize='10' fill='#fff' textAnchor='end'>
          +5 nm
        </text>
      </g>

      <defs>
        <linearGradient id='grad' x1='0' x2='1'>
          <stop offset='0%' stopColor='#00f' />
          <stop offset='25%' stopColor='#0ff' />
          <stop offset='50%' stopColor='#0f0' />
          <stop offset='75%' stopColor='#ff0' />
          <stop offset='100%' stopColor='#f00' />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default WaferFieldCDUSVG_Grid
