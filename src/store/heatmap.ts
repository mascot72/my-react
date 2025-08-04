// heatmap.ts - 캔버스 기반 동적 히트맵 생성 및 렌더링

// 1. 히트맵 설정값 정의
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
  minOpacity: 1,
  maxOpacity: 1,
  distance: 30,
  radius: 40,
}

// 2. 샘플 데이터 동적 생성 함수
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

// 3. 히트맵 렌더링 함수 (canvas에 그림)
export function drawHeatmap(
  canvas: HTMLCanvasElement,
  data: { x: number; y: number; value: number }[],
  config = heatmapConfig
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { gradient, power, minOpacity, maxOpacity, distance, radius } = config
  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  const pixelData = new Float32Array(canvasWidth * canvasHeight)
  const valueData = new Float32Array(canvasWidth * canvasHeight)
  const weightData = new Float32Array(canvasWidth * canvasHeight)
  const lutSize = Math.ceil(distance * distance) + 1
  const radiusSq = radius * radius
  const weightLUT = new Float32Array(lutSize)
  const exp = power / 2

  // 거리별 가중치 LUT 생성
  for (let i = 1; i < lutSize; i++) {
    weightLUT[i] = 1 / Math.pow(i, exp)
  }
  weightLUT[0] = 1 / Math.pow(0.0001, exp)

  // 각 데이터 포인트가 픽셀에 미치는 영향 계산
  data.forEach(({ x: px, y: py, value }) => {
    for (let y = 0; y < canvasHeight; y++) {
      const dy = py - y
      const yOffset = y * canvasWidth
      for (let x = 0; x < canvasWidth; x++) {
        const dx = px - x
        const distSq = dx * dx + dy * dy
        if (radiusSq && distSq > radiusSq) continue
        const weight = distance
          ? weightLUT[Math.min(Math.floor(distSq), lutSize - 1)]
          : 1 / Math.pow(distSq, exp)
        const index = yOffset + x
        valueData[index] += value * weight
        weightData[index] += weight
      }
    }
  })

  // 팔레트(gradient) 생성
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

  // 픽셀별 색상 및 투명도 계산
  const imageData = ctx.createImageData(canvasWidth, canvasHeight)
  for (let i = 0; i < pixelData.length; i++) {
    pixelData[i] = valueData[i] / (weightData[i] || 1)
    const alpha = pixelData[i] * 255
    const idx = Math.floor(alpha) * 4
    const j = i * 4
    const [r, g, b] = [palette[idx], palette[idx + 1], palette[idx + 2]]
    const minOpacityData = minOpacity * 255
    const maxOpacityData = maxOpacity * 255
    const resultOpacity =
      alpha < minOpacityData
        ? minOpacityData
        : alpha > maxOpacityData
        ? maxOpacityData
        : alpha
    imageData.data[j + 0] = r
    imageData.data[j + 1] = g
    imageData.data[j + 2] = b
    imageData.data[j + 3] = resultOpacity
  }
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