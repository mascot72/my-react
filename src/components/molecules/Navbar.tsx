import React from 'react'
import Button, { ButtonProps } from '../atoms/Button'
import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

const ButtonContainer = styled.button<{ primary?: boolean }>`
  background: transparent;
  border-radius: 3px;
  border: 2px solid #bf4f74;
  color: #bf4f74;
  margin: 0.5em 1em;
  padding: 0.25em 1em;

  ${(props) =>
    props.primary &&
    css`
      background: #bf4f74;
      color: white;
    `}
`

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1rem',
    // backgroundColor: 'lightgray',
    listStyle: 'none',
  },
}

const data: ButtonProps = {
  children: 'Click me',
  onClick: () => {
    console.log('Button clicked')
  },
}

const Navbar: React.FC = () => {
  console.log(data)
  return (
    <nav>
      <ul style={styles.nav}>
        <li>
          <Link to='/'>Home</Link>
        </li>
        <li>
          <Link to='/login'>Login</Link>
        </li>
        <li>
          <Link to='/about'>About</Link>
        </li>
        <li>
          <Link to='/contact'>Contact</Link>
        </li>
        <li>
          <ButtonContainer>Play ground</ButtonContainer>
          <Button onClick={data.onClick}>Hello</Button>
        </li>
        <li>
          <Link to='/profiles/chanwoong1'>profile1</Link>
        </li>
        <li>
          <Link to='/wafer-map'>Wafer Map</Link>
        </li>
        <li>
          <Link to='/profiles/abcd'>profile2</Link>
        </li>
        <li>
          <Link to='/profiles/void'>존재하지 않는 프로필</Link>
        </li>
        <li>
          <Link to='/articles'>게시글</Link>
        </li>
        <li>
          <Link to='/mypage'>MyPage</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
