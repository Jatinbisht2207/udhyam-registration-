/**
 * Extractor Module
 *
 * Responsible for pulling raw HTML content from the loaded page
 * and saving it to disk. Handles dynamic content loading by
 * waiting for network idle.
 */

import config from '../config/index.js';
import logger from '../utils/logger.js';
import { writeTextFile } from '../utils/file.util.js';

/**
 * Extract the full HTML content of the page.
 *
 * @param {import('puppeteer').Page} page - The Puppeteer page instance.
 * @returns {Promise<string>} The complete HTML string.
 */
const extractRawHtml = async (page) => {
  try {
    logger.info('Extracting raw HTML from the page...');
    const html = await page.content();
    logger.success(`Raw HTML extracted (${html.length} characters).`);
    return html;
  } catch (err) {
    logger.error('Failed to extract raw HTML.', err);
    throw err;
  }
};

/**
 * Save the raw HTML content to the configured output path.
 *
 * @param {string} html - The HTML string to persist.
 */
const saveRawHtml = async (html) => {
  try {
    await writeTextFile(config.output.rawHtmlFile, html);
    logger.success(`Raw HTML saved to: ${config.output.rawHtmlFile}`);
  } catch (err) {
    logger.error('Failed to save raw HTML.', err);
    throw err;
  }
};

/**
 * Wait for any dynamic/AJAX content to finish loading.
 * Uses networkidle0 to wait until there are no more than
 * 0 network connections for 500 ms.
 *
 * @param {import('puppeteer').Page} page - The Puppeteer page instance.
 */
const waitForDynamicContent = async (page) => {
  try {
    logger.info('Waiting for dynamic content to finish loading...');
    await page.waitForNetworkIdle({ idleTime: 1000, timeout: 15_000 });
    logger.success('Dynamic content loaded.');
  } catch {
    // Network-idle timeout is non-fatal; the page may simply
    // have persistent connections (analytics, keep-alive, etc.).
    logger.warn(
      'Network idle timeout reached — proceeding with available content.',
    );
  }
};

export { extractRawHtml, saveRawHtml, waitForDynamicContent };
