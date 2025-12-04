import React from 'react'
import styles from './WaferController.module.css'

interface WaferControllerProps {
  zoom: number
  onZoomChange: (z: number) => void
  onZoomDragStart?: () => void
  onZoomDragEnd?: () => void
  showValues: boolean
  onShowValuesChange: (v: boolean) => void
  // Wafer display controls
  showFullGrid?: boolean
  onShowFullGridChange?: (v: boolean) => void
  viewShotSequence?: boolean
  onViewShotSequenceChange?: (v: boolean) => void
  viewDieSequence?: boolean
  onViewDieSequenceChange?: (v: boolean) => void
  viewDieIndex?: boolean
  onViewDieIndexChange?: (v: boolean) => void
  viewPoint?: boolean
  onViewPointChange?: (v: boolean) => void
  // Point rendering controls
  diePointRadiusPx?: number
  onDiePointRadiusPxChange?: (v: number) => void
  fieldPointRadiusPx?: number
  onFieldPointRadiusPxChange?: (v: number) => void
  diePointOpacity?: number
  onDiePointOpacityChange?: (v: number) => void
  fieldPointOpacity?: number
  onFieldPointOpacityChange?: (v: number) => void
  showPointLabels?: boolean
  onShowPointLabelsChange?: (v: boolean) => void
  showOutlinesInPointMode?: boolean
  onShowOutlinesInPointModeChange?: (v: boolean) => void
  // Axis & Grid styling (ECharts 전용 확장)
  gridLineColor?: string
  onGridLineColorChange?: (v: string) => void
  gridLineWidth?: number
  onGridLineWidthChange?: (v: number) => void
  centerAxisCoordinates?: boolean
  onCenterAxisCoordinatesChange?: (v: boolean) => void
  fitToContent?: boolean
  onFitToContentChange?: (v: boolean) => void
  // Outside point & field fill (공통)
  outsidePointColor?: string
  onOutsidePointColorChange?: (v: string) => void
  outsideDiePointOpacity?: number
  onOutsideDiePointOpacityChange?: (v: number) => void
  outsideFieldPointOpacity?: number
  onOutsideFieldPointOpacityChange?: (v: number) => void
  showFieldFill?: boolean
  onShowFieldFillChange?: (v: boolean) => void
  fieldFillOpacity?: number
  onFieldFillOpacityChange?: (v: number) => void
  // Field array size and offset controls
  fieldArraySize?: [number, number]
  onFieldArraySizeChange?: (size: [number, number]) => void
  offsetMicrometers?: [number, number]
  onOffsetMicrometersChange?: (offset: [number, number]) => void
  // Field size controls
  fieldSizeMicrometers?: [number, number]
  onFieldSizeMicrometersChange?: (size: [number, number]) => void
  // Rulers & overlays
  showShotRuler?: boolean
  onShowShotRulerChange?: (v: boolean) => void
  showWaferRadius?: boolean
  onShowWaferRadiusChange?: (v: boolean) => void
  shotRulerStepX?: number
  onShotRulerStepXChange?: (v: number) => void
  shotRulerStepY?: number
  onShotRulerStepYChange?: (v: number) => void
  waferTickStepMm?: number
  onWaferTickStepMmChange?: (v: number) => void
  // SEM Point controls
  showSemPoints?: boolean
  onShowSemPointsChange?: (v: boolean) => void
  semPointRadiusPx?: number
  onSemPointRadiusPxChange?: (v: number) => void
  semPointOpacity?: number
  onSemPointOpacityChange?: (v: number) => void
  semPointColor?: string
  onSemPointColorChange?: (v: string) => void
  useSemPointColorFromPalette?: boolean
  onUseSemPointColorFromPaletteChange?: (v: boolean) => void
  applyFieldFillFromSemValue?: boolean
  onApplyFieldFillFromSemValueChange?: (v: boolean) => void
  applyDieFillFromSemValue?: boolean
  onApplyDieFillFromSemValueChange?: (v: boolean) => void
}

