const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
const PORT = 5000

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Base API route
const apiRouter = express.Router()

// Mock user data
/**
 * @typedef {Object} User
 * @property {string} email
 * @property {string} password
 * @property {string} token
 */
const mockUser = {
  email: 'test@example.com',
  password: 'password123',
  token: 'mock-token-12345',
}

// Login endpoint
apiRouter.post('/login', (req, res) => {
  const { email, password } = req.body
  if (email === mockUser.email && password === mockUser.password) {
    res.status(200).json({ token: mockUser.token })
  } else {
    res.status(401).json({ error: 'Invalid email or password' })
  }
})

// Mock todos data
/**
 * @typedef {Object} Todo
 * @property {number} id
 * @property {string} text
 * @property {boolean} completed
 */
const todos = [
  { id: 1, text: 'Learn React', completed: false },
  { id: 2, text: 'Learn Redux', completed: true },
]

// Get all todos
apiRouter.get('/todos', (req, res) => {
  try {
    res.status(200).json(todos)
  } catch {
    res.status(500).json({ error: 'Failed to fetch todos' })
  }
})

// Add a new todo
apiRouter.post('/todos', (req, res) => {
  const newTodo = { id: Date.now(), ...req.body }
  todos.push(newTodo)
  res.status(201).json(newTodo)
})

// Update a todo
apiRouter.put('/todos/:id', (req, res) => {
  const { id } = req.params
  const index = todos.findIndex((todo) => todo.id === parseInt(id))
  if (index !== -1) {
    todos[index] = { ...todos[index], ...req.body }
    res.status(200).json(todos[index])
  } else {
    res.status(404).json({ error: 'Todo not found' })
  }
})

// Delete a todo
apiRouter.delete('/todos/:id', (req, res) => {
  const { id } = req.params
  const index = todos.findIndex((todo) => todo.id === parseInt(id))
  if (index !== -1) {
    const deletedTodo = todos.splice(index, 1)
    res.status(200).json({ success: true, id: deletedTodo[0].id })
  } else {
    res.status(404).json({ error: 'Todo not found' })
  }
})

// Use the API router
app.use('/api', apiRouter)

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
