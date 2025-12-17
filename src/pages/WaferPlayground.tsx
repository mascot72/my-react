import React, { useState } from 'react'
import WaferFieldCDU_V6 from '../components/atoms/fieldmap/WaferFieldCDURealisticV6'
import WaferController from '../components/molecules/WaferController'
import type { SemPointRaw } from '../types/semPoint'
import { parseSemPoints } from '../types/semPoint'

/**
 * WaferPlayground - SEM 포인트 및 포인트 데이터 시스템
 * 
 * === Hierarchical Point Data Structure ===
 * 새로운 hierarchical 포인트 시스템:
 * 
 * Wafer > Field (gridX, gridY) > Die (col, row) > SemPoints
 * 
 * 1. usePointData: 기본 Die/Field 포인트 (CDU 기반)
 *    - usePointData({ fields }) -> PointDataSet
 *    - diePoints: [x, y, value, fieldIndex, dieIndex]
 *    - fieldPoints: [x, y, value, shotIndex, fieldGridX, fieldGridY]
 * 
 * 2. useSemPointData: Hierarchical SEM 포인트 (측정 데이터 기반)
 *    - useSemPointData({ semPoints, fieldStepX, fieldStepY, ... })
 *    - SemPointDataSet:
 *      - diePointsWithSem: Die 중심점 + 포함된 SEM 포인트들
 *      - fieldPointsWithSem: Field 중심점 + 포함된 SEM 포인트들 (Die별 그룹화)
 *      - allSemPointsMapped: 모든 매핑된 SEM 포인트 (참조용)
 * 
 * 3. Die 내부 종속 관계:
 *    - 각 SemPoint는 die 내부의 상대 좌표(dieLocalX, dieLocalY)를 포함
 *    - DiePointWithSemPoints.semPoints: 이 Die에 포함된 모든 SemPoint
 *    - FieldPointWithSemPoints.dieGroupedSemPoints: Field 내 Die별로 그룹화된 SemPoint
 * 
 * === 사용 예제 ===
 * 
 * // WaferFieldCDU_V6 내부에서 자동 제공:
 * const semPointDataSet = useSemPointData({
 *   semPoints,           // SemPoint[] 입력
 *   fieldStepX, fieldStepY,
 *   fieldWidth, fieldHeight,
 *   dieCols, dieRows
 * })
 * 
 * // 특정 Field의 SemPoint 접근:
 * const fieldData = semPointDataSet.fieldPointsWithSem.find(fp =>
 *   fp.fieldGridX === gridX && fp.fieldGridY === gridY
 * )
 * fieldData?.dieGroupedSemPoints.forEach(dieGroup => {
 *   console.log(`Die(${dieGroup.dieCol}, ${dieGroup.dieRow}):`, dieGroup.semPoints)
 * })
 * 
 * // 특정 Die의 SemPoint 접근:
 * const dieData = semPointDataSet.diePointsWithSem.find(dp =>
 *   dp.fieldGridX === gridX && dp.fieldGridY === gridY &&
 *   dp.dieCol === col && dp.dieRow === row
 * )
 * dieData?.semPoints.forEach(point => {
 *   console.log(`(${point.dieLocalX}, ${point.dieLocalY}): ${point.value}`)
 * })
 */
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
  // 형식: [indexX, indexY, x(절대좌표), y(절대좌표), value, siteSeq]
  // 
  // indexX, indexY:
  //   - Field Grid 인덱스 (FieldPoint.fieldGridX, fieldGridY와 동일)
  //   - 중앙 기준 상대 좌표 (예: -5 ~ 5)
  // 
  // x, y:
  //   - 노광장비에서 촬영한 실제 측정 좌표 (μm 단위)
  //   - 절대 좌표이며 전체 범위를 구해 Field 상대 좌표로 비율 변환
  // 
  // value:
  //   - 측정값 (예: CDU, 위치 오차 등)
  //   - 팔레트 색상 매핑에 사용
  // 
  // siteSeq:
  //   - 사이트 시퀀스 번호 (촬영 순서)
  const sampleSemPointData: SemPointRaw[] = [
    // [-5, 0, 536144, 124621, 1.43, 1],
    // [-5, 1, 536143, 124631, 1.46, 2],
    // [-4, -2, 536124, 124641, 1.49, 3],
    // [-4, 1, 536143, 124651, 1.52, 4],
    // [-2, 0, 536144, 124661, 1.55, 5],
    // [-2, 2, 536124, 124671, 1.58, 6],
    // [-1, 1, 536144, 124681, 1.61, 7],
    // [-1, 2, 536144, 114691, 1.64, 8],
    // [0, 0, 536144, 124701, 1.67, 9],
    // [1, 1, 536141, 122711, 1.70, 10],
    // [3, 2, 536146, 124728, 1.73, 11],
    // [3, 2, 536267, 124738, 1.13, 12],
    // [3, 2, 536317, 125775, 1.74, 13],
    [-5, 0, 536144, 124631, -0.47, 27],
    [-3, -2, 536144, 124631, -0.81, 29],
    [-3, 0, 536144, 124631, -0.97, 31],
    [-3, 2, 536144, 124631, -0.53, 33],
    [0, -4, 536144, 124631, -1.18, 35],
    [0, -2, 536144, 124631, -0.86, 37],
    [0, 0, 536144, 124631, -0.7, 39],
    [0, 2, 536144, 124631, 0.31, 41],
    [0, 3, 536144, 5461631, -0.19, 43],
    [2, -2, 536144, 124631, -0.25, 45],
    [2, 0, 536144, 124631, -0.2, 47],
    [2, 2, 536144, 124631, -0.17, 49],
    [4, 0, 536144, 124631, -0.17, 51],
  ]

  const [semPoints] = useState(() => parseSemPoints(sampleSemPointData))
  const [showSemPoints, setShowSemPoints] = useState(false)
  const [semPointRadiusPx, setSemPointRadiusPx] = useState(4)
  const [semPointOpacity, setSemPointOpacity] = useState(0.85)
  const [semPointColor, setSemPointColor] = useState('#ff6b35')
  const [useSemPointColorFromPalette, setUseSemPointColorFromPalette] = useState(false)
  const [applyFieldFillFromSemValue, setApplyFieldFillFromSemValue] = useState(false)
  const [applyDieFillFromSemValue, setApplyDieFillFromSemValue] = useState(false)

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
              useSemPointColorFromPalette={useSemPointColorFromPalette}
              applyFieldFillFromSemValue={applyFieldFillFromSemValue}
              applyDieFillFromSemValue={applyDieFillFromSemValue}
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
            useSemPointColorFromPalette={useSemPointColorFromPalette}
            onUseSemPointColorFromPaletteChange={setUseSemPointColorFromPalette}
            applyFieldFillFromSemValue={applyFieldFillFromSemValue}
            onApplyFieldFillFromSemValueChange={setApplyFieldFillFromSemValue}
            applyDieFillFromSemValue={applyDieFillFromSemValue}
            onApplyDieFillFromSemValueChange={setApplyDieFillFromSemValue}
          />
        </div>
      </div>
    </div>
  )
}

export default WaferPlayground
