import React, { useMemo } from 'react'

type MatCell = {
  x: number
  y: number
  width: number
  height: number
  value: number | null
  merged?: boolean
  mergeGroup?: number
}

type Die = {
  x: number
  y: number
  width: number
  height: number
  mats: MatCell[]
}

type Field = {
  x: number
  y: number
  width: number
  height: number
  dies: Die[]
}

// 🎨 CDU 색상 보간 (RdYlBu 스타일)
function getColor(value: number | null): string {
  if (value === null) return 'transparent'

  const t = Math.max(0, Math.min(1, (value + 1) / 2)) // normalize [-1,1] → [0,1]
  // RdYlBu: 빨강-노랑-초록-파랑 계열
  const stops = [
    [165, 0, 38],
    [244, 109, 67],
    [253, 174, 97],
    [255, 255, 191],
    [171, 217, 233],
    [116, 173, 209],
    [69, 117, 180],
  ]

  const n = (stops.length - 1) * t
  const i = Math.floor(n)
  const f = n - i
  const [r1, g1, b1] = stops[i]
  const [r2, g2, b2] = stops[Math.min(i + 1, stops.length - 1)]

  const r = Math.round(r1 + (r2 - r1) * f)
  const g = Math.round(g1 + (g2 - g1) * f)
  const b = Math.round(b1 + (b2 - b1) * f)

  return `rgb(${r},${g},${b})`
}

// ✅ wafer 내부 포함 여부 계산
function isDieInsideWafer(
  dieCenterX: number,
  dieCenterY: number,
  dieWidth: number,
  dieHeight: number,
  waferRadius: number,
) {
  const corners = [
    [dieCenterX - dieWidth / 2, dieCenterY - dieHeight / 2],
    [dieCenterX + dieWidth / 2, dieCenterY - dieHeight / 2],
    [dieCenterX - dieWidth / 2, dieCenterY + dieHeight / 2],
    [dieCenterX + dieWidth / 2, dieCenterY + dieHeight / 2],
  ]
  return corners.every(([x, y]) => Math.hypot(x, y) <= waferRadius)
}

const WaferCDUMap: React.FC = () => {
  const waferRadius = 150
  const fieldSize = { width: 20, height: 30 }
  const dieArray = { cols: 2, rows: 3 }
  const mergeThreshold = 0.08
  const scale = 3 // 1mm = 3px

  const waferPx = waferRadius * 2 * scale
  const center = waferRadius * scale

  const fields = useMemo(() => {
    const result: Field[] = []
    const cols = Math.ceil((waferRadius * 2) / fieldSize.width)
    const rows = Math.ceil((waferRadius * 2) / fieldSize.height)

    for (let r = -rows / 2; r < rows / 2; r++) {
      for (let c = -cols / 2; c < cols / 2; c++) {
        const fieldX = c * fieldSize.width + fieldSize.width / 2
        const fieldY = r * fieldSize.height + fieldSize.height / 2
        const fieldDist = Math.hypot(fieldX, fieldY)

        // wafer 밖이면 skip
        if (fieldDist - Math.hypot(fieldSize.width / 2, fieldSize.height / 2) > waferRadius) continue

        const dies: Die[] = []
        const dieW = fieldSize.width / dieArray.cols
        const dieH = fieldSize.height / dieArray.rows

        for (let dy = 0; dy < dieArray.rows; dy++) {
          for (let dx = 0; dx < dieArray.cols; dx++) {
            const dieCx = fieldX - fieldSize.width / 2 + dieW * (dx + 0.5)
            const dieCy = fieldY - fieldSize.height / 2 + dieH * (dy + 0.5)

            if (!isDieInsideWafer(dieCx, dieCy, dieW, dieH, waferRadius)) continue

            // irregular mat 구성
            const matCountX = 3 + Math.floor(Math.random() * 3)
            const matCountY = 3 + Math.floor(Math.random() * 3)
            const mats: MatCell[] = []

            for (let my = 0; my < matCountY; my++) {
              for (let mx = 0; mx < matCountX; mx++) {
                const matW = dieW / matCountX
                const matH = dieH / matCountY
                const x = dieCx - dieW / 2 + mx * matW
                const y = dieCy - dieH / 2 + my * matH
                const value = Math.random() > 0.1 ? Math.random() * 2 - 1 : null
                mats.push({ x, y, width: matW, height: matH, value })
              }
            }

            // 병합 그룹 계산
            let mergeGroupId = 0
            for (let i = 0; i < mats.length; i++) {
              const a = mats[i]
              if (a.value === null) continue
              for (let j = i + 1; j < mats.length; j++) {
                const b = mats[j]
                if (b.value === null) continue
                if (Math.abs(a.value - b.value) < mergeThreshold) {
                  a.merged = b.merged = true
                  a.mergeGroup = b.mergeGroup = mergeGroupId
                }
              }
              mergeGroupId++
            }

            dies.push({ x: dieCx, y: dieCy, width: dieW, height: dieH, mats })
          }
        }

        result.push({
          x: fieldX,
          y: fieldY,
          width: fieldSize.width,
          height: fieldSize.height,
          dies,
        })
      }
    }

    return result
  }, [])

  return (
    <svg
      width={waferPx}
      height={waferPx}
      viewBox={`0 0 ${waferPx} ${waferPx}`}
      style={{ background: '#fff', border: '1px solid #ccc' }}>
      {/* wafer outline */}
      <circle cx={center} cy={center} r={waferRadius * scale} stroke='#333' strokeWidth={1} fill='none' />

      {/* field */}
      {fields.map((f, fi) => (
        <g key={fi} transform={`translate(${center + f.x * scale}, ${center + f.y * scale})`}>
          {/* field outline */}
          <rect
            x={(-f.width / 2) * scale}
            y={(-f.height / 2) * scale}
            width={f.width * scale}
            height={f.height * scale}
            fill='none'
            stroke='rgba(0,0,0,0.25)'
            strokeWidth={0.8}
          />

          {/* dies */}
          {f.dies.map((d, di) => (
            <g key={di}>
              {d.mats.map((m, mi) => {
                const color = getColor(m.value)
                const stroke = m.merged ? 'transparent' : 'rgba(120,120,120,0.5)'
                const textX = (m.x + m.width / 2 - f.x) * scale
                const textY = (m.y + m.height / 2 - f.y) * scale

                return (
                  <g key={mi}>
                    <rect
                      x={(m.x - f.x) * scale}
                      y={(m.y - f.y) * scale}
                      width={m.width * scale}
                      height={m.height * scale}
                      fill={color}
                      stroke={stroke}
                      strokeWidth={0.5}
                    />
                    {m.value !== null && (
                      <text
                        x={textX}
                        y={textY}
                        textAnchor='middle'
                        dominantBaseline='middle'
                        fontSize={9}
                        fill='#202020'>
                        {m.value.toFixed(2)}
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          ))}
        </g>
      ))}
    </svg>
  )
}

export default WaferCDUMap
