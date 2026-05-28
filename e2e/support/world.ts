import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import './env';

/**
 * Custom Cucumber World with Playwright browser, context, and page.
 * 
 * Each scenario gets a fresh browser context and page for isolation.
 * Use `this.page` in step definitions to interact with the browser.
 * 
 * @example
 * Given('I am on the login page', async function (this: CustomWorld) {
 *   await this.page.goto('/login');
 * });
 */
export interface CustomWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;

  // Test data storage for cross-step sharing
  testData: Record<string, unknown>;

  // Lifecycle methods (called by hooks)
  init(): Promise<void>;
  cleanup(): Promise<void>;
}

class PlaywrightWorld extends World implements CustomWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  testData: Record<string, unknown> = {};

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init() {
    // Headless by default. Override to headed only when HEADLESS=false explicitly.
    // CI=true always forces headless regardless of HEADLESS value.
    const isHeadless = process.env.HEADLESS !== 'false' || process.env.CI === 'true';
    this.browser = await chromium.launch({
      headless: isHeadless,
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO, 10) : (isHeadless ? 0 : 300),
    });
    this.context = await this.browser.newContext({
      // BASE_URL → workflow'dan gelen env variable (TEST_BASE_URL eski isimdi, kaldırıldı)
      baseURL: process.env.BASE_URL || 'https://influencerportal.com',
      viewport: { width: 1280, height: 720 },
      recordVideo: process.env.CI === 'true' ? undefined : { dir: 'e2e/reports/videos/' },
    });
    this.page = await this.context.newPage();
    
    // Set default timeout
    this.page.setDefaultTimeout(15000);
    this.page.setDefaultNavigationTimeout(60000);
  }

  async cleanup() {
    await this.context?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(PlaywrightWorld);
