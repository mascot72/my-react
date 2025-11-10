import React from 'react'
import styles from './WaferController.module.css'

interface WaferControllerProps {
  zoom: number
  onZoomChange: (z: number) => void
  showValues: boolean
  onShowValuesChange: (v: boolean) => void
}

const WaferController: React.FC<WaferControllerProps> = ({ zoom, onZoomChange, showValues, onShowValuesChange }) => {

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
            step={0.05}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
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

        <div className={styles.note}>Hover the wafer for a subtle lift animation</div>
      </div>
    </div>
  )
}

export default WaferController
