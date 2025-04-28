import React, { createContext, useState } from 'react'
import { useNavigate } from 'react-router'

const AuthContext = createContext<{
  token: string
  login: () => Promise<void>
  logout: () => void
}>({
  token: '',
  login: async () => {},
  logout: () => {},
})

type AuthProviderProps = {
  children: React.ReactNode
}

const fakeAuth = async (): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve('fake-token'), 1000)
  })
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate()
  const [token, setToken] = useState('')

  const login = async () => {
    const resultToken = await fakeAuth()
    setToken(resultToken)
    console.log('AuthProvider: Logged in with token:', resultToken)
    navigate('/')
  }

  const logout = () => {
    setToken('')
    console.log('AuthProvider: Logged out')
    navigate('/login')
  }

  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
