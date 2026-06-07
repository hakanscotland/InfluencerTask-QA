import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { CustomWorld } from './world';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local
const envPaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '../.env.local'),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}



// Set global Cucumber step timeout to 120 seconds to account for cold starts and mobile CI
setDefaultTimeout(120000);

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
