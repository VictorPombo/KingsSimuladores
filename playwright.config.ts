import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carrega .env.test em modo de teste, .env.local em dev
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.local'
dotenv.config({ path: path.resolve(process.cwd(), envFile) })

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tests/reports/results',
  reporter: [
    ['html', { outputFolder: './tests/reports/html', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
