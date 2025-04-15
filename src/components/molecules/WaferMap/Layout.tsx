import React from 'react'
import styled from 'styled-components'

const LayoutContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
  height: 100vh;
  padding: 1rem;
  background-color: #f0f0f0;
`

const Sidebar = styled.div`
  grid-row: 1 / span 2;
  background-color: #ffffff;
  border: 1px solid #ccc;
  padding: 1rem;
`

const MainContent = styled.div`
  grid-column: 2 / span 1;
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 1rem;
`

const JudgementArea = styled.div`
  grid-row: 1 / span 2;
  background-color: #ffffff;
  border: 1px solid #ccc;
  padding: 1rem;
`

const Header = styled.div`
  grid-column: 1 / span 3;
  background-color: #0078d7;
  color: white;
  padding: 1rem;
  text-align: center;
  font-size: 1.5rem;
`

const Footer = styled.div`
  grid-column: 1 / span 3;
  background-color: #0078d7;
  color: white;
  padding: 0.5rem;
  text-align: center;
`

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LayoutContainer>
      <Header>Optical Wafer Thickness Microgauge</Header>
      {children}
      <Footer>© 2025 Wafer Inspection System</Footer>
    </LayoutContainer>
  )
}

export default Layout
