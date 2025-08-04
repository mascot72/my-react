import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // 정상 동작 버젼
// import { reactRouter } from '@react-router/dev/vite' // 새로운 라우트 동작 버젼

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 경로를 절대 경로로 수정
      '@components': path.resolve(__dirname, 'src/components'), // 경로를 절대 경로로 수정
    },
  },
  plugins: [
    react(), // 정상 동작 버젼
    // reactRouter(), // 새로운 라우트 동작 버젼
  ],
  define: {
    'provess.env': {},
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
