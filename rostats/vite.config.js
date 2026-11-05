import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const sharedDir = fileURLToPath(new URL('../shared', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Data shared with the API, e.g. import cities from '@shared/cities.json'
    alias: { '@shared': sharedDir },
  },
  server: {
    // Allow the dev server to serve ../shared, which sits outside the Vite root
    fs: { allow: ['.', sharedDir] },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
