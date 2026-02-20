import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
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
