// src/pages/Login.tsx
import React, { useState } from 'react'
import useAuth from '../app/UseAuth'

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const { token, login } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData.email, formData.password)
      console.log('Logged in successfully')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleLogout = () => {
    login('', '')
    console.log('Logged out successfully')
  }

  return (
    <div>
      <h1>Login</h1>
      {token ? (
        <div>
          <p>Logged in with token: {token}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <div>
            <label>
              Email:
              <input type='email' name='email' value={formData.email} onChange={handleChange} />
            </label>
          </div>
          <div>
            <label>
              Password:
              <input type='password' name='password' value={formData.password} onChange={handleChange} />
            </label>
          </div>
          <button type='submit'>Login</button>
        </form>
      )}
    </div>
  )
}

export default Login
