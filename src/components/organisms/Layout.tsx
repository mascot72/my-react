import { Outlet } from 'react-router-dom'
import Header from '../molecules/Header'

export default function Layout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <footer>
        <p>© 2025 My React App</p>
      </footer>
    </div>
  )
}
