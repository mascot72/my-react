import React, { useState } from 'react'
import WaferFieldCDU_V6 from '../components/atoms/fieldmap/WaferFieldCDURealisticV6'
import WaferController from '../components/molecules/WaferController'
import type { SemPointRaw } from '../types/semPoint'
import { parseSemPoints } from '../types/semPoint'

const WaferPlayground: React.FC = () => {
  const [zoom, setZoom] = useState(1)
  const [showValues, setShowValues] = useState(true)
  const [showFullGrid, setShowFullGrid] = useState(false)
  const [viewShotSequence, setViewShotSequence] = useState(false)
  const [viewDieSequence, setViewDieSequence] = useState(false)
  const [viewDieIndex, setViewDieIndex] = useState(false)
  const [viewPoint, setViewPoint] = useState(false)
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
  const [centerAxisCoordinates, setCenterAxisCoordinates] = useState(true)
  const [fitToContent, setFitToContent] = useState(true)
  const [outsidePointColor, setOutsidePointColor] = useState('#9aa3b2')
  const [outsideDiePointOpacity, setOutsideDiePointOpacity] = useState(0.35)
  const [outsideFieldPointOpacity, setOutsideFieldPointOpacity] = useState(0.25)
  const [showFieldFill, setShowFieldFill] = useState(false)
  const [fieldFillOpacity, setFieldFillOpacity] = useState(0.35)
  const [gridLineColor, setGridLineColor] = useState('#eeeeee')
  const [gridLineWidth, setGridLineWidth] = useState(1)
  const [showShotRuler, setShowShotRuler] = useState(false)
  const [showWaferRadius, setShowWaferRadius] = useState(false)
  const [shotRulerStepX, setShotRulerStepX] = useState(1)
  const [shotRulerStepY, setShotRulerStepY] = useState(1)
  const [waferTickStepMm, setWaferTickStepMm] = useState(50)

  // SEM 측정 포인트 샘플 데이터
  // [indexX, indexY, x(μm, left-bottom), y(μm, left-bottom), value, siteSeq]
  // Field 크기: 20mm x 30mm = 20000μm x 30000μm
  const sampleSemPointData: SemPointRaw[] = [
    // Field (-5, 0) - 좌측 중앙
    [-5, 0, 5000, 10000, 1.43, 1],   // left-bottom에서 5mm, 10mm
    [-5, 0, 15000, 20000, 1.46, 2],  // left-bottom에서 15mm, 20mm
    
    // Field (-4, -2) - 좌측 하단
    [-4, -2, 8000, 5000, 1.49, 3],
    [-4, -2, 12000, 15000, 1.52, 4],
    
    // Field (-2, 0) - 중앙 좌측
    [-2, 0, 10000, 12000, 1.55, 5],
    [-2, 0, 6000, 18000, 1.58, 6],
    
    // Field (-1, 1) - 중앙 위
    [-1, 1, 9000, 14000, 1.61, 7],
    [-1, 1, 11000, 16000, 1.64, 8],
    
    // Field (0, 0) - 중심
    [0, 0, 10000, 15000, 1.67, 9],
    [0, 0, 8000, 12000, 1.70, 10],
    
    // Field (1, 1) - 우측 위
    [1, 1, 7000, 11000, 1.73, 11],
    [1, 1, 13000, 19000, 1.76, 12],
    
    // Field (3, 2) - 우측 위
    [3, 2, 6000, 8000, 1.13, 13],
    [3, 2, 14000, 22000, 1.74, 14],
  ]

  const [semPoints] = useState(() => parseSemPoints(sampleSemPointData))
  const [showSemPoints, setShowSemPoints] = useState(false)
  const [semPointRadiusPx, setSemPointRadiusPx] = useState(4)
  const [semPointOpacity, setSemPointOpacity] = useState(0.85)
  const [semPointColor, setSemPointColor] = useState('#ff6b35')

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
            <WaferFieldCDU_V6 
              cduSeed={seed} 
              zoom={zoom} 
              showValues={showValues} 
              showFullGrid={showFullGrid} 
              viewShotSequence={viewShotSequence} 
              viewDieSequence={viewDieSequence} 
              viewDieIndex={viewDieIndex} 
              fieldArraySize={fieldArraySize} 
              offsetMicrometers={offsetMicrometers} 
              fieldSizeMicrometers={fieldSizeMicrometers}
              mergeOptions={{ enabled: false }} 
              enablePointData={true}
              viewPoint={viewPoint}
              diePointRadiusPx={diePointRadiusPx}
              fieldPointRadiusPx={fieldPointRadiusPx}
              diePointOpacity={diePointOpacity}
              fieldPointOpacity={fieldPointOpacity}
              showPointLabels={showPointLabels}
              showOutlinesInPointMode={showOutlinesInPointMode}
              fitToContent={fitToContent}
              outsidePointColor={outsidePointColor}
              outsideDiePointOpacity={outsideDiePointOpacity}
              outsideFieldPointOpacity={outsideFieldPointOpacity}
              showFieldFill={showFieldFill}
              fieldFillOpacity={fieldFillOpacity}
              showShotRuler={showShotRuler}
              showWaferRadius={showWaferRadius}
              shotRulerStepX={shotRulerStepX}
              shotRulerStepY={shotRulerStepY}
              centerAxisCoordinates={centerAxisCoordinates}
              waferTickStepMm={waferTickStepMm}
              gridLineColor={gridLineColor}
              gridLineWidth={gridLineWidth}
              semPoints={semPoints}
              showSemPoints={showSemPoints}
              semPointRadiusPx={semPointRadiusPx}
              semPointOpacity={semPointOpacity}
              semPointColor={semPointColor}
            />
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
            centerAxisCoordinates={centerAxisCoordinates}
            onCenterAxisCoordinatesChange={setCenterAxisCoordinates}
            fitToContent={fitToContent}
            onFitToContentChange={setFitToContent}
            gridLineColor={gridLineColor}
            onGridLineColorChange={setGridLineColor}
            gridLineWidth={gridLineWidth}
            onGridLineWidthChange={setGridLineWidth}
            showShotRuler={showShotRuler}
            onShowShotRulerChange={setShowShotRuler}
            showWaferRadius={showWaferRadius}
            onShowWaferRadiusChange={setShowWaferRadius}
            shotRulerStepX={shotRulerStepX}
            onShotRulerStepXChange={setShotRulerStepX}
            shotRulerStepY={shotRulerStepY}
            onShotRulerStepYChange={setShotRulerStepY}
            waferTickStepMm={waferTickStepMm}
            onWaferTickStepMmChange={setWaferTickStepMm}
            outsidePointColor={outsidePointColor}
            onOutsidePointColorChange={setOutsidePointColor}
            outsideDiePointOpacity={outsideDiePointOpacity}
            onOutsideDiePointOpacityChange={setOutsideDiePointOpacity}
            outsideFieldPointOpacity={outsideFieldPointOpacity}
            onOutsideFieldPointOpacityChange={setOutsideFieldPointOpacity}
            showFieldFill={showFieldFill}
            onShowFieldFillChange={setShowFieldFill}
            fieldFillOpacity={fieldFillOpacity}
            onFieldFillOpacityChange={setFieldFillOpacity}
            fieldArraySize={fieldArraySize}
            onFieldArraySizeChange={setFieldArraySize}
            offsetMicrometers={offsetMicrometers}
            onOffsetMicrometersChange={setOffsetMicrometers}
            fieldSizeMicrometers={fieldSizeMicrometers}
            onFieldSizeMicrometersChange={setFieldSizeMicrometers}
            showSemPoints={showSemPoints}
            onShowSemPointsChange={setShowSemPoints}
            semPointRadiusPx={semPointRadiusPx}
            onSemPointRadiusPxChange={setSemPointRadiusPx}
            semPointOpacity={semPointOpacity}
            onSemPointOpacityChange={setSemPointOpacity}
            semPointColor={semPointColor}
            onSemPointColorChange={setSemPointColor}
          />
        </div>
      </div>
    </div>
  )
}

export default WaferPlayground
