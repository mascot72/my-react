import React from 'react'
import AppRouter from './routes/Routes'
import './App.css'
import MainTemplate from './components/templates/MainTemplate'

const App: React.FC = () => {
  return (
    <>
      <div>App.tsx</div>
      <MainTemplate>
        <AppRouter />
      </MainTemplate>
    </>
  )
}

export default App
