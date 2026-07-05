/**
 * Scraper Configuration
 *
 * Centralised configuration for the Udyam Registration scraper.
 * All tuneable values live here so nothing is hard-coded elsewhere.
 */

const config = Object.freeze({
  /** Target URL of the Udyam Registration portal */
  targetUrl: 'https://udyamregistration.gov.in/UdyamRegistration.aspx',

  /** Puppeteer launch options */
  browser: {
    headless: 'new',
    executablePath:
      process.env.CHROME_PATH ||
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
    defaultViewport: { width: 1280, height: 900 },
    timeout: 60_000,
  },

  /** Navigation and wait settings */
  navigation: {
    waitUntil: 'networkidle2',
    timeout: 60_000,
  },

  /** Selectors to wait for before extraction */
  readySelectors: ['form'],

  /** ASP.NET hidden fields to ignore during extraction */
  ignoredFieldPatterns: [
    '__VIEWSTATE',
    '__VIEWSTATEGENERATOR',
    '__EVENTVALIDATION',
    '__EVENTTARGET',
    '__EVENTARGUMENT',
    '__LASTFOCUS',
    '__ASYNCPOST',
  ],

  /** Output file paths (relative to project root) */
  output: {
    schemaFile: 'src/output/schema.json',
    rawHtmlFile: 'src/output/raw.html',
  },
});

export default config;
