import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    // Capture a full trace on the first retry of any failing test.
    // Open with: npx playwright show-report
    trace: 'on-first-retry',
    // Screenshot on failure for quick visual inspection.
    screenshot: 'only-on-failure',
  },
  // Lazy-loaded route chunks add an async gap between page.goto() returning and
  // the actual component rendering. Raise expect.timeout from the 5 s default so
  // toHaveURL / toBeVisible assertions don't expire before the chunk arrives.
  expect: {
    timeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Serve the pre-built app via `vite preview` before running tests.
  // In CI the app is already built; locally, run `npm run build` first.
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
