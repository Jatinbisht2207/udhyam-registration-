/**
 * Logger Utility
 *
 * Provides structured, levelled logging. All modules must use this
 * instead of calling console.log / console.error directly.
 */

const LogLevel = Object.freeze({
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
  SUCCESS: 'SUCCESS',
});

/**
 * Format a log message with timestamp and level.
 *
 * @param {string} level  - Log level label.
 * @param {string} message - Human-readable message.
 * @returns {string} Formatted log string.
 */
const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

/**
 * Log an informational message.
 * @param {string} message
 */
const info = (message) => {
  process.stdout.write(formatMessage(LogLevel.INFO, message) + '\n');
};

/**
 * Log a warning.
 * @param {string} message
 */
const warn = (message) => {
  process.stdout.write(formatMessage(LogLevel.WARN, message) + '\n');
};

/**
 * Log an error (optionally with an Error object).
 * @param {string} message
 * @param {Error} [error]
 */
const error = (message, error = null) => {
  process.stderr.write(formatMessage(LogLevel.ERROR, message) + '\n');
  if (error?.stack) {
    process.stderr.write(`  Stack: ${error.stack}\n`);
  }
};

/**
 * Log a debug message.
 * @param {string} message
 */
const debug = (message) => {
  if (process.env.DEBUG === 'true') {
    process.stdout.write(formatMessage(LogLevel.DEBUG, message) + '\n');
  }
};

/**
 * Log a success message.
 * @param {string} message
 */
const success = (message) => {
  process.stdout.write(formatMessage(LogLevel.SUCCESS, message) + '\n');
};

const logger = { info, warn, error, debug, success };
export default logger;
