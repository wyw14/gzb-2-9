import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5281,
    proxy: {
      '/api': {
        target: 'http://localhost:4009',
        changeOrigin: true
      }
    }
  }
})
