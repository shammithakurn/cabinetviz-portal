// playwright.config.ts
// Playwright configuration for end-to-end testing

import { defineConfig, devices } from 'playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run tests sequentially for auth-dependent tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid auth conflicts
  reporter: [['html'], ['list']],
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Uncomment webServer when you need Playwright to start the server automatically
  // For testing against an already running server, comment this out
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: true,
  //   timeout: 120000,
  // },
})
