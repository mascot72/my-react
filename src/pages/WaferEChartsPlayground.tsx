import React, { useState } from 'react'
import WaferFieldCDU_V6ECharts from '../components/atoms/fieldmap/WaferFieldCDU_V6ECharts'
import WaferController from '../components/molecules/WaferController'

const WaferEChartsPlayground: React.FC = () => {
  const [zoom, setZoom] = useState(1)
  const [showFullGrid, setShowFullGrid] = useState(false)
  const [viewShotSequence, setViewShotSequence] = useState(false)
  const [viewDieSequence, setViewDieSequence] = useState(false)
  const [viewDieIndex, setViewDieIndex] = useState(false)
  const [viewPoint, setViewPoint] = useState(true)
  const [diePointRadiusPx, setDiePointRadiusPx] = useState<number>(2)
  const [fieldPointRadiusPx, setFieldPointRadiusPx] = useState<number>(3)
  const [diePointOpacity, setDiePointOpacity] = useState<number>(0.9)
  const [fieldPointOpacity, setFieldPointOpacity] = useState<number>(0.5)
  const [showPointLabels, setShowPointLabels] = useState(false)
  const [showOutlinesInPointMode, setShowOutlinesInPointMode] = useState(true)
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

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    willChange: 'transform',
    transformOrigin: 'center center',
    pointerEvents: isZoomDragging ? 'none' : undefined,
    transition: isZoomDragging ? 'transform 0ms' : 'transform 360ms cubic-bezier(.22,1,.36,1), box-shadow 160ms ease',
    transform: `scale(${zoom})`,
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={waferContainerStyle}>
          <div style={wrapperStyle}>
            <WaferFieldCDU_V6ECharts
              cduSeed={seed}
              showFullGrid={showFullGrid}
              fieldArraySize={fieldArraySize}
              offsetMicrometers={offsetMicrometers}
              fieldSizeMicrometers={fieldSizeMicrometers}
              viewPoint={viewPoint}
              diePointRadiusPx={diePointRadiusPx}
              fieldPointRadiusPx={fieldPointRadiusPx}
              diePointOpacity={diePointOpacity}
              fieldPointOpacity={fieldPointOpacity}
              showPointLabels={showPointLabels}
            />
          </div>
        </div>

        <div style={{ alignSelf: 'flex-start' }}>
          <WaferController
            zoom={zoom}
            onZoomChange={(z) => setZoom(z)}
            onZoomDragStart={() => setIsZoomDragging(true)}
            onZoomDragEnd={() => setIsZoomDragging(false)}
            showValues={false}
            onShowValuesChange={() => {}}
            showFullGrid={showFullGrid}
            onShowFullGridChange={(v) => setShowFullGrid(v)}
            viewShotSequence={viewShotSequence}
            onViewShotSequenceChange={(v) => setViewShotSequence(v)}
            viewDieSequence={viewDieSequence}
            onViewDieSequenceChange={(v) => setViewDieSequence(v)}
            viewDieIndex={viewDieIndex}
            onViewDieIndexChange={(v) => setViewDieIndex(v)}
            viewPoint={viewPoint}
            onViewPointChange={(v) => setViewPoint(v)}
            diePointRadiusPx={diePointRadiusPx}
            onDiePointRadiusPxChange={setDiePointRadiusPx}
            fieldPointRadiusPx={fieldPointRadiusPx}
            onFieldPointRadiusPxChange={setFieldPointRadiusPx}
            diePointOpacity={diePointOpacity}
            onDiePointOpacityChange={setDiePointOpacity}
            fieldPointOpacity={fieldPointOpacity}
            onFieldPointOpacityChange={setFieldPointOpacity}
            showPointLabels={showPointLabels}
            onShowPointLabelsChange={setShowPointLabels}
            showOutlinesInPointMode={showOutlinesInPointMode}
            onShowOutlinesInPointModeChange={setShowOutlinesInPointMode}
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

export default WaferEChartsPlayground
