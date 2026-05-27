import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { CustomWorld } from './world';

// Set global Cucumber step timeout to 60 seconds to account for Next.js compilation times in dev/CI mode
setDefaultTimeout(60000);

/**
 * Cucumber lifecycle hooks for Playwright browser management.
 * 
 * - BeforeAll / AfterAll: Run once per test run
 * - Before / After: Run once per scenario
 */

BeforeAll(async function () {
  // Any one-time setup (e.g., seeding test database, starting services)
  console.log('🎭 Starting E2E test suite...');
});

AfterAll(async function () {
  // Any one-time teardown
  console.log('🎭 E2E test suite complete.');
});

Before(async function (this: CustomWorld) {
  // Initialize fresh browser context and page for each scenario
  await this.init();
});

After(async function (this: CustomWorld, scenario) {
  // Capture screenshot on failure
  if (scenario.result?.status === 'FAILED' && this.page) {
    const screenshotPath = `e2e/reports/screenshots/${scenario.pickle.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
  }
  
  // Clean up browser context
  await this.cleanup();
});