const WaferController: React.FC<WaferControllerProps> = ({
  zoom,
  onZoomChange,
  onZoomDragStart,
  onZoomDragEnd,
  showValues,
  onShowValuesChange,
  showFullGrid = false,
  onShowFullGridChange,
  viewShotSequence = false,
  onViewShotSequenceChange,
  viewDieSequence = false,
  onViewDieSequenceChange,
  viewDieIndex = false,
  onViewDieIndexChange,
  viewPoint = false,
  onViewPointChange,
  diePointRadiusPx = 2,
  onDiePointRadiusPxChange,
  fieldPointRadiusPx = 3,
  onFieldPointRadiusPxChange,
  diePointOpacity = 0.9,
  onDiePointOpacityChange,
  fieldPointOpacity = 0.5,
  onFieldPointOpacityChange,
  fieldArraySize = [10, 10],
  onFieldArraySizeChange,
  offsetMicrometers = [0, 0],
  onOffsetMicrometersChange,
  fieldSizeMicrometers = [20000, 30000],
  onFieldSizeMicrometersChange,
  showPointLabels = false,
  onShowPointLabelsChange,
  showOutlinesInPointMode = true,
  showShotRuler = false,
  onShowShotRulerChange,
  showWaferRadius = false,
  onShowWaferRadiusChange,
  shotRulerStepX = 1,
  onShotRulerStepXChange,
  shotRulerStepY = 1,
  onShotRulerStepYChange,
  waferTickStepMm = 50,
  onWaferTickStepMmChange,
  onShowOutlinesInPointModeChange,
  gridLineColor = '#eeeeee',
  onGridLineColorChange,
  gridLineWidth = 1,
  onGridLineWidthChange,
  centerAxisCoordinates = true,
  onCenterAxisCoordinatesChange,
  fitToContent = true,
  onFitToContentChange,
  outsidePointColor = '#9aa3b2',
  onOutsidePointColorChange,
  outsideDiePointOpacity = 0.35,
  onOutsideDiePointOpacityChange,
  outsideFieldPointOpacity = 0.25,
  onOutsideFieldPointOpacityChange,
  showFieldFill = false,
  onShowFieldFillChange,
  fieldFillOpacity = 0.35,
  onFieldFillOpacityChange,
  // SEM Point props
  showSemPoints = false,
  onShowSemPointsChange,
  semPointRadiusPx = 4,
  onSemPointRadiusPxChange,
  semPointOpacity = 0.85,
  onSemPointOpacityChange,
  semPointColor = '#ff6b35',
  onSemPointColorChange,
  useSemPointColorFromPalette = false,
  onUseSemPointColorFromPaletteChange,
  applyFieldFillFromSemValue = false,
  onApplyFieldFillFromSemValueChange,
  applyDieFillFromSemValue = false,
  onApplyDieFillFromSemValueChange,
}) => {

  return (
    <div
      className={styles.panel}
      role='region'
      aria-label='Wafer controller panel'>
      <div className={styles.inner}>
        <div className={styles.title}>
          <span>Wafer Controller</span>
        </div>

        <label className={styles.label}>Zoom</label>
        <div className={styles.rangeWrapper}>
          <input
            type='range'
            min={0.2}
            max={2}
            step={0.01}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            onInput={(e: React.FormEvent<HTMLInputElement>) => onZoomChange(Number((e.currentTarget as HTMLInputElement).value))}
            onPointerDown={() => onZoomDragStart && onZoomDragStart()}
            onPointerUp={() => onZoomDragEnd && onZoomDragEnd()}
            onPointerCancel={() => onZoomDragEnd && onZoomDragEnd()}
            style={{ width: '100%' }}
          />
          <div className={styles.rangeScale}>
            <span>0.2x</span>
            <span>{zoom.toFixed(2)}x</span>
            <span>2x</span>
          </div>
        </div>

        <div className={styles.toggleRow}>
          <input id='view-value' type='checkbox' checked={showValues} onChange={(e) => onShowValuesChange(e.target.checked)} />
          <label htmlFor='view-value' className={styles.caption}>
            View Value
          </label>
        </div>

        <div className={styles.toggleRow}>
          <input id='show-full-grid' type='checkbox' checked={showFullGrid} onChange={(e) => onShowFullGridChange && onShowFullGridChange(e.target.checked)} />
          <label htmlFor='show-full-grid' className={styles.caption}>
            전체 사각형 표시
          </label>
        </div>

        <div className={styles.toggleRow}>
          <input id='view-shot-seq' type='checkbox' checked={viewShotSequence} onChange={(e) => onViewShotSequenceChange && onViewShotSequenceChange(e.target.checked)} />
          <label htmlFor='view-shot-seq' className={styles.caption}>
            view shot sequence
          </label>
        </div>

        <div className={styles.toggleRow}>
          <input id='view-die-seq' type='checkbox' checked={viewDieSequence} onChange={(e) => onViewDieSequenceChange && onViewDieSequenceChange(e.target.checked)} />
          <label htmlFor='view-die-seq' className={styles.caption}>
            view die sequence
          </label>
        </div>

        <div className={styles.toggleRow}>
          <input id='view-die-index' type='checkbox' checked={viewDieIndex} onChange={(e) => onViewDieIndexChange && onViewDieIndexChange(e.target.checked)} />
          <label htmlFor='view-die-index' className={styles.caption}>
            view die index
          </label>
        </div>

        <div className={styles.toggleRow}>
          <input id='view-point' type='checkbox' checked={viewPoint} onChange={(e) => onViewPointChange && onViewPointChange(e.target.checked)} />
          <label htmlFor='view-point' className={styles.caption}>
            View Point
          </label>
        </div>

        {viewPoint && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e0e0e0' }}>
            <label className={styles.label}>Point Size / Opacity</label>

            <div className={styles.rangeRow} style={{ marginTop: 6 }}>
              <div className={styles.caption} style={{ width: 120 }}>Die Radius (px)</div>
              <input
                type='range'
                min={1}
                max={8}
                step={1}
                value={diePointRadiusPx}
                onChange={(e) => onDiePointRadiusPxChange && onDiePointRadiusPxChange(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <div style={{ width: 40, textAlign: 'right' }}>{diePointRadiusPx}</div>
            </div>

            <div className={styles.rangeRow} style={{ marginTop: 6 }}>
              <div className={styles.caption} style={{ width: 120 }}>Field Radius (px)</div>
              <input
                type='range'
                min={1}
                max={10}
                step={1}
                value={fieldPointRadiusPx}
                onChange={(e) => onFieldPointRadiusPxChange && onFieldPointRadiusPxChange(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <div style={{ width: 40, textAlign: 'right' }}>{fieldPointRadiusPx}</div>
            </div>

            <div className={styles.rangeRow} style={{ marginTop: 6 }}>
              <div className={styles.caption} style={{ width: 120 }}>Die Opacity</div>
              <input
                type='range'
                min={0.1}
                max={1}
                step={0.05}
                value={diePointOpacity}
                onChange={(e) => onDiePointOpacityChange && onDiePointOpacityChange(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <div style={{ width: 40, textAlign: 'right' }}>{diePointOpacity.toFixed(2)}</div>
            </div>

            <div className={styles.rangeRow} style={{ marginTop: 6 }}>
              <div className={styles.caption} style={{ width: 120 }}>Field Opacity</div>
              <input
                type='range'
                min={0.1}
                max={1}
                step={0.05}
                value={fieldPointOpacity}
                onChange={(e) => onFieldPointOpacityChange && onFieldPointOpacityChange(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <div style={{ width: 40, textAlign: 'right' }}>{fieldPointOpacity.toFixed(2)}</div>
            </div>

            <div className={styles.toggleRow} style={{ marginTop: 8 }}>
              <input id='point-labels' type='checkbox' checked={showPointLabels} onChange={(e) => onShowPointLabelsChange && onShowPointLabelsChange(e.target.checked)} />
              <label htmlFor='point-labels' className={styles.caption}>Show point labels</label>
            </div>

            <div className={styles.toggleRow}>
              <input id='point-outlines' type='checkbox' checked={showOutlinesInPointMode} onChange={(e) => onShowOutlinesInPointModeChange && onShowOutlinesInPointModeChange(e.target.checked)} />
              <label htmlFor='point-outlines' className={styles.caption}>Show outlines</label>
            </div>

            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #e0e0e0' }}>
              <label className={styles.label}>Outside Points</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className={styles.caption} style={{ width: 110 }}>Color</div>
                <input type='color' value={outsidePointColor}
                  onChange={(e) => onOutsidePointColorChange && onOutsidePointColorChange(e.target.value)}
                  style={{ width: 48, height: 28, padding: 0, border: '1px solid #ccc', borderRadius: 4 }}/>
                <input type='text' value={outsidePointColor}
                  onChange={(e) => onOutsidePointColorChange && onOutsidePointColorChange(e.target.value)}
                  style={{ flex: 1, padding: '4px 6px', borderRadius: 4, border: '1px solid #ccc', fontFamily: 'monospace' }}/>
              </div>
              <div className={styles.rangeRow} style={{ marginTop: 6 }}>
                <div className={styles.caption} style={{ width: 110 }}>Die Opacity</div>
                <input type='range' min={0} max={1} step={0.05} value={outsideDiePointOpacity}
                  onChange={(e) => onOutsideDiePointOpacityChange && onOutsideDiePointOpacityChange(Number(e.target.value))}
                  style={{ flex: 1 }}/>
                <div style={{ width: 40, textAlign: 'right' }}>{outsideDiePointOpacity.toFixed(2)}</div>
              </div>
              <div className={styles.rangeRow} style={{ marginTop: 6 }}>
                <div className={styles.caption} style={{ width: 110 }}>Field Opacity</div>
                <input type='range' min={0} max={1} step={0.05} value={outsideFieldPointOpacity}
                  onChange={(e) => onOutsideFieldPointOpacityChange && onOutsideFieldPointOpacityChange(Number(e.target.value))}
                  style={{ flex: 1 }}/>
                <div style={{ width: 40, textAlign: 'right' }}>{outsideFieldPointOpacity.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #e0e0e0' }}>
          <label className={styles.label}>Field Array Size</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type='number'
              min={1}
              max={999}
              value={fieldArraySize[0]}
              onChange={(e) => {
                const inputVal = e.target.value
                console.log('Field Array Size X changed:', inputVal)
                if (inputVal === '' || inputVal === '-') return
                const val = Math.min(999, Math.max(1, parseInt(inputVal, 10)))
                if (onFieldArraySizeChange && !isNaN(val)) {
                  console.log('Field Array Size X updated to:', val)
                  onFieldArraySizeChange([val, fieldArraySize[1]])
                }
              }}
              style={{ width: '50px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder='X'
            />
            <span style={{ padding: '0 4px' }}>×</span>
            <input
              type='number'
              min={1}
              max={999}
              value={fieldArraySize[1]}
              onChange={(e) => {
                const inputVal = e.target.value
                console.log('Field Array Size Y changed:', inputVal)
                if (inputVal === '' || inputVal === '-') return
                const val = Math.min(999, Math.max(1, parseInt(inputVal, 10)))
                if (onFieldArraySizeChange && !isNaN(val)) {
                  console.log('Field Array Size Y updated to:', val)
                  onFieldArraySizeChange([fieldArraySize[0], val])
                }
              }}
              style={{ width: '50px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder='Y'
            />
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #e0e0e0' }}>
          <label className={styles.label}>Axis & Grid</label>
          <div className={styles.toggleRow} style={{ marginTop: 4 }}>
            <input id='center-axis' type='checkbox' checked={centerAxisCoordinates} onChange={(e) => onCenterAxisCoordinatesChange && onCenterAxisCoordinatesChange(e.target.checked)} />
            <label htmlFor='center-axis' className={styles.caption}>Center axis coordinates</label>
          </div>
          <div className={styles.toggleRow}>
            <input id='fit-content' type='checkbox' checked={fitToContent} onChange={(e) => onFitToContentChange && onFitToContentChange(e.target.checked)} />
            <label htmlFor='fit-content' className={styles.caption}>Fit axes to content</label>
          </div>
          <div className={styles.toggleRow}>
            <input id='show-shot-ruler' type='checkbox' checked={showShotRuler} onChange={(e) => onShowShotRulerChange && onShowShotRulerChange(e.target.checked)} />
            <label htmlFor='show-shot-ruler' className={styles.caption}>Shot Ruler (gx/gy)</label>
          </div>
          {showShotRuler && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <div className={styles.caption} style={{ width: 110 }}>Ruler Step X</div>
              <input
                type='number'
                min={1}
                step={1}
                value={shotRulerStepX}
                onChange={(e) => {
                  const v = Math.max(1, Math.floor(Number(e.target.value) || 1))
                  if (onShotRulerStepXChange) onShotRulerStepXChange(v)
                }}
                style={{ width: 70, padding: '4px 6px', borderRadius: 4, border: '1px solid #ccc' }}
              />
              <div className={styles.caption} style={{ width: 110 }}>Ruler Step Y</div>
              <input
                type='number'
                min={1}
                step={1}
                value={shotRulerStepY}
                onChange={(e) => {
                  const v = Math.max(1, Math.floor(Number(e.target.value) || 1))
                  if (onShotRulerStepYChange) onShotRulerStepYChange(v)
                }}
                style={{ width: 70, padding: '4px 6px', borderRadius: 4, border: '1px solid #ccc' }}
              />
            </div>
          )}
          <div className={styles.toggleRow}>
            <input id='show-wafer-radius' type='checkbox' checked={showWaferRadius} onChange={(e) => onShowWaferRadiusChange && onShowWaferRadiusChange(e.target.checked)} />
            <label htmlFor='show-wafer-radius' className={styles.caption}>Wafer Radius overlay</label>
          </div>
          {/* mm tick step for SVG when Shot Ruler is OFF */}
          <div className={styles.rangeRow} style={{ marginTop: 6 }}>
            <div className={styles.caption} style={{ width: 110 }}>mm Tick Step</div>
            <input
              type='number'
              min={1}
              step={1}
              value={waferTickStepMm}
              onChange={(e) => {
                const v = Math.max(1, Math.floor(Number(e.target.value) || 1))
                if (onWaferTickStepMmChange) onWaferTickStepMmChange(v)
              }}
              style={{ width: 80, padding: '4px 6px', borderRadius: 4, border: '1px solid #ccc' }}
            />
            <span style={{ marginLeft: 6, color: '#999' }}>mm</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <div className={styles.caption} style={{ width: 110 }}>Grid Color</div>
            <input
              type='color'
              value={gridLineColor}
              onChange={(e) => onGridLineColorChange && onGridLineColorChange(e.target.value)}
              style={{ width: 48, height: 28, padding: 0, border: '1px solid #ccc', borderRadius: 4 }}
            />
            <input
              type='text'
              value={gridLineColor}
              onChange={(e) => onGridLineColorChange && onGridLineColorChange(e.target.value)}
              style={{ flex: 1, padding: '4px 6px', borderRadius: 4, border: '1px solid #ccc', fontFamily: 'monospace' }}
            />
          </div>
          <div className={styles.rangeRow} style={{ marginTop: 8 }}>
            <div className={styles.caption} style={{ width: 110 }}>Grid Thickness</div>
            <input
              type='range'
              min={0.5}
              max={3}
              step={0.5}
              value={gridLineWidth}
              onChange={(e) => onGridLineWidthChange && onGridLineWidthChange(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <div style={{ width: 40, textAlign: 'right' }}>{gridLineWidth.toFixed(1)}</div>
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #e0e0e0' }}>
          <label className={styles.label}>Field Fill</label>
          <div className={styles.toggleRow}>
            <input id='field-fill' type='checkbox' checked={showFieldFill} onChange={(e) => onShowFieldFillChange && onShowFieldFillChange(e.target.checked)} />
            <label htmlFor='field-fill' className={styles.caption}>Show field fill (avg CDU)</label>
          </div>
          {showFieldFill && (
            <div className={styles.rangeRow} style={{ marginTop: 6 }}>
              <div className={styles.caption} style={{ width: 110 }}>Fill Opacity</div>
              <input type='range' min={0} max={1} step={0.05} value={fieldFillOpacity}
                onChange={(e) => onFieldFillOpacityChange && onFieldFillOpacityChange(Number(e.target.value))}
                style={{ flex: 1 }}/>
              <div style={{ width: 40, textAlign: 'right' }}>{fieldFillOpacity.toFixed(2)}</div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <label className={styles.label}>Offset (μm)</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type='number'
              value={offsetMicrometers[0]}
              onChange={(e) => {
                const inputVal = e.target.value
                console.log('Offset X changed:', inputVal)
                if (inputVal === '' || inputVal === '-') return
                const val = parseInt(inputVal, 10)
                if (onOffsetMicrometersChange && !isNaN(val)) {
                  const bounded = Math.min(99999, Math.max(-99999, val))
                  console.log('Offset X updated to:', bounded)
                  onOffsetMicrometersChange([bounded, offsetMicrometers[1]])
                }
              }}
              style={{ width: '70px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder='X'
            />
            <span style={{ padding: '0 4px' }}>,</span>
            <input
              type='number'
              value={offsetMicrometers[1]}
              onChange={(e) => {
                const inputVal = e.target.value
                if (inputVal === '' || inputVal === '-') return
                const val = parseInt(inputVal, 10)
                if (onOffsetMicrometersChange && !isNaN(val)) {
                  const bounded = Math.min(99999, Math.max(-99999, val))
                  onOffsetMicrometersChange([offsetMicrometers[0], bounded])
                }
              }}
              style={{ width: '70px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder='Y'
            />
            <span style={{ fontSize: 12, color: '#999', marginLeft: 4 }}>μm</span>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label className={styles.label}>Field Size (μm)</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type='number'
              max={99999}
              value={fieldSizeMicrometers[0]}
              onChange={(e) => {
                const inputVal = e.target.value
                console.log('Field Size W changed:', inputVal)
                if (inputVal === '' || inputVal === '-') return
                const val = parseInt(inputVal, 10)
                if (onFieldSizeMicrometersChange && !isNaN(val)) {
                  const bounded = Math.min(99999, Math.max(1, val))
                  console.log('Field Size W updated to:', bounded)
                  onFieldSizeMicrometersChange([bounded, fieldSizeMicrometers[1]])
                }
              }}
              style={{ width: '80px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder='Width'
            />
            <span style={{ padding: '0 4px' }}>×</span>
            <input
              type='number'
              max={99999}
              value={fieldSizeMicrometers[1]}
              onChange={(e) => {
                const inputVal = e.target.value
                console.log('Field Size H changed:', inputVal)
                if (inputVal === '' || inputVal === '-') return
                const val = parseInt(inputVal, 10)
                if (onFieldSizeMicrometersChange && !isNaN(val)) {
                  const bounded = Math.min(99999, Math.max(1, val))
                  console.log('Field Size H updated to:', bounded)
                  onFieldSizeMicrometersChange([fieldSizeMicrometers[0], bounded])
                }
              }}
              style={{ width: '80px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder='Height'
            />
          </div>
        </div>

        {/* SEM Point Controls */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '2px solid #e0e0e0' }}>
          <div className={styles.toggleRow}>
            <input
              id='show-sem-points'
              type='checkbox'
              checked={showSemPoints}
              onChange={(e) => onShowSemPointsChange && onShowSemPointsChange(e.target.checked)}
            />
            <label htmlFor='show-sem-points' className={styles.caption} style={{ fontWeight: 600 }}>
              Show SEM Points
            </label>
          </div>

          {showSemPoints && (
            <div style={{ marginTop: 8, paddingLeft: 8 }}>
              <div className={styles.rangeRow} style={{ marginTop: 6 }}>
                <div className={styles.caption} style={{ width: 120 }}>Radius (px)</div>
                <input
                  type='range'
                  min={1}
                  max={10}
                  step={0.5}
                  value={semPointRadiusPx}
                  onChange={(e) => onSemPointRadiusPxChange && onSemPointRadiusPxChange(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <div style={{ width: 40, textAlign: 'right' }}>{semPointRadiusPx.toFixed(1)}</div>
              </div>

              <div className={styles.rangeRow} style={{ marginTop: 6 }}>
                <div className={styles.caption} style={{ width: 120 }}>Opacity</div>
                <input
                  type='range'
                  min={0}
                  max={1}
                  step={0.05}
                  value={semPointOpacity}
                  onChange={(e) => onSemPointOpacityChange && onSemPointOpacityChange(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <div style={{ width: 40, textAlign: 'right' }}>{semPointOpacity.toFixed(2)}</div>
              </div>

              <div style={{ marginTop: 8 }}>
                <label className={styles.label}>Color</label>
                <input
                  type='color'
                  value={semPointColor}
                  onChange={(e) => onSemPointColorChange && onSemPointColorChange(e.target.value)}
                  style={{ width: 80, height: 28, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
                />
              </div>

              <div className={styles.toggleRow} style={{ marginTop: 12 }}>
                <input
                  id='use-sem-palette-color'
                  type='checkbox'
                  checked={useSemPointColorFromPalette}
                  onChange={(e) => onUseSemPointColorFromPaletteChange && onUseSemPointColorFromPaletteChange(e.target.checked)}
                />
                <label htmlFor='use-sem-palette-color' className={styles.caption} style={{ fontSize: 13 }}>
                  Use Palette Color
                </label>
              </div>

              <div className={styles.toggleRow} style={{ marginTop: 8 }}>
                <input
                  id='apply-field-fill-sem'
                  type='checkbox'
                  checked={applyFieldFillFromSemValue}
                  onChange={(e) => onApplyFieldFillFromSemValueChange && onApplyFieldFillFromSemValueChange(e.target.checked)}
                />
                <label htmlFor='apply-field-fill-sem' className={styles.caption} style={{ fontSize: 13 }}>
                  Field BG Color (SEM avg)
                </label>
              </div>

              <div className={styles.toggleRow} style={{ marginTop: 8 }}>
                <input
                  id='apply-die-fill-sem'
                  type='checkbox'
                  checked={applyDieFillFromSemValue}
                  onChange={(e) => onApplyDieFillFromSemValueChange && onApplyDieFillFromSemValueChange(e.target.checked)}
                />
                <label htmlFor='apply-die-fill-sem' className={styles.caption} style={{ fontSize: 13 }}>
                  Die BG Color (SEM avg)
                </label>
              </div>
            </div>
          )}
        </div>

        <div className={styles.note}>Hover the wafer for a subtle lift animation</div>
      </div>
    </div>
  )
}

export default WaferController
