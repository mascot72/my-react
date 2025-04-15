import React from 'react'
import styled from 'styled-components'

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #0078d7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #005a9e;
  }
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.9rem;
  color: #333;
`

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`

const Sidebar: React.FC = () => {
  return (
    <SidebarContainer>
      <Button>Scan</Button>
      <Button>Report</Button>
      <InputGroup>
        <Label>Valid Condition</Label>
        <Input type='text' placeholder='Amp. Max' />
        <Input type='text' placeholder='Amp. Min' />
        <Input type='text' placeholder='Error. Thick' />
        <Input type='text' placeholder='Error. Gap' />
      </InputGroup>
      <Button>Apply Condition</Button>
    </SidebarContainer>
  )
}

export default Sidebar
