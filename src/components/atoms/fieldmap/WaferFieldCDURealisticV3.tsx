import React from 'react'

const WaferFieldCDU_V3: React.FC = () => {
  // ---- Parameter Variables ----
  const waferRadius = 150 // mm
  const fieldWidth = 20 // mm
  const fieldHeight = 30 // mm
  const dieCols = 2
  const dieRows = 3
  const waferPx = 800 // SVG 상의 wafer 지름 픽셀 크기

  const dieWidth = fieldWidth / dieCols
  const dieHeight = fieldHeight / dieRows

  // SVG scaling (단위 축소)
  const scale = waferPx / (waferRadius * 2) // 300mm → 50 units
  const waferR = waferRadius * scale

  // ---- CDU Color Mapping ----
  function cduToColor(v: number | null) {
    if (v == null) return 'transparent'
    const t = (v + 1) / 2
    const r = Math.floor(255 * t)
    const g = Math.floor(255 * (1 - Math.abs(t - 0.5) * 2))
    const b = Math.floor(255 * (1 - t))
    return `rgb(${r},${g},${b})`
  }

  // ---- CDU Distribution ----
  function generateCDU(x: number, y: number) {
    const r = Math.hypot(x, y)
    const a = Math.atan2(y, x)
    return Math.cos((r / waferRadius) * Math.PI) * 0.6 + Math.sin(a * 3) * 0.3 + (Math.random() - 0.5) * 0.2
  }

  // ---- Generate fields ----
  const fields: {
    cx: number
    cy: number
    dies: { x: number; y: number; cdu: number | null }[]
    avgCDU: number
  }[] = []

  const stepX = fieldWidth
  const stepY = fieldHeight
  const range = Math.floor(waferRadius / Math.min(stepX, stepY))

  for (let fy = -range; fy <= range; fy++) {
    for (let fx = -range; fx <= range; fx++) {
      const cx = fx * stepX
      const cy = fy * stepY
      const dist = Math.hypot(cx, cy)

      // 필드 외곽이 wafer 밖이면 제외
      if (dist + Math.hypot(fieldWidth / 2, fieldHeight / 2) >= waferRadius) continue

      const dies: { x: number; y: number; cdu: number | null }[] = []

      // 각 필드 내 2x3 die 생성
      for (let j = 0; j < dieRows; j++) {
        for (let i = 0; i < dieCols; i++) {
          const dx = cx - fieldWidth / 2 + (i + 0.5) * dieWidth
          const dy = cy - fieldHeight / 2 + (j + 0.5) * dieHeight
          const inside = Math.hypot(dx, dy) <= waferRadius
          const cdu = inside && Math.random() > 0.1 ? generateCDU(dx, dy) : null
          dies.push({ x: dx, y: dy, cdu })
        }
      }

      // Random irregular merging simulation
      const mergedDies = dies.filter(() => Math.random() > 0.2)
      const avgCDU = mergedDies.reduce((a, b) => a + (b.cdu || 0), 0) / mergedDies.length
      fields.push({ cx, cy, dies: mergedDies, avgCDU })

      // const valid = dies.filter((d) => d.cdu != null)
      // const avg = valid.length ? valid.reduce((a, b) => a + (b.cdu ?? 0), 0) / valid.length : 0
      // fields.push({ cx, cy, dies, avgCDU: avg })
    }
  }

  // ---- Render ----
  return (
    <svg
      width={waferPx}
      height={waferPx * 1.1}
      viewBox='-400 -400 800 850'
      style={{ background: 'white', display: 'block', margin: 'auto' }}>
      {/* wafer outline */}
      <circle cx='0' cy='0' r={waferR} stroke='#666' strokeWidth='0.8' fill='none' />

      {/* fields */}
      {fields.map((f, i) => (
        <g key={i}>
          {/* field outline */}
          <rect
            x={(f.cx - fieldWidth / 2) * scale}
            y={(f.cy - fieldHeight / 2) * scale}
            width={fieldWidth * scale}
            height={fieldHeight * scale}
            fill='none'
            stroke='#d58686ff'
            strokeWidth='1'
          />

          {/* dies */}
          {f.dies.map((d, j) => (
            <rect
              key={j}
              x={(d.x - dieWidth / 2) * scale}
              y={(d.y - dieHeight / 2) * scale}
              width={dieWidth * scale}
              height={dieHeight * scale}
              fill={cduToColor(d.cdu)}
              // stroke='rgba(0,0,0,0.2)'
              // fill='none'
              stroke='rgba(255,255,255,0.05)'
              strokeWidth='0.15'
            />
          ))}

          {/* field average value */}
          <text x={f.cx * scale} y={f.cy * scale + 1} fontSize='3.5' textAnchor='middle' fill='#111'>
            {f.avgCDU.toFixed(2)}
          </text>
        </g>
      ))}

      {/* CDU bar */}
      <defs>
        <linearGradient id='cduBar' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0%' stopColor='#00f' />
          <stop offset='50%' stopColor='#0f0' />
          <stop offset='100%' stopColor='#f00' />
        </linearGradient>
      </defs>
      <rect x={-150} y={waferR + 20} width={300} height={8} fill='url(#cduBar)' stroke='#999' strokeWidth='0.2' />
      <text x='-155' y={waferR + 35} fontSize='8' fill='#333'>
        CDU (-)
      </text>
      <text x='140' y={waferR + 35} fontSize='8' fill='#333'>
        (+)
      </text>
    </svg>
  )
}

export default WaferFieldCDU_V3
