// src/pages/Login.tsx
import React, { useState } from 'react'
import axios from 'axios'

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [token, setToken] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/login', formData)
      setToken(response.data.token)
      console.log('Logged in successfully:', response.data)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleLogout = () => {
    setToken(null)
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
