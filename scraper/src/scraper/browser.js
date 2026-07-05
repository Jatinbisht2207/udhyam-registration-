/**
 * Browser Module
 *
 * Manages the Puppeteer browser lifecycle — launch, page creation,
 * navigation, and teardown.
 */

import puppeteer from 'puppeteer';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Launch a headless Chromium browser instance.
 *
 * @returns {Promise<import('puppeteer').Browser>} The browser instance.
 */
const launchBrowser = async () => {
  try {
    logger.info('Launching headless browser...');
    const browser = await puppeteer.launch(config.browser);
    logger.success('Browser launched successfully.');
    return browser;
  } catch (err) {
    logger.error('Failed to launch browser.', err);
    throw err;
  }
};

/**
 * Create a new page and navigate to the target URL.
 *
 * @param {import('puppeteer').Browser} browser - Active browser instance.
 * @returns {Promise<import('puppeteer').Page>} The page after navigation.
 */
const navigateToTarget = async (browser) => {
  try {
    const page = await browser.newPage();

    // Set a realistic user-agent to avoid being blocked
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    );

    logger.info(`Navigating to: ${config.targetUrl}`);
    await page.goto(config.targetUrl, {
      waitUntil: config.navigation.waitUntil,
      timeout: config.navigation.timeout,
    });

    // Wait for at least the main form to be present in the DOM
    for (const selector of config.readySelectors) {
      logger.info(`Waiting for selector: "${selector}"`);
      await page.waitForSelector(selector, {
        timeout: config.navigation.timeout,
      });
    }

    logger.success('Page loaded and ready selectors detected.');
    return page;
  } catch (err) {
    logger.error('Failed to navigate to target URL.', err);
    throw err;
  }
};

/**
 * Gracefully close the browser instance.
 *
 * @param {import('puppeteer').Browser} browser - The browser to close.
 */
const closeBrowser = async (browser) => {
  try {
    if (browser) {
      await browser.close();
      logger.info('Browser closed.');
    }
  } catch (err) {
    logger.warn('Error while closing browser — it may have already exited.');
  }
};

export { launchBrowser, navigateToTarget, closeBrowser };
