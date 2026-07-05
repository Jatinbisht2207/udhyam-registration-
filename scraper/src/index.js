/**
 * Scraper — Entry Point
 *
 * Orchestrates the full scraping pipeline:
 *   1. Launch browser → navigate to target
 *   2. Wait for dynamic content
 *   3. Extract raw HTML → save to disk
 *   4. Parse HTML → extract form elements
 *   5. Build structured schema → save to disk
 *   6. Close browser
 *
 * Usage:  npm run scrape
 */

import { launchBrowser, navigateToTarget, closeBrowser } from './scraper/browser.js';
import { extractRawHtml, saveRawHtml, waitForDynamicContent } from './scraper/extractor.js';
import { parseFormElements } from './scraper/parser.js';
import { buildSchema } from './scraper/schema.builder.js';
import { writeJsonFile } from './utils/file.util.js';
import config from './config/index.js';
import logger from './utils/logger.js';

/**
 * Main scraping pipeline.
 */
const run = async () => {
  let browser = null;

  try {
    logger.info('=== Udyam Registration Scraper ===');
    logger.info('Starting scraping pipeline...');

    // Step 1 — Launch browser and navigate
    browser = await launchBrowser();
    const page = await navigateToTarget(browser);

    // Step 2 — Wait for dynamic / AJAX content
    await waitForDynamicContent(page);

    // Step 3 — Extract and save raw HTML
    const rawHtml = await extractRawHtml(page);
    await saveRawHtml(rawHtml);

    // Step 4 — Parse form elements from the HTML
    const parsedData = parseFormElements(rawHtml);

    // Step 5 — Build structured schema and save
    const schema = buildSchema(parsedData, rawHtml);
    await writeJsonFile(config.output.schemaFile, schema);

    logger.success('=== Scraping pipeline completed successfully ===');
    logger.info(`Schema output: ${config.output.schemaFile}`);
    logger.info(`Raw HTML output: ${config.output.rawHtmlFile}`);
  } catch (err) {
    logger.error('Scraping pipeline failed.', err);
    process.exitCode = 1;
  } finally {
    // Always close the browser to free resources
    await closeBrowser(browser);
  }
};

// Execute the pipeline
run();
