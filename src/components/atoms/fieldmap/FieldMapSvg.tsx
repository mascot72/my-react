import React from 'react'

const WaferFieldCDURealisticSVG: React.FC = () => {
  // 웨이퍼 및 필드 물리 크기(mm)
  const waferRadius = 150 // mm (300mm wafer)
  const fieldWidth = 26 / 3
  const fieldHeight = 33 / 6

  // SVG 스케일 (1mm = 2px)
  const scale = 2
  const radiusPx = waferRadius * scale

  // 필드 배치 계산
  const cols = Math.ceil((waferRadius * 2) / fieldWidth)
  const rows = Math.ceil((waferRadius * 2) / fieldHeight)

  // CDU 색상 매핑
  const getColor = (v: number) => {
    const ratio = (v + 5) / 10
    if (ratio < 0.25) return '#00f'
    if (ratio < 0.5) return '#0ff'
    if (ratio < 0.75) return '#0f0'
    return '#f00'
  }

  // 필드 리스트 생성
  const fields = []
  for (let r = -rows / 2; r < rows / 2; r++) {
    for (let c = -cols / 2; c < cols / 2; c++) {
      const cx = c * fieldWidth
      const cy = r * fieldHeight

      // 필드 중심이 웨이퍼 밖이면 제외
      // const distance = Math.sqrt(cx * cx + cy * cy)
      // if (distance + Math.hypot(fieldWidth / 2, fieldHeight / 2) > waferRadius) continue

      // 네 꼭짓점 계산
      const corners = [
        [cx - fieldWidth / 2, cy - fieldHeight / 2],
        [cx + fieldWidth / 2, cy - fieldHeight / 2],
        [cx - fieldWidth / 2, cy + fieldHeight / 2],
        [cx + fieldWidth / 2, cy + fieldHeight / 2],
      ]
      // 모든 꼭짓점이 웨이퍼 안쪽이어야 함
      const inside = corners.every(([x, y]) => Math.sqrt(x * x + y * y) < waferRadius)
      if (!inside) continue

      const cdu = Math.random() * 10 - 5 // -5~+5 nm
      fields.push({ cx, cy, cdu })
    }
  }

  return (
    <svg
      width={radiusPx * 2 + 40}
      height={radiusPx * 2 + 40}
      viewBox={`${-radiusPx - 20} ${-radiusPx - 20} ${radiusPx * 2 + 40} ${radiusPx * 2 + 40}`}
      style={{ background: '#111', display: 'block', margin: 'auto' }}>
      {/* 웨이퍼 외곽선 */}
      <circle cx={0} cy={0} r={radiusPx} fill='none' stroke='#888' strokeWidth={1.5} />

      {/* 필드 표시 */}
      {fields.map((f, i) => (
        <g key={i} transform={`translate(${f.cx * scale},${f.cy * scale})`}>
          <rect
            x={(-fieldWidth / 2) * scale}
            y={(-fieldHeight / 2) * scale}
            width={fieldWidth * scale}
            height={fieldHeight * scale}
            fill={getColor(f.cdu)}
            stroke='#333'
            strokeWidth={0.5}
            // rx={3}
          />
          <text x={0} y={3} textAnchor='middle' fontSize='8' fill='#fff' fontWeight='bold'>
            {f.cdu.toFixed(1)}
          </text>
        </g>
      ))}

      {/* 중심 표시 */}
      <circle cx={0} cy={0} r={3} fill='#fff' />

      {/* 제목 */}
      <text x={0} y={-radiusPx - 15} textAnchor='middle' fontSize='14' fill='#eee'>
        Realistic Wafer Field CDU Map (Stepper Shot Layout)
      </text>

      {/* 범례 */}
      <g transform={`translate(${radiusPx - 90}, ${radiusPx - 40})`}>
        <rect width='100' height='10' fill='url(#grad)' />
        <text x='0' y='20' fontSize='10' fill='#fff'>
          -5 nm
        </text>
        <text x='100' y='20' fontSize='10' fill='#fff' textAnchor='end'>
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

export default WaferFieldCDURealisticSVG
