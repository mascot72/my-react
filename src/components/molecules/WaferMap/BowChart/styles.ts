import styled from 'styled-components'

export const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
`

export const WaferContainer = styled.div`
  position: relative;
  width: 90%;
  height: 90%;
  margin: auto;
  z-index: 2;
`

export const GraphContainer = styled.div`
  width: 100%;
  height: 20%;
  margin-top: auto;
`

export const ControlContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  z-index: 3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  user-select: none;

  input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  &:hover {
    color: #0078d7;
  }
`
