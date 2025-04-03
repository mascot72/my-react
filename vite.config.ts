import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 경로를 절대 경로로 수정
    },
  },
  plugins: [react()],
  define: {
    'provess.env': {},
  },
})
