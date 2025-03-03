import React from 'react'
import Layout from '../organisms/Layout'
import Navbar from '../organisms/Navbar' // Navbar import 추가

interface MainTemplateProps {
  children: React.ReactNode
}

const MainTemplate: React.FC<MainTemplateProps> = ({ children }) => {
  return (
    <div>
      <header>
        <h1>My React App</h1>
      </header>
      <Navbar />
      <main>
        <Layout />
        <div>children</div>
        {children}
        <div>children</div>
      </main>
      <footer>
        <p>© 2023 My React App</p>
      </footer>
    </div>
  )
}

export default MainTemplate
