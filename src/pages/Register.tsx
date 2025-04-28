import React, { useState } from 'react'

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    phone: '',
    birthDate: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isAdmin, setIsAdmin] = useState(false) // 관리자 여부

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    if (!formData.birthDate) newErrors.birthDate = 'Birth date is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      console.log('Registration data:', formData)
      // 서버로 데이터 전송 로직 추가
    }
  }

  const handlePasswordReset = () => {
    console.log('Password reset logic here')
    // 비밀번호 찾기 로직 추가
  }

  const handleViewUsers = () => {
    setIsAdmin(true)
    console.log('View user list logic here')
    // 관리자용 회원 목록 보기 로직 추가
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name:
            <input type='text' name='name' value={formData.name} onChange={handleChange} />
          </label>
          {errors.name && <p>{errors.name}</p>}
        </div>
        <div>
          <label>
            Gender:
            <select name='gender' value={formData.gender} onChange={handleChange}>
              <option value=''>Select</option>
              <option value='male'>Male</option>
              <option value='female'>Female</option>
            </select>
          </label>
          {errors.gender && <p>{errors.gender}</p>}
        </div>
        <div>
          <label>
            Phone:
            <input type='text' name='phone' value={formData.phone} onChange={handleChange} />
          </label>
          {errors.phone && <p>{errors.phone}</p>}
        </div>
        <div>
          <label>
            Birth Date:
            <input type='date' name='birthDate' value={formData.birthDate} onChange={handleChange} />
          </label>
          {errors.birthDate && <p>{errors.birthDate}</p>}
        </div>
        <div>
          <label>
            Email:
            <input type='email' name='email' value={formData.email} onChange={handleChange} />
          </label>
          {errors.email && <p>{errors.email}</p>}
        </div>
        <div>
          <label>
            Password:
            <input type='password' name='password' value={formData.password} onChange={handleChange} />
          </label>
          {errors.password && <p>{errors.password}</p>}
        </div>
        <button type='submit'>Register</button>
      </form>
      <button onClick={handlePasswordReset}>Forgot Password?</button>
      <button onClick={handleViewUsers}>View Users (Admin)</button>
      {isAdmin && <p>Admin view: User list will be displayed here.</p>}
    </div>
  )
}

export default Register
