import React from 'react'
import { BrowserRouter } from 'react-router'
// import AppRouter from './routes/index.ts'  // 라우터 컴포넌트 임포트 (새로운 라우트 동작 버젼)
import AppRouter from './routes/Routes.tsx' // 라우터 컴포넌트 임포트 (정상 버젼)
import './App.css'
import { AuthProvider } from './app/AuthProvider'
import Navigation from './components/molecules/Navigation'
import { PaletteProvider } from './app/usePalette'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PaletteProvider>
          <Navigation />
          <AppRouter />
        </PaletteProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
