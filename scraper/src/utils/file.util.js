/**
 * File Utility
 *
 * Reusable helpers for reading and writing files with proper
 * error handling and directory creation.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import logger from './logger.js';

/**
 * Ensure that the parent directory of a file path exists,
 * creating it recursively if necessary.
 *
 * @param {string} filePath - Absolute or relative file path.
 */
const ensureDirectory = async (filePath) => {
  const dir = dirname(filePath);
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    logger.error(`Failed to create directory: ${dir}`, err);
    throw err;
  }
};

/**
 * Write text content to a file (UTF-8), creating parent directories
 * as needed.
 *
 * @param {string} filePath - Target file path.
 * @param {string} content  - Content to write.
 */
const writeTextFile = async (filePath, content) => {
  try {
    await ensureDirectory(filePath);
    await writeFile(filePath, content, 'utf-8');
    logger.success(`File saved: ${filePath}`);
  } catch (err) {
    logger.error(`Failed to write file: ${filePath}`, err);
    throw err;
  }
};

/**
 * Write a JavaScript object to a JSON file with pretty-printing.
 *
 * @param {string} filePath - Target file path.
 * @param {object} data     - Data to serialise.
 */
const writeJsonFile = async (filePath, data) => {
  const json = JSON.stringify(data, null, 2);
  await writeTextFile(filePath, json);
};

export { ensureDirectory, writeTextFile, writeJsonFile };
