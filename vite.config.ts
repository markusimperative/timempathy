import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { wallPrototype } from './server/vite-wall.ts'

export default defineConfig({
  plugins: [react(), wallPrototype()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
})
