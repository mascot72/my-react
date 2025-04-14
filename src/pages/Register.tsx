import React, { useState } from 'react'

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Registration data:', formData)
    // 등록 로직 추가
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Username:
            <input type='text' name='username' value={formData.username} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input type='password' name='password' value={formData.password} onChange={handleChange} />
          </label>
        </div>
        <button type='submit'>Register</button>
      </form>
    </div>
  )
}

export default Register
