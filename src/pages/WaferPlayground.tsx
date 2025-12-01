import React, { useState } from 'react'
import WaferFieldCDU_V6 from '../components/atoms/fieldmap/WaferFieldCDURealisticV6'
import WaferController from '../components/molecules/WaferController'

const WaferPlayground: React.FC = () => {
  const [zoom, setZoom] = useState(1)
  const [showValues, setShowValues] = useState(true)
  const [showFullGrid, setShowFullGrid] = useState(false)
  const [viewShotSequence, setViewShotSequence] = useState(false)
  const [viewDieSequence, setViewDieSequence] = useState(false)
  const [viewDieIndex, setViewDieIndex] = useState(false)
  const [fieldArraySize, setFieldArraySize] = useState<[number, number]>([10, 10])
  const [offsetMicrometers, setOffsetMicrometers] = useState<[number, number]>([0, 0])
  const [fieldSizeMicrometers, setFieldSizeMicrometers] = useState<[number, number]>([20000, 30000])
  const [seed] = useState<number>(20251110)
  const [isZoomDragging, setIsZoomDragging] = useState(false)

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
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

  // wafer 컨테이너: 스크롤 없이 모든 내용이 보이도록 설정
  const waferContainerStyle: React.CSSProperties = {
    flex: 1,
    minHeight: 'calc(100vh - 64px)',
    overflow: 'auto',
    borderRadius: 12,
    background: '#fff',
    boxShadow: '0 10px 30px rgba(20,30,60,0.06)',
    padding: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const waferInnerWrapStyleBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    willChange: 'transform',
    transformOrigin: 'center center',
  }

  const wrapperStyle: React.CSSProperties = {
    ...waferInnerWrapStyleBase,
    pointerEvents: isZoomDragging ? 'none' : undefined,
    transition: isZoomDragging
      ? 'transform 0ms'
      : 'transform 360ms cubic-bezier(.22,1,.36,1), box-shadow 160ms ease',
    transform: `scale(${zoom})`,
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div
          style={waferContainerStyle}
          >
          <div
            style={wrapperStyle}>
            <WaferFieldCDU_V6 cduSeed={seed} zoom={zoom} showValues={showValues} showFullGrid={showFullGrid} viewShotSequence={viewShotSequence} viewDieSequence={viewDieSequence} viewDieIndex={viewDieIndex} fieldArraySize={fieldArraySize} offsetMicrometers={offsetMicrometers} fieldSizeMicrometers={fieldSizeMicrometers} />
          </div>
        </div>

        <div style={{ alignSelf: 'flex-start' }}>
          <WaferController
            zoom={zoom}
            onZoomChange={(z) => setZoom(z)}
            onZoomDragStart={() => setIsZoomDragging(true)}
            onZoomDragEnd={() => setIsZoomDragging(false)}
            showValues={showValues}
            onShowValuesChange={(v) => setShowValues(v)}
            showFullGrid={showFullGrid}
            onShowFullGridChange={(v) => setShowFullGrid(v)}
            viewShotSequence={viewShotSequence}
            onViewShotSequenceChange={(v) => setViewShotSequence(v)}
            viewDieSequence={viewDieSequence}
            onViewDieSequenceChange={(v) => setViewDieSequence(v)}
            viewDieIndex={viewDieIndex}
            onViewDieIndexChange={(v) => setViewDieIndex(v)}
            fieldArraySize={fieldArraySize}
            onFieldArraySizeChange={setFieldArraySize}
            offsetMicrometers={offsetMicrometers}
            onOffsetMicrometersChange={setOffsetMicrometers}
            fieldSizeMicrometers={fieldSizeMicrometers}
            onFieldSizeMicrometersChange={setFieldSizeMicrometers}
          />
        </div>
      </div>
    </div>
  )
}

export default WaferPlayground
