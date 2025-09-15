// heatmap.ts - 캔버스 기반 동적 히트맵 생성 및 렌더링
// 주요 기능:
// 1. heatmapConfig: 히트맵 팔레트/파라미터 설정
// 2. generateSampleData: 임의의 히트맵 샘플 데이터 생성
// 3. generateWaferSampleData: 웨이퍼 형태의 샘플 데이터 생성(중심값 높게)
// 4. drawHeatmap: canvas에 히트맵 렌더링(픽셀별 색상/투명도 계산)

/**
 * heatmapConfig
 * - gradient: 값 비율별 색상 팔레트
 * - power: 거리 가중치 계산에 사용되는 지수
 * - minOpacity, maxOpacity: 픽셀 최소/최대 투명도
 * - distance: 거리 LUT(가중치) 계산용
 * - radius: 각 포인트 영향 반경
 */
export const heatmapConfig = {
  gradient: {
    0.0625: 'rgb(0,4,188)',
    0.125: 'rgb(0,0,255)',
    0.1875: 'rgb(1, 55, 254)',
    0.25: 'rgb(1, 127, 252)',
    0.3125: 'rgb(0, 194, 255)',
    0.375: 'rgb(8, 251, 255)',
    0.4375: 'rgb(66, 254, 193)',
    0.5: 'rgb(127, 255, 127)',
    0.5625: 'rgb(188, 255, 64)',
    0.625: 'rgb(255, 255, 0)',
    0.6875: 'rgb(255, 191, 2)',
    0.75: 'rgb(255, 127, 0)',
    0.8125: 'rgb(255, 65, 0)',
    0.875: 'rgb(255, 0, 0)',
    0.9375: 'rgb(186, 1, 6)',
    1.0: 'rgb(127, 1, 0)',
  },
  power: 5,
  minOpacity: 0.2, // 보완: 최소 투명도 조정
  maxOpacity: 1,
  distance: 30,
  radius: 300,
}

// 샘플 데이터 동적 생성 함수
/**
 * generateSampleData
 * - 임의의 위치(x, y)와 값(value)을 가진 샘플 데이터 생성
 * - 전체 영역에 랜덤 분포
 */
export function generateSampleData(count: number, width: number, height: number) {
  const arr = []
  for (let i = 0; i < count; i++) {
    arr.push({
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
      value: Math.random() * 2,
    })
  }
  return arr
}

// 개선된 샘플 데이터 생성 (원형 영역 내, 중심값 높게)
/**
 * generateWaferSampleData
 * - 원형 영역 내에 랜덤 분포
 * - 중심에 가까울수록 value가 높게 생성
 */
export function generateWaferSampleData(count: number, width: number, height: number) {
  const arr = []
  const cx = width / 2
  const cy = height / 2
  const r = (Math.min(width, height) / 2) * 0.9
  for (let i = 0; i < count; i++) {
    // 원 내부 랜덤 좌표
    const angle = Math.random() * Math.PI * 2
    const rad = Math.random() * r
    const x = Math.floor(cx + Math.cos(angle) * rad)
    const y = Math.floor(cy + Math.sin(angle) * rad)
    // 중심에서 가까울수록 value 높게
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
    const value = 1 - dist / r + Math.random() * 0.2
    arr.push({ x, y, value: Math.max(0, value) })
  }
  return arr
}

// 히트맵 렌더링 함수 (canvas에 그림)
/**
 * drawHeatmap
 * - canvas에 히트맵 이미지를 렌더링
 * - 각 데이터 포인트가 주변 픽셀에 미치는 영향(가중치) 계산
 * - 픽셀별로 값/가중치 누적 후, 팔레트(gradient)로 색상/투명도 결정
 * - 데이터 없거나 캔버스 컨텍스트 없을 때 안내 메시지 표시
 */
