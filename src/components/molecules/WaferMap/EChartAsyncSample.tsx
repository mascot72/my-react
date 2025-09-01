import React, { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'

// store 예시 (실제 프로젝트에서는 redux/zustand 등 사용)
const useSampleStore = () => {
  // 실제로는 외부 store를 구독해야 함
  const [value, setValue] = useState(0)
  // 값이 바뀌는 시뮬레이션 (3초마다 변경)
  useEffect(() => {
    const timer = setInterval(() => setValue((v) => v + 1), 3000)
    return () => clearInterval(timer)
  }, [])
  return value
}

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
    <svg width='48' height='48' viewBox='0 0 48 48' fill='none'>
      <circle cx='24' cy='24' r='20' stroke='#1976d2' strokeWidth='4' opacity='0.2' />
      <path d='M44 24a20 20 0 0 1-20 20' stroke='#1976d2' strokeWidth='4' strokeLinecap='round'>
        <animateTransform
          attributeName='transform'
          type='rotate'
          from='0 24 24'
          to='360 24 24'
          dur='1s'
          repeatCount='indefinite'
        />
      </path>
    </svg>
  </div>
)

// 메인 샘플 컴포넌트
const EChartAsyncSample: React.FC = () => {
  const storeValue = useSampleStore() // 1. store 구독
  const [option, setOption] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    // 2. 시간이 오래 걸리는 비동기 작업 (예: fetch, 계산 등)
    ;(async () => {
      await new Promise((res) => setTimeout(res, 1500)) // 1.5초 대기 (비동기 작업 시뮬)
      if (cancelled) return
      // 3. option 생성 (storeValue 반영)
      setOption({
        title: { text: `Store Value: ${storeValue}` },
        xAxis: { type: 'category', data: ['A', 'B', 'C'] },
        yAxis: {},
        series: [{ type: 'bar', data: [storeValue, storeValue + 1, storeValue + 2] }],
      })
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [storeValue])

  return (
    <div>
      {loading && <LoadingSpinner />}
      {!loading && option && <ReactECharts option={option} style={{ width: 400, height: 400 }} />}
    </div>
  )
}

export default EChartAsyncSample
