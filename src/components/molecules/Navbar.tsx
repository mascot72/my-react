import React, { useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router'

const Nav = styled.nav`
  background: #fff;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  padding: 0 24px;
`
const NavList = styled.ul`
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
  height: 56px;
`
const NavItem = styled.li`
  position: relative;
  &:hover > ul {
    display: block;
  }
`
const NavLink = styled(Link)`
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 8px 0;
  transition: color 0.2s;
  &:hover {
    color: #bf4f74;
  }
`
const Dropdown = styled.ul`
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background: #fff;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  list-style: none;
  margin: 0;
  padding: 8px 0;
  z-index: 10;
`
const DropdownItem = styled.li`
  padding: 0;
  &:hover > a {
    background: #f5f5f5;
    color: #bf4f74;
  }
`
const DropdownLink = styled(Link)`
  display: block;
  padding: 8px 20px;
  color: #333;
  text-decoration: none;
  font-size: 15px;
  transition:
    background 0.2s,
    color 0.2s;
  &:hover {
    background: #f5f5f5;
    color: #bf4f74;
  }
`

const Navbar: React.FC = () => {
  // 2단계 메뉴 구조
  return (
    <Nav>
      <NavList>
        <NavItem>
          <NavLink to='/'>Home</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to='#'>Pages ▾</NavLink>
          <Dropdown>
            <DropdownItem>
              <DropdownLink to='/about'>About</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/contact'>Contact</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/login'>Login</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/register'>Register</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/mypage'>MyPage</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/todo'>Todo</DropdownLink>
            </DropdownItem>
          </Dropdown>
        </NavItem>
        <NavItem>
          <NavLink to='#'>Profile ▾</NavLink>
          <Dropdown>
            <DropdownItem>
              <DropdownLink to='/profiles/chanwoong1'>Profile 1</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/profiles/abcd'>Profile 2</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/profiles/void'>Not Exist</DropdownLink>
            </DropdownItem>
          </Dropdown>
        </NavItem>
        <NavItem>
          <NavLink to='#'>Demo ▾</NavLink>
          <Dropdown>
            <DropdownItem>
              <DropdownLink to='/articles'>게시글</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/svg'>SVG</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/canvas'>Canvas</DropdownLink>
            </DropdownItem>
          </Dropdown>
        </NavItem>
        <NavItem>
          <NavLink to='#'>Map ▾</NavLink>
          <Dropdown>
            <DropdownItem>
              <DropdownLink to='/wafer'>Wafer Map</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/wafer-heatmap'>Wafer Heat Map</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/wafer-shotmap'>Wafer Shot Map</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/color-palette'>Color Palette</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/fieldmap'>Field Map</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/fieldmap-svg'>Field Map SVG</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/fieldmap-rect'>Field Map Rect</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/wafer-fieldmapv6'>Wafer Field Map V6</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/wafer-fieldmapv7'>Wafer Field Map V7</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/wafer-fieldmapv8'>Wafer Field Map V8</DropdownLink>
            </DropdownItem>
            <DropdownItem>
              <DropdownLink to='/rnd'>RnD V1</DropdownLink>
            </DropdownItem>
          </Dropdown>
        </NavItem>
      </NavList>
    </Nav>
  )
}

export default Navbar
