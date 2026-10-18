import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4176',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /mobile\.spec\.ts/ },
    { name: 'mobile-chromium', use: { viewport: { width: 360, height: 760 }, isMobile: true, hasTouch: true }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4176 --strictPort --force',
    url: 'http://127.0.0.1:4176',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
