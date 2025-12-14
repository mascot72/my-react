import React, { useState } from 'react'
import WaferFieldCDU_V6ECharts from '../components/atoms/fieldmap/WaferFieldCDU_V6ECharts'
import WaferController from '../components/molecules/WaferController'
import type { SemPointRaw } from '../types/semPoint'
import { parseSemPoints } from '../types/semPoint'

const WaferEChartsPlayground: React.FC = () => {
  const [zoom, setZoom] = useState(1)
  const [showFullGrid, setShowFullGrid] = useState(false)
  const [viewShotSequence, setViewShotSequence] = useState(false)
  const [viewDieSequence, setViewDieSequence] = useState(false)
  const [viewDieIndex, setViewDieIndex] = useState(false)
  const [showValues, setShowValues] = useState(false)
  const [viewPoint, setViewPoint] = useState(true)
  const [diePointRadiusPx, setDiePointRadiusPx] = useState<number>(2)
  const [fieldPointRadiusPx, setFieldPointRadiusPx] = useState<number>(3)
  const [diePointOpacity, setDiePointOpacity] = useState<number>(0.9)
  const [fieldPointOpacity, setFieldPointOpacity] = useState<number>(0.5)
  const [showPointLabels, setShowPointLabels] = useState(false)
  const [showOutlinesInPointMode, setShowOutlinesInPointMode] = useState(true)
  const [centerAxisCoordinates, setCenterAxisCoordinates] = useState(true)
  const [gridLineColor, setGridLineColor] = useState('#eeeeee')
  const [gridLineWidth, setGridLineWidth] = useState(1)
  const [fitToContent, setFitToContent] = useState(true)
  const [outsidePointColor, setOutsidePointColor] = useState('#9aa3b2')
  const [outsideDiePointOpacity, setOutsideDiePointOpacity] = useState(0.35)
  const [outsideFieldPointOpacity, setOutsideFieldPointOpacity] = useState(0.25)
  const [showFieldFill, setShowFieldFill] = useState(false)
  const [fieldFillOpacity, setFieldFillOpacity] = useState(0.35)
  const [fieldArraySize, setFieldArraySize] = useState<[number, number]>([10, 10])
  const [offsetMicrometers, setOffsetMicrometers] = useState<[number, number]>([0, 0])
  const [fieldSizeMicrometers, setFieldSizeMicrometers] = useState<[number, number]>([20000, 30000])
  const [showShotRuler, setShowShotRuler] = useState(false)
  const [showWaferRadius, setShowWaferRadius] = useState(false)
  const [shotRulerStepX, setShotRulerStepX] = useState(1)
  const [shotRulerStepY, setShotRulerStepY] = useState(1)
  const [seed] = useState<number>(20251110)
  const [isZoomDragging, setIsZoomDragging] = useState(false)
  // SEM point sample (equipment absolute coordinates)
  const sampleSemPointData: SemPointRaw[] = [
    [-5, 0, 536144, 124621, 1.43, 1],
    [-5, 1, 536143, 124631, 1.46, 2],
    [-4, -2, 536124, 124641, 1.49, 3],
    [-4, 1, 536143, 124651, 1.52, 4],
    [-2, 0, 536144, 124661, 1.55, 5],
    [-2, 2, 536124, 124671, 1.58, 6],
    [-1, 1, 536144, 124681, 1.61, 7],
    [-1, 2, 536144, 114691, 1.64, 8],
    [0, 0, 536144, 124701, 1.67, 9],
    [1, 1, 536141, 122711, 1.70, 10],
    [3, 2, 536146, 124728, 1.73, 11],
    [3, 2, 536267, 124738, 1.13, 12],
    [3, 2, 536317, 125775, 1.74, 13],
  ]
  const [semPoints] = useState(() => parseSemPoints(sampleSemPointData))
  const [showSemPoints, setShowSemPoints] = useState(false)
  const [semPointRadiusPx, setSemPointRadiusPx] = useState(4)
  const [semPointOpacity, setSemPointOpacity] = useState(0.85)
  const [semPointColor, setSemPointColor] = useState('#ff6b35')
  const [useSemPointColorFromPalette, setUseSemPointColorFromPalette] = useState(false)

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
              showValues={showValues}
              viewShotSequence={viewShotSequence}
              viewDieSequence={viewDieSequence}
              viewDieIndex={viewDieIndex}
              viewPoint={viewPoint}
              diePointRadiusPx={diePointRadiusPx}
              fieldPointRadiusPx={fieldPointRadiusPx}
              diePointOpacity={diePointOpacity}
              fieldPointOpacity={fieldPointOpacity}
              showPointLabels={showPointLabels}
              showOutlinesInPointMode={showOutlinesInPointMode}
              centerAxisCoordinates={centerAxisCoordinates}
              gridLineColor={gridLineColor}
              gridLineWidth={gridLineWidth}
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
              // SEM
              semPoints={semPoints}
              showSemPoints={showSemPoints}
              semPointRadiusPx={semPointRadiusPx}
              semPointOpacity={semPointOpacity}
              semPointColor={semPointColor}
              useSemPointColorFromPalette={useSemPointColorFromPalette}
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
            onShowValuesChange={setShowValues}
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
            gridLineColor={gridLineColor}
            onGridLineColorChange={setGridLineColor}
            gridLineWidth={gridLineWidth}
            onGridLineWidthChange={setGridLineWidth}
            fitToContent={fitToContent}
            onFitToContentChange={setFitToContent}
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
            showShotRuler={showShotRuler}
            onShowShotRulerChange={setShowShotRuler}
            showWaferRadius={showWaferRadius}
            onShowWaferRadiusChange={setShowWaferRadius}
            shotRulerStepX={shotRulerStepX}
            onShotRulerStepXChange={setShotRulerStepX}
            shotRulerStepY={shotRulerStepY}
            onShotRulerStepYChange={setShotRulerStepY}
            // SEM Controller
            showSemPoints={showSemPoints}
            onShowSemPointsChange={setShowSemPoints}
            semPointRadiusPx={semPointRadiusPx}
            onSemPointRadiusPxChange={setSemPointRadiusPx}
            semPointOpacity={semPointOpacity}
            onSemPointOpacityChange={setSemPointOpacity}
            semPointColor={semPointColor}
            onSemPointColorChange={setSemPointColor}
            useSemPointColorFromPalette={useSemPointColorFromPalette}
            onUseSemPointColorFromPaletteChange={setUseSemPointColorFromPalette}
          />
        </div>
      </div>
    </div>
  )
}

export default WaferEChartsPlayground
