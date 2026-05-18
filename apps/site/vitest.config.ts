import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@kings/db': path.resolve(__dirname, '../../packages/db/src'),
      '@kings/db/server': path.resolve(__dirname, '../../packages/db/src/server'),
      '@kings/payments': path.resolve(__dirname, '../../packages/payments/src'),
      '@kings/notifications': path.resolve(__dirname, '../../packages/notifications/src'),
      '@kings/shipping': path.resolve(__dirname, '../../packages/shipping/src')
    },
    exclude: ['**/node_modules/**', '**/e2e/**']
  }
})
