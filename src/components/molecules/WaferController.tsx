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
  // Field array size and offset controls
  fieldArraySize?: [number, number]
  onFieldArraySizeChange?: (size: [number, number]) => void
  offsetMicrometers?: [number, number]
  onOffsetMicrometersChange?: (offset: [number, number]) => void
  // Field size controls
  fieldSizeMicrometers?: [number, number]
  onFieldSizeMicrometersChange?: (size: [number, number]) => void
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
  fieldArraySize = [10, 10],
  onFieldArraySizeChange,
  offsetMicrometers = [0, 0],
  onOffsetMicrometersChange,
  fieldSizeMicrometers = [20000, 30000],
  onFieldSizeMicrometersChange,
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

        <div className={styles.note}>Hover the wafer for a subtle lift animation</div>
      </div>
    </div>
  )
}

export default WaferController
