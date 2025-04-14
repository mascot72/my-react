// src/pages/Login.tsx
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../store/authSlice'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Replace with your API call
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()

    if (response.ok) {
      dispatch(login({ user: data.user, token: data.token }))
      navigate('/')
    } else {
      alert('Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type='submit'>Login</button>
      <button type='button' onClick={() => navigate('/register')}>
        Register
      </button>
    </form>
  )
}
