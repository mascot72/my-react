// heatmap logic - 캔버스 기반 히트맵 시각화 함수

// 히트맵 설정값 (색상 그라데이션, 영향력, 투명도, 거리, 반경 등)
const heatmapConfig = {
  gradient: {
    0.0625: 'rgb(0,4,188)', // 파랑 계열
    0.125: 'rgb(0,0,255)',
    0.1875: 'rgb(1, 55, 254)',
    0.25: 'rgb(1, 127, 252)',
    0.3125: 'rgb(0, 194, 255)',
    0.375: 'rgb(8, 251, 255)',
    0.4375: 'rgb(66, 254, 193)',
    0.5: 'rgb(127, 255, 127)', // 녹색 계열
    0.5625: 'rgb(188, 255, 64)',
    0.625: 'rgb(255, 255, 0)', // 노랑 계열
    0.6875: 'rgb(255, 191, 2)',
    0.75: 'rgb(255, 127, 0)', // 주황 계열
    0.8125: 'rgb(255, 65, 0)',
    0.875: 'rgb(255, 0, 0)', // 빨강 계열
    0.9375: 'rgb(186, 1, 6)',
    1.0: 'rgb(127, 1, 0)',
  },
  power: 5, // 각 데이터 포인트의 영향력(가중치) 강도
  minOpacity: 1, // 최소 투명도 (0~1)
  maxOpacity: 1, // 최대 투명도 (0~1)
  distance: 300, // 거리 기준(해당 거리보다 멀수록 영향력 감소)
  radius: 400, // 데이터 포인트가 영향을 줄 수 있는 최대 거리
}

// 히트맵을 그리는 메인 함수
const HeatmaDraw = () => {
  // 캔버스 요소 및 컨텍스트 가져오기
  const heatmapCanvas = document.getElementById('heatmapcanvas')
  const heatmapCanvasCtx = heatmapCanvas.getContext('2d')

  // 설정값 변수화
  const gradient = heatmapConfig.gradient
  const power = heatmapConfig.power
  const minOpacity = heatmapConfig.minOpacity
  const maxOpacity = heatmapConfig.maxOpacity
  const distance = heatmapConfig.distance
  const radius = heatmapConfig.radius

  // 히트맵 데이터 예시 (x, y 좌표와 value)
  const data = [
    { x: -5, y: 0, value: 1.44 },
    { x: -3, y: -2, value: 1.84 },
  ]

  // 캔버스 크기 및 픽셀 데이터 배열 초기화
  const canvasWidth = 100 // 캔버스 가로 픽셀 수
  const canvasHeight = 100 // 캔버스 세로 픽셀 수
  const pixelData = new Float32Array(canvasWidth * canvasHeight) // 최종 값 저장
  const valueData = new Float32Array(canvasWidth * canvasHeight) // 누적 값 저장
  const weightData = new Float32Array(canvasWidth * canvasHeight) // 누적 가중치 저장

  // 거리별 가중치 계산을 위한 LUT(look-up table) 생성
  const lutSize = Math.ceil(distance * distance) + 1
  const radiusSq = radius * radius
  const weightLUT = new Float32Array(lutSize)
  const exp = power / 2

  // LUT에 거리별 가중치 값 미리 계산
  for (let i = 1; i < lutSize; i++) {
    weightLUT[i] = 1 / Math.pow(i, exp)
  }
  weightLUT[0] = 1 / Math.pow(0.0001, exp) // 0거리 예외 처리

  // 각 데이터 포인트가 모든 픽셀에 미치는 영향 계산
  data.forEach((heatmapData) => {
    const [px, py] = [heatmapData.x, heatmapData.y] // 데이터 포인트 좌표
    const value = heatmapData.value // 데이터 값
    for (let y = 0; y < canvasHeight; y++) {
      const dy = py - y
      const yOffset = y * canvasWidth
      for (let x = 0; x < canvasWidth; x++) {
        const dx = px - x
        const distSq = dx * dx + dy * dy
        // 반경 밖이면 영향 없음
        if (radiusSq && distSq > radiusSq) {
          continue
        }

        // 거리 기반 가중치 계산
        let weight
        if (distance) {
          weight = weightLUT[Math.min(Math.floor(distSq), lutSize - 1)]
        } else {
          weight = 1 / Math.pow(distSq, exp)
        }

        // 해당 픽셀에 값과 가중치 누적
        const index = yOffset + x
        valueData[index] += value * weight
        weightData[index] += weight
      }
    }
  })

  // 색상 팔레트(gradient) 생성용 임시 캔버스
  const paletteCanvas = document.createElement('canvas')
  const paletteCtx = paletteCanvas.getContext('2d')
  paletteCanvas.width = 256
  paletteCanvas.height = 1

  // gradient 설정값을 기반으로 색상 팔레트 생성
  const gradientStyle = paletteCtx.createLinearGradient(0, 0, 255, 1)
  for (const key in heatmapConfig.gradient) {
    // 각 색상 스톱 추가
    gradientStyle.addColorStop(Number(key), heatmapConfig.gradient[key])
  }
  paletteCtx.fillStyle = gradientStyle
  paletteCtx.fillRect(0, 0, 256, 1)
  const palette = paletteCtx.getImageData(0, 0, 256, 1).data // RGBA 배열

  // 최종 픽셀별 색상 및 투명도 계산
  const imageData = heatmapCanvasCtx.createImageData(canvasWidth, canvasHeight)
  for (let i = 0; i < pixelData.length; i++) {
    // 누적값/가중치로 평균값 계산
    pixelData[i] = valueData[i] / (weightData[i] || 1)
    const alpha = pixelData[i] * 255 // 값에 따라 투명도 결정
    const idx = Math.floor(alpha) * 4 // 팔레트 색상 인덱스
    const j = i * 4 // RGBA 인덱스

    // 팔레트에서 색상 추출
    const [r, g, b] = [palette[idx], palette[idx + 1], palette[idx + 2]]
    // 투명도(min/max 범위 내로 제한)
    const minOpacityData = minOpacity * 255
    const maxOpacityData = maxOpacity * 255
    const resultOpacity = alpha < minOpacityData ? minOpacityData : alpha > maxOpacityData ? maxOpacityData : alpha

    // RGBA 값 할당
    imageData.data[j + 0] = r
    imageData.data[j + 1] = g
    imageData.data[j + 2] = b
    imageData.data[j + 3] = resultOpacity
  }

  // 캔버스에 이미지 데이터 출력
  heatmapCanvasCtx.putImageData(imageData, 0, 0)
}
