import React, { createContext, useState } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'

const AuthContext = createContext<{
  token: string
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}>({
  token: '',
  login: async () => {},
  logout: () => {},
})

type AuthProviderProps = {
  children: React.ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate()
  const [token, setToken] = useState('')

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/login', { email, password })
      setToken(response.data.token)
      console.log('AuthProvider: Logged in with token:', response.data.token)
      navigate('/')
    } catch (error) {
      console.error('AuthProvider: Login failed:', error)
      throw error
    }
  }

  const logout = () => {
    setToken('')
    console.log('AuthProvider: Logged out')
    navigate('/login')
  }

  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
