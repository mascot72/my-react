import { useMemo } from 'react'
import type { Field, Die } from '../types'

// seed 기반 난수 생성기 (간단한 LCG)
function mulberry32(seed: number) {
  let t = seed
  return function () {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

// generateCDU는 외부에서 주어지는 PRNG를 사용하여 재현 가능하도록 변경합니다.
function generateCDU(x: number, y: number, waferRadius: number, rand: () => number) {
  const r = Math.hypot(x, y)
  const a = Math.atan2(y, x)
  const radial = Math.cos((r / waferRadius) * Math.PI) * 0.55
  const angular = Math.sin(a * 3) * 0.28
  const noise = (rand() - 0.5) * 0.12
  return radial + angular + noise
}

interface UseCDUDataOptions {
  waferRadius: number
  fieldStepX: number
  fieldStepY: number
  dieRows: number
  dieCols: number
  dieWidth: number
  dieHeight: number
  fieldWidth: number
  fieldHeight: number
  range: number
  fieldArraySize?: [number, number] // [x개수, y개수]
  cduSeed?: number
  cduData?: (number | null)[]
  offsetMm?: [number, number] // Wafer offset (mm 단위) - 렌더링 시 Die 필터링에만 사용
}

/**
 * CDU 데이터 생성 및 필드/다이 구조 생성
 */
export function useCDUData(options: UseCDUDataOptions) {
  const {
    waferRadius,
    fieldStepX,
    fieldStepY,
    dieRows,
    dieCols,
    dieWidth,
    dieHeight,
    fieldWidth,
    fieldHeight,
    range,
    fieldArraySize,
    cduSeed,
    cduData,
    offsetMm = [0, 0],
  } = options

  return useMemo(() => {
    const arr: Field[] = []
    let cduIdx = 0
    const rand = mulberry32(typeof cduSeed === 'number' ? cduSeed : 123456789)

    // shot index 카운팅용 (left-top to right-bottom)
    let shotIndex = 0

    // 필드와 die의 2D 그리드 범위 계산
    // fieldArraySize가 있으면 그것을 기반으로, 없으면 range 기반으로
    const useFieldArraySize = fieldArraySize && fieldArraySize[0] > 0 && fieldArraySize[1] > 0
    let fieldGridMinFx: number
    let fieldGridMaxFx: number
    let fieldGridMinFy: number
    let fieldGridMaxFy: number

    if (useFieldArraySize) {
      // fieldArraySize 기반: [x개수, y개수]를 중심 기준으로 좌우상하 분배
      const xCount = fieldArraySize[0]
      const yCount = fieldArraySize[1]
      fieldGridMinFx = -Math.floor(xCount / 2)
      fieldGridMaxFx = Math.ceil(xCount / 2) - 1
      fieldGridMinFy = -Math.floor(yCount / 2)
      fieldGridMaxFy = Math.ceil(yCount / 2) - 1
    } else {
      // 기본: range 기반
      fieldGridMinFx = -range
      fieldGridMaxFx = range
      fieldGridMinFy = -range
      fieldGridMaxFy = range
    }

    for (let fy = fieldGridMinFy; fy <= fieldGridMaxFy; fy++) {
      for (let fx = fieldGridMinFx; fx <= fieldGridMaxFx; fx++) {
        const cx = fx * fieldStepX
        const cy = fy * fieldStepY
        const dies: Die[] = []

        for (let j = 0; j < dieRows; j++) {
          for (let i = 0; i < dieCols; i++) {
            const dx = cx - fieldWidth / 2 + (i + 0.5) * dieWidth
            const dy = cy - fieldHeight / 2 + (j + 0.5) * dieHeight
            let cdu: number | null

            if (Array.isArray(cduData)) {
              cdu = cduData[cduIdx++] ?? null
            } else {
              const hasCdu = rand() > 0.1
              cdu = hasCdu ? generateCDU(dx, dy, waferRadius, rand) : null
            }

            // dieIndex: left-bottom → right-top (j를 역순으로)
            const dieIndex = (dieRows - 1 - j) * dieCols + i

            // dieSequence: 단순 2D 격자 순번 (wafer 상관없이 전체 직사각형)
            // 필드 그리드 좌표 (fx, fy)에서 die 위치 (j, i)
            // → 절대 위치로 변환
            const fieldGridWidth = fieldGridMaxFx - fieldGridMinFx + 1
            const globalFieldRow = fy - fieldGridMinFy
            const globalFieldCol = fx - fieldGridMinFx

            const globalDieRow = globalFieldRow * dieRows + j
            const globalDieCol = globalFieldCol * dieCols + i
            const totalDieColsPerRow = fieldGridWidth * dieCols

            // 단순 증가: row * totalCols + col
            const dieSequence = globalDieRow * totalDieColsPerRow + globalDieCol

            dies.push({
              x: dx,
              y: dy,
              cdu,
              mergeGroup: null,
              dieIndex,
              dieSequence,
            })
          }
        }

        // 필드에 포함할지 결정 (어떤 다이 중심이라도 wafer 내부에 있으면 포함)
        // offset을 고려하여 Wafer Circle 내부 판정
        const anyDieCenterInside = dies.some((d) => {
          // Die의 절대 위치에서 offset만큼 이동한 Wafer 위치로 판정
          const dxWithOffset = d.x - offsetMm[0]
          const dyWithOffset = d.y - offsetMm[1]
          return Math.hypot(dxWithOffset, dyWithOffset) <= waferRadius
        })
        // push는 항상 하되 포함 여부는 flag로 남김 — UI에서 전체 그리드 표시 토글에 사용
        const included = anyDieCenterInside

        // 다이가 완전히 wafer 내부에 있는지 확인
        for (const d of dies) {
          const halfW = dieWidth / 2
          const halfH = dieHeight / 2
          const corners = [
            [d.x - halfW, d.y - halfH],
            [d.x + halfW, d.y - halfH],
            [d.x - halfW, d.y + halfH],
            [d.x + halfW, d.y + halfH],
          ]
          // offset을 고려하여 판정
          const allCornersInside = corners.every(([cx_, cy_]) => {
            const cxWithOffset = cx_ - offsetMm[0]
            const cyWithOffset = cy_ - offsetMm[1]
            return Math.hypot(cxWithOffset, cyWithOffset) <= waferRadius + 1e-9
          })
          if (!allCornersInside) {
            d.cdu = null
          }
        }

        arr.push({ cx, cy, dies, shotIndex, included })
        shotIndex++
      }
    }

    return arr
  }, [waferRadius, fieldStepX, fieldStepY, dieRows, dieCols, dieWidth, dieHeight, fieldWidth, fieldHeight, range, fieldArraySize, cduSeed, cduData, offsetMm])
}
