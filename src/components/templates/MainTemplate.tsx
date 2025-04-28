import React from 'react'
// import Layout from '../organisms/CardLayout'
import { Outlet, useNavigate } from 'react-router'
import Navbar from '../molecules/Navbar' // Navbar import 추가

// interface MainTemplateProps {
//   children: React.ReactNode
// }

const MainTemplate: React.FC = () => {
  const navigate = useNavigate()

  const goBack = () => {
    navigate(-1)
  }

  const goArticles = () => {
    navigate('/articles', { replace: false })
  }

  return (
    <div>
      <header style={{ background: 'pink', padding: 16, fontSize: 24 }}>
        <h3>My React App</h3>
        <button onClick={goBack}>뒤로가기</button>
        <button onClick={goArticles}>게시글 목록</button>
      </header>
      <Navbar />
      <main>
        {/* <Layout /> */}
        <div>MainTemplate--children</div>
        <Outlet />
        {/* {children} */}
        <div>children--</div>
      </main>
      <footer>
        <p>© 2025 My React App</p>
      </footer>
    </div>
  )
}

export default MainTemplate
