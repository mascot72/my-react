import React from 'react'
import type { FieldRenderItem } from '../types'

interface OutlineLayerProps {
  items: FieldRenderItem[]
  dieWidth: number
  dieHeight: number
  mm2px: (mm: number) => number
  showShotSequence?: boolean
}

export const OutlineLayer: React.FC<OutlineLayerProps> = ({
  items,
  dieWidth,
  dieHeight,
  mm2px,
  showShotSequence = false,
}) => {
  return (
    <g>
      {items.map((item, fi) => {
        const { x, y, w, h } = item.fieldRect
        return (
          <g key={`outline-${fi}`}>
            {/* Field outline */}
            <rect
              x={mm2px(x)}
              y={mm2px(y)}
              width={mm2px(w)}
              height={mm2px(h)}
              fill="none"
              stroke="#c1c6cc"
              strokeWidth={0.9}
            />

            {/* Shot index (optional) */}
            {showShotSequence && item.shotIndex !== undefined && (
              <text
                x={mm2px(x) + 4}
                y={mm2px(y) + 12}
                fontSize={10}
                fill="#0066ff"
                fontWeight="bold">
                Shot: {item.shotIndex}
              </text>
            )}

            {/* Die grid outlines */}
            {item.singleDies.map((d, di) => (
              <rect
                key={`d-outline-${fi}-${di}`}
                x={mm2px(d.x - dieWidth / 2)}
                y={mm2px(d.y - dieHeight / 2)}
                width={mm2px(dieWidth)}
                height={mm2px(dieHeight)}
                fill="none"
                stroke="rgba(0,0,0,0.18)"
                strokeWidth={0.3}
              />
            ))}
          </g>
        )
      })}
    </g>
  )
}
