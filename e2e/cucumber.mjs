import dotenv from 'dotenv';

for (const path of ['.env.local', '.env']) {
  dotenv.config({ path });
}

/**
 * Cucumber ESM configuration for BDD E2E tests.
 *
 * Uses tsx/esm as a loader hook to transpile TypeScript step definitions
 * on the fly without pre-compilation.
 *
 * @see https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md
 */
export default {
  // Feature file paths
  paths: ['e2e/features/**/*.feature'],

  // Step definitions — loaded via tsx/esm Node loader hook (see package.json scripts)
  import: [
    'e2e/steps/**/*.steps.ts',
    'e2e/support/hooks.ts',
    'e2e/support/world.ts',
  ],

  // Formatters
  format: [
    'pretty',
    'html:e2e/reports/cucumber-report.html',
    'json:e2e/reports/cucumber-report.json',
  ],

  // Publish report to Cucumber.io (optional, disabled by default)
  publishQuiet: true,

  // Fail fast on first failure (useful in CI)
  failFast: false,

  // Retry flaky tests
  retry: process.env.CI ? 1 : 0,

  // Parallel execution
  parallel: process.env.CI ? 2 : 0,

  // Tag expressions for filtering scenarios
  tags: process.env.TAGS || '',
};
