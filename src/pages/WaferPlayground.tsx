import React, { useState } from 'react'
import WaferFieldCDU_V6 from '../components/atoms/fieldmap/WaferFieldCDURealisticV6'
import WaferController from '../components/molecules/WaferController'

const WaferPlayground: React.FC = () => {
  const [zoom, setZoom] = useState(1)
  const [showValues, setShowValues] = useState(true)
  const [seed] = useState<number>(20251110)

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f4f6fb',
    padding: 32,
    boxSizing: 'border-box',
    fontFamily: 'Inter, Roboto, system-ui, -apple-system, "Segoe UI", Arial',
  }

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
  }

  // wafer 컨테이너: zoom으로 컨텐츠가 커질 때 스크롤이 생기도록 고정 크기와 overflow auto 설정
  const waferContainerSize = 940
  const waferContainerStyle: React.CSSProperties = {
    width: waferContainerSize,
    height: waferContainerSize,
    overflow: 'auto',
    borderRadius: 12,
    background: '#fff',
    boxShadow: '0 10px 30px rgba(20,30,60,0.06)',
    padding: 12,
  }

  const waferInnerWrapStyle: React.CSSProperties = {
    width: 900,
    height: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 220ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms ease',
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div
          style={waferContainerStyle}
          >
          <div
            style={{
              ...waferInnerWrapStyle,
            }}>
            <WaferFieldCDU_V6 cduSeed={seed} zoom={zoom} showValues={showValues} />
          </div>
        </div>

        <div style={{ alignSelf: 'flex-start' }}>
          <WaferController
            zoom={zoom}
            onZoomChange={(z) => setZoom(z)}
            showValues={showValues}
            onShowValuesChange={(v) => setShowValues(v)}
          />
        </div>
      </div>
    </div>
  )
}

export default WaferPlayground
