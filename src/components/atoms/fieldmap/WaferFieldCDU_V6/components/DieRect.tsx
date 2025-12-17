import React, { useMemo } from 'react'
import type { Die, SemPointWithDieLocal } from '../types'

interface DieRectProps {
  die: Die
  dieWidth: number
  dieHeight: number
  mm2px: (mm: number) => number
  cduToColor: (v: number | null) => string
  showValues: boolean
  showDieIndex?: boolean
  showDieSequence?: boolean
  fieldIndex?: number
  onDieHover?: (info: { x: number; y: number; value: number | null; fieldIndex?: number; dieIndex?: number; dieSequence?: number }) => void
  onHoverEnd?: () => void
  fieldGridX?: number
  fieldGridY?: number
  dieCol?: number
  dieRow?: number
  getDieFillColor?: (fieldGridX: number, fieldGridY: number, dieCol: number, dieRow: number) => string | null
  applyDieFillFromSemValue?: boolean
  semPoints?: SemPointWithDieLocal[]
  semPointRadiusPx?: number
  interpolateSemFill?: boolean
  dieAverageValue?: number | null
}

export const DieRect: React.FC<DieRectProps> = ({
  die,
  dieWidth,
  dieHeight,
  mm2px,
  cduToColor,
  showValues,
  showDieIndex = false,
  showDieSequence = false,
  fieldIndex,
  onDieHover,
  onHoverEnd,
  fieldGridX,
  fieldGridY,
  dieCol,
  dieRow,
  getDieFillColor,
  applyDieFillFromSemValue = false,
  semPoints = [],
  semPointRadiusPx = 3,
  interpolateSemFill = true,
  dieAverageValue,
}) => {
  const dieKey = `die-${die.dieIndex}`

  const dieLeft = die.x - dieWidth / 2
  const dieBottom = die.y - dieHeight / 2

  const interpolatedCells = useMemo(() => {
    if (!interpolateSemFill || semPoints.length === 0) return []

    const cols = 6
    const rows = 6
    const cellW = dieWidth / cols
    const cellH = dieHeight / rows

    const interpolateValue = (cx: number, cy: number): number | null => {
      let wSum = 0
      let vSum = 0
      semPoints.forEach((sp) => {
        const px = dieLeft + (sp.dieLocalX ?? 0)
        const py = dieBottom + (sp.dieLocalY ?? 0)
        const dx = cx - px
        const dy = cy - py
        const dist = Math.sqrt(dx * dx + dy * dy)
        const w = 1 / (dist + 1e-3)
        wSum += w
        vSum += w * sp.value
      })
      return wSum === 0 ? null : vSum / wSum
    }

    const cells: { x: number; y: number; w: number; h: number; value: number | null }[] = []
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const cx = dieLeft + c * cellW + cellW / 2
        const cy = dieBottom + r * cellH + cellH / 2
        cells.push({ x: dieLeft + c * cellW, y: dieBottom + r * cellH, w: cellW, h: cellH, value: interpolateValue(cx, cy) })
      }
    }
    return cells
  }, [dieLeft, dieBottom, dieWidth, dieHeight, semPoints, interpolateSemFill])

  const dieFillColor = (() => {
    if (applyDieFillFromSemValue && getDieFillColor && fieldGridX !== undefined && fieldGridY !== undefined && dieCol !== undefined && dieRow !== undefined) {
      const filled = getDieFillColor(fieldGridX, fieldGridY, dieCol, dieRow)
      if (filled) return filled
    }
    if (applyDieFillFromSemValue && dieAverageValue != null) {
      return cduToColor(dieAverageValue)
    }
    return die.cdu == null ? '#fff' : cduToColor(die.cdu)
  })()

  return (
    <g key={dieKey}>
      {/* Interpolated fill grid based on SEM points (drawn under outline) */}
      {interpolateSemFill && interpolatedCells.length > 0 && (
        <g>
          {interpolatedCells.map((cell, idx) => (
            <rect
              key={`cell-${idx}`}
              x={mm2px(cell.x)}
              y={mm2px(cell.y)}
              width={mm2px(cell.w)}
              height={mm2px(cell.h)}
              fill={cell.value == null ? 'transparent' : cduToColor(cell.value)}
              fillOpacity={cell.value == null ? 0 : 0.55}
              stroke='none'
            />
          ))}
        </g>
      )}

      <rect
        x={mm2px(die.x - dieWidth / 2)}
        y={mm2px(die.y - dieHeight / 2)}
        width={mm2px(dieWidth)}
        height={mm2px(dieHeight)}
        fill={dieFillColor}
        stroke={die.cdu == null ? '#ddddddff' : 'rgba(0, 0, 0, 0.1)'}
        strokeWidth={0.3}
        onMouseEnter={() => onDieHover && onDieHover({ x: die.x, y: die.y, value: die.cdu ?? null, fieldIndex, dieIndex: die.dieIndex, dieSequence: die.dieSequence })}
        onMouseMove={() => onDieHover && onDieHover({ x: die.x, y: die.y, value: die.cdu ?? null, fieldIndex, dieIndex: die.dieIndex, dieSequence: die.dieSequence })}
        onMouseLeave={() => onHoverEnd && onHoverEnd()}
      />

      {/* SEM 포인트 (Die 상대좌표) */}
      {semPoints.map((sp, idx) => {
        const px = dieLeft + (sp.dieLocalX ?? 0)
        const py = dieBottom + (sp.dieLocalY ?? 0)
        return (
          <circle
            key={`die-sp-${idx}`}
            cx={mm2px(px)}
            cy={mm2px(py)}
            r={semPointRadiusPx}
            fill={cduToColor(sp.value)}
            stroke='#fff'
            strokeWidth={0.4}
            opacity={0.9}
            onMouseEnter={() => onDieHover && onDieHover({ x: px, y: py, value: sp.value, fieldIndex, dieIndex: die.dieIndex, dieSequence: die.dieSequence })}
            onMouseMove={() => onDieHover && onDieHover({ x: px, y: py, value: sp.value, fieldIndex, dieIndex: die.dieIndex, dieSequence: die.dieSequence })}
            onMouseLeave={() => onHoverEnd && onHoverEnd()}
          />
        )
      })}
      {die.cdu != null && showValues && (
        <text
          x={mm2px(die.x)}
          y={mm2px(die.y)}
          textAnchor='middle'
          alignmentBaseline='middle'
          fontSize={10}
          fill='#111'>
          {die.cdu.toFixed(2)}
        </text>
      )}
      {/* die index 표시 (좌상단) - left-bottom to right-top */}
      {showDieIndex && die.dieIndex !== undefined && (
        <text
          x={mm2px(die.x - dieWidth / 2 + 1)}
          y={mm2px(die.y - dieHeight / 2 + 2)}
          fontSize={8}
          fill='#666'
          opacity={0.5}>
          D{die.dieIndex}
        </text>
      )}
      {/* die sequence 표시 (우하단) - left-top to right-bottom */}
      {showDieSequence && die.dieSequence !== undefined && (
        <text
          x={mm2px(die.x + dieWidth / 2 - 1)}
          y={mm2px(die.y + dieHeight / 2 - 1)}
          fontSize={8}
          fill='#0066ff'
          opacity={0.7}
          textAnchor='end'>
          S{die.dieSequence}
        </text>
      )}
    </g>
  )
}
