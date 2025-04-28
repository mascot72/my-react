import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express()
const PORT = 5000

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Mock user data
const mockUser = {
  email: 'test@example.com',
  password: 'password123',
  token: 'mock-token-12345',
}

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body

  if (email === mockUser.email && password === mockUser.password) {
    res.status(200).json({ token: mockUser.token })
  } else {
    res.status(401).json({ error: 'Invalid email or password' })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
