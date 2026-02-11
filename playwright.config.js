// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for E2E tests
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.js',
  // Timeout for individual test
  timeout: 30 * 1000,
  // Timeout for entire test file
  expect: {
    timeout: 5000,
  },
  // Timeout for navigation
  navigationTimeout: 30000,
  // Retry failed tests once (except in CI)
  retries: 0,
  // Number of workers for parallel testing
  workers: 1,
  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  // Shared settings for all launchers
  use: {
    baseURL: 'http://localhost:3000',
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