export function drawHeatmap(
  canvas: HTMLCanvasElement,
  data: { x: number; y: number; value: number }[],
  config = heatmapConfig,
) {
  // 1. 캔버스 컨텍스트 획득 및 예외 처리
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    // 캔버스 컨텍스트가 없을 때 안내 메시지
    console.warn('Canvas context not found')
    return
  }
  if (!data || data.length === 0) {
    // 데이터가 없을 때 안내 메시지
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = '16px Arial'
    ctx.fillStyle = '#888'
    ctx.textAlign = 'center'
    ctx.fillText('데이터 없음', canvas.width / 2, canvas.height / 2)
    return
  }

  // 2. 파라미터 및 버퍼 초기화
  const { gradient, power, minOpacity, maxOpacity, distance, radius } = config
  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  // 픽셀별 값/가중치 버퍼
  const pixelData = new Float32Array(canvasWidth * canvasHeight)
  const valueData = new Float32Array(canvasWidth * canvasHeight)
  const weightData = new Float32Array(canvasWidth * canvasHeight)
  // 거리 LUT(가중치 빠른 계산용)
  const lutSize = Math.ceil(distance * distance) + 1
  const radiusSq = radius * radius
  const weightLUT = new Float32Array(lutSize)
  const exp = power / 2

  // 3. 거리별 가중치 LUT 생성 (거리^exp 분모)
  for (let i = 1; i < lutSize; i++) {
    weightLUT[i] = 1 / Math.pow(i, exp)
  }
  weightLUT[0] = 1 / Math.pow(0.0001, exp) // 0거리 예외 처리

  // 4. 각 데이터 포인트가 모든 픽셀에 미치는 영향 계산
  //    - 각 픽셀에 대해 value*weight, weight 누적
  data.forEach(({ x: px, y: py, value }) => {
    for (let y = 0; y < canvasHeight; y++) {
      const dy = py - y
      const yOffset = y * canvasWidth
      for (let x = 0; x < canvasWidth; x++) {
        const dx = px - x
        const distSq = dx * dx + dy * dy
        // 반경 밖은 무시
        if (radiusSq && distSq > radiusSq) continue
        // 거리 LUT로 가중치 계산
        const weight = distance ? weightLUT[Math.min(Math.floor(distSq), lutSize - 1)] : 1 / Math.pow(distSq, exp)
        const index = yOffset + x
        valueData[index] += value * weight
        weightData[index] += weight
      }
    }
  })

  // 5. 팔레트(gradient) 생성: 0~255 값에 대해 색상 lookup
  const paletteCanvas = document.createElement('canvas')
  const paletteCtx = paletteCanvas.getContext('2d')
  paletteCanvas.width = 256
  paletteCanvas.height = 1
  const gradientStyle = paletteCtx!.createLinearGradient(0, 0, 255, 1)
  Object.entries(gradient).forEach(([key, color]) => {
    gradientStyle.addColorStop(Number(key), color)
  })
  paletteCtx!.fillStyle = gradientStyle
  paletteCtx!.fillRect(0, 0, 256, 1)
  const palette = paletteCtx!.getImageData(0, 0, 256, 1).data

  // 6. 픽셀별 색상/투명도 계산 및 이미지 버퍼에 기록
  const imageData = ctx.createImageData(canvasWidth, canvasHeight)
  for (let i = 0; i < pixelData.length; i++) {
    // value/weight로 정규화된 값
    pixelData[i] = valueData[i] / (weightData[i] || 1)
    // 0~255로 변환
    const alpha = pixelData[i] * 255
    const idx = Math.floor(Math.max(0, Math.min(alpha, 255))) * 4
    const j = i * 4
    // 값이 너무 낮으면 완전히 투명하게 처리
    if (pixelData[i] < 0.01) {
      imageData.data[j + 3] = 0
      continue
    }
    // 팔레트에서 색상 추출
    const [r, g, b] = [palette[idx], palette[idx + 1], palette[idx + 2]]
    // 투명도(min~max 범위로 클램핑)
    const minOpacityData = minOpacity * 255
    const maxOpacityData = maxOpacity * 255
    const resultOpacity = alpha < minOpacityData ? minOpacityData : alpha > maxOpacityData ? maxOpacityData : alpha
    imageData.data[j + 0] = r
    imageData.data[j + 1] = g
    imageData.data[j + 2] = b
    imageData.data[j + 3] = resultOpacity
  }
  // 7. 최종 이미지 버퍼를 캔버스에 렌더링
  ctx.putImageData(imageData, 0, 0)
}

// 4. 보완해야 할 기능
// - 데이터가 없을 때 안내 메시지 표시
// - 반응형 canvas 크기 지원
// - 외부에서 gradient, radius 등 옵션 변경 가능하게 개선
// - 데이터가 많을 때 성능 최적화(웹워커 등)
// - React 컴포넌트로 래핑하여 직접 사용 가능하게 개선

// 5. 샘플 데이터 및 연결 예시
// (아래 코드는 React 컴포넌트에서 사용 예시로 활용)

// --- useCoordinateMap.js의 변환 함수 import ---
import { convertSampleDataForHeatmap } from './useCoordinateMap'

/**
 * drawHeatmapWithConvertedSample
 * - 40개 포인트 기준 변환된 샘플 데이터를 drawHeatmap으로 렌더링
 * - canvas, config를 받아 내부에서 변환 및 렌더링
 */
/**
 * drawHeatmapWithConvertedSample
 * - 40개 포인트 기준 변환된 샘플 데이터를 drawHeatmap으로 렌더링
 * - canvas, config를 받아 내부에서 변환 및 렌더링
 */
export async function drawHeatmapWithConvertedSample(
  canvas: HTMLCanvasElement,
  config: typeof heatmapConfig = heatmapConfig,
): Promise<void> {
  // 1. 변환된 샘플 데이터 생성 (40개 포인트)
  const converted = await convertSampleDataForHeatmap(40, canvas.width, canvas.height)
  // 2. drawHeatmap으로 렌더링
  //    변환 결과는 [[x, y, value], ...] 배열이므로, {x, y, value} 객체로 변환
  const data = converted.map(([x, y, value]) => ({ x, y, value }))
  drawHeatmap(canvas, data, config)
}
