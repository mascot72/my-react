import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'dist')))

// 모든 경로를 index.html로 리다이렉트 (SPA 지원)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})
// app.get('/', (req, res) => {
//   res.send('Hello World')
// })

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
