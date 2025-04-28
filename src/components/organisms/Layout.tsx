import { Outlet, useNavigate } from 'react-router'
import Header from '../molecules/Header'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/authSlice'

const StyleApp = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 200px);
  font-family: Arial, sans-serif;
  margin: 0 auto;
  border: 1px solid pink;
}`

export default function Layout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div>
      <Header />
      <button onClick={handleLogout}>Logout</button>
      <StyleApp>
        <main>
          <Outlet />
        </main>
      </StyleApp>
      <footer>
        <p>© 2025 My React App</p>
      </footer>
    </div>
  )
}
