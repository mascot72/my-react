import React from 'react'
import { BrowserRouter } from 'react-router'
import AppRouter from './routes/Routes'
import './App.css'
import { AuthProvider } from './app/AuthProvider'
import Navigation from './components/molecules/Navigation'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
