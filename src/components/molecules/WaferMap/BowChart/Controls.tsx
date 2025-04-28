import React from 'react'
import { ControlContainer, CheckboxLabel } from './styles'

interface ControlsProps {
  showPoints: boolean
  setShowPoints: React.Dispatch<React.SetStateAction<boolean>>
  showValues: boolean
  setShowValues: React.Dispatch<React.SetStateAction<boolean>>
  showDieMap: boolean
  setShowDieMap: React.Dispatch<React.SetStateAction<boolean>>
}

const Controls: React.FC<ControlsProps> = ({
  showPoints,
  setShowPoints,
  showValues,
  setShowValues,
  showDieMap,
  setShowDieMap,
}) => {
  return (
    <ControlContainer>
      <CheckboxLabel>
        <input type='checkbox' checked={showPoints} onChange={(e) => setShowPoints(e.target.checked)} />
        측정 포인트
      </CheckboxLabel>
      <CheckboxLabel>
        <input type='checkbox' checked={showValues} onChange={(e) => setShowValues(e.target.checked)} />
        측정값
      </CheckboxLabel>
      <CheckboxLabel>
        <input type='checkbox' checked={showDieMap} onChange={(e) => setShowDieMap(e.target.checked)} />
        Die Map
      </CheckboxLabel>
    </ControlContainer>
  )
}

export default Controls
