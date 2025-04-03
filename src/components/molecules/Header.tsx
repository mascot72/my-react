import Navbar from './Navbar'
import reactLogo from '../../assets/react.svg'
import viteLogo from '/vite.svg'
const imgStyle = { height: '50px' }
import styled from 'styled-components'

const Container = styled.header`
  height: 50px;
  border: dashed 0.4px var(--color);
  // background: #0f1919;
  padding: 10px;
  font-size: 16px;
`

const List = styled.ul`
  display: flex;
  align-items: center;
  height: 100%;
  list-style-type: none;
  margin: 0;
  padding: 0;

  li {
    align-self: center;
  }
`

export default function Header() {
  return (
    <Container>
      <List>
        {/* <li>Header</li> */}
        <li>
          <a href='https://vite.dev' target='_blank'>
            <img src={viteLogo} className='logo' alt='Vite logo' style={imgStyle} />
          </a>
        </li>
        <li>
          <Navbar />
        </li>
        <li>
          <a href='https://react.dev' target='_blank'>
            <img src={reactLogo} className='logo react' alt='React logo' style={imgStyle} />
          </a>
        </li>
      </List>
    </Container>
  )
}
