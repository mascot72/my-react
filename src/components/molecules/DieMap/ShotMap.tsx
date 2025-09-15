// App.tsx
import React from 'react'
import WaferShotmap, { WaferPoint, WaferSpec } from './WaferShotmap'

const rawPoints: WaferPoint[] = [
  { chipIndexX: -5, chipIndexY: 0, chipX: 5361440, chipY: 1246310, siteSeq: 1, value: 0.04, name: '999_BLC' },
  { chipIndexX: -4, chipIndexY: 0, chipX: 2000000, chipY: 1000000, siteSeq: 2, value: 0.12, name: '1000_BLC' },
  { chipIndexX: -3, chipIndexY: 1, chipX: 1000000, chipY: 1500000, siteSeq: 3, value: 0.2, name: '1001_BLC' },
  { chipIndexX: -2, chipIndexY: 1, chipX: 1200000, chipY: 2000000, siteSeq: 4, value: 0.15, name: '1002_BLC' },
  { chipIndexX: -1, chipIndexY: 2, chipX: 500000, chipY: 1800000, siteSeq: 5, value: 0.3, name: '1003_BLC' },
]

const waferSpec: WaferSpec = {
  waferSize: 300,
  chipArraySizeX: 13,
  chipArraySizeY: 11,
  centerX: 7,
  centerY: 5,
  chipSizeX: 25581000,
  chipSizeY: 32022000,
  offsetX: 12790500,
  offsetY: 1429000,
}

export default function App() {
  return (
    <div>
      <WaferShotmap points={rawPoints} waferSpec={waferSpec} mode='mask' width={800} height={800} />
    </div>
  )
}
