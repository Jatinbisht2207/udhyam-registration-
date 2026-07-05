/**
 * Schema Builder Module
 *
 * Converts the raw extracted form elements into a structured,
 * reusable JSON schema organised by registration steps.
 *
 * Step 1: Aadhaar Verification + OTP Verification
 * Step 2: PAN Verification
 *
 * PAN Verification fields are not present in the initial page DOM
 * because the portal gates them behind OTP. The schema builder
 * constructs Step 2 from known information visible in the portal's
 * step indicator and JavaScript references, clearly marking that
 * these fields could not be scraped from the live DOM.
 */

import { STEPS } from '../constants/index.js';
import logger from '../utils/logger.js';

// ---------------------------------------------------------------------------
// Cleaning Utilities
// ---------------------------------------------------------------------------

/**
 * Remove properties with null/undefined/empty values from an object
 * to keep the output schema concise.
 *
 * @param {object} obj - Object to clean.
 * @returns {object} Cleaned object with only meaningful values.
 */
const cleanObject = (obj) => {
  if (!obj || typeof obj !== 'object') return {};
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== null && v !== undefined && v !== '',
    ),
  );
};

/**
 * Clean a single field object by keeping core properties and only
 * including optional ones when they have meaningful values.
 *
 * @param {object} field - Raw extracted field.
 * @returns {object} Frontend-ready field descriptor.
 */
const cleanField = (field) => {
  const cleaned = {
    label: field.label || null,
    name: field.name || null,
    id: field.id || null,
    type: field.type,
    required: field.required,
    placeholder: field.placeholder || null,
    validation: cleanObject(field.validation),
  };

  // Optional properties — include only when present
  if (field.defaultValue) cleaned.defaultValue = field.defaultValue;
  if (field.disabled) cleaned.disabled = true;
  if (field.readonly) cleaned.readonly = true;
  if (field.autocomplete) cleaned.autocomplete = field.autocomplete;
  if (field.options) cleaned.options = field.options;

  return cleaned;
};

/**
 * Clean a button object for the output schema.
 *
 * @param {object} button - Raw extracted button.
 * @returns {object} Cleaned button descriptor.
 */
const cleanButton = (button) => ({
  label: button.label || null,
  name: button.name || null,
  id: button.id || null,
  type: button.type || 'button',
  disabled: button.disabled || false,
});

// ---------------------------------------------------------------------------
// Step 2 — PAN Verification (known structure)
// ---------------------------------------------------------------------------

/**
 * Build the PAN Verification step from known portal structure.
 *
 * Because OTP verification prevents scraping beyond Step 1, the PAN
 * step fields are constructed from:
 *   - JavaScript references in the page (e.g., txtPan, ddlTypeofOrg)
 *   - Visible step indicator text ("PAN Verification")
 *   - Standard Udyam registration flow knowledge
 *
 * Each field is tagged with `scraped: false` so the frontend knows
 * this data was not extracted from the live DOM.
 *
 * @param {string} html - Full page HTML for reference extraction.
 * @returns {object} Step 2 schema object.
 */
const buildPanVerificationStep = (html) => {
  const fields = [];

  // Check if PAN-related references exist in the page scripts
  const hasPanRef = html.includes('txtPan');
  const hasOrgTypeRef = html.includes('ddlTypeofOrg');

  if (hasPanRef) {
    fields.push({
      label: 'PAN Number',
      name: 'ctl00$ContentPlaceHolder1$txtPan',
      id: 'ctl00_ContentPlaceHolder1_txtPan',
      type: 'text',
      required: true,
      placeholder: null,
      validation: {
        required: true,
        maxlength: 10,
        pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$',
      },
      scraped: false,
      note: 'Field referenced in page scripts but not visible in initial DOM (behind OTP gate)',
    });
  }

  if (hasOrgTypeRef) {
    fields.push({
      label: 'Type of Organisation',
      name: 'ctl00$ContentPlaceHolder1$ddlTypeofOrg',
      id: 'ctl00_ContentPlaceHolder1_ddlTypeofOrg',
      type: 'select',
      required: true,
      placeholder: null,
      validation: {
        required: true,
      },
      options: [
        { value: '', text: '--Select--' },
        { value: '1', text: 'Proprietorship' },
        { value: '2', text: 'Hindu Undivided Family (HUF)' },
        { value: '3', text: 'Partnership' },
        { value: '4', text: 'Co-operative Society' },
        { value: '5', text: 'Society' },
        { value: '6', text: 'Trust' },
        { value: '7', text: 'Private Limited Company' },
        { value: '8', text: 'Public Limited Company' },
        { value: '9', text: 'Limited Liability Partnership' },
        { value: '10', text: 'Self Help Group (SHG)' },
        { value: '11', text: 'Others' },
      ],
      scraped: false,
      note: 'Field referenced in page scripts but not visible in initial DOM (behind OTP gate)',
    });
  }

  const buttons = [];
  if (hasPanRef) {
    buttons.push({
      label: 'Validate PAN',
      name: null,
      id: null,
      type: 'submit',
      disabled: false,
      scraped: false,
      note: 'Expected button based on portal flow (behind OTP gate)',
    });
  }

  return {
    step: 2,
    title: 'PAN Verification',
    description:
      'Verify PAN and select organisation type. These fields appear after OTP verification.',
    fields,
    buttons,
    scraped: fields.some((f) => f.scraped !== false),
  };
};

// ---------------------------------------------------------------------------
// Main Schema Builder
// ---------------------------------------------------------------------------

/**
 * Build the final schema object from parsed registration form data.
 *
 * @param {{ fields: Array, buttons: Array }} parsedData - Output from parser.
 * @param {string} html - Full page HTML for PAN step reference extraction.
 * @returns {object} The structured, frontend-ready schema object.
 */
const buildSchema = (parsedData, html = '') => {
  try {
    logger.info('Building structured schema from parsed data...');

    const { fields, buttons } = parsedData;

    // ------------------------------------------------------------------
    // Step 1 — Aadhaar & OTP Verification (scraped from DOM)
    // ------------------------------------------------------------------
    const step1Fields = fields
      .filter((f) => f.type !== 'submit')
      .map(cleanField);

    const step1Buttons = buttons.map(cleanButton);

    const step1 = {
      step: 1,
      title: STEPS[0].title,
      description: STEPS[0].description,
      substeps: STEPS[0].substeps,
      fields: step1Fields,
      buttons: step1Buttons,
      scraped: true,
    };

    // ------------------------------------------------------------------
    // Step 2 — PAN Verification (constructed from script references)
    // ------------------------------------------------------------------
    const step2 = buildPanVerificationStep(html);

    // Only include steps that have fields or buttons
    const steps = [step1, step2].filter(
      (s) => s.fields.length > 0 || s.buttons.length > 0,
    );

    const schema = {
      source: 'https://udyamregistration.gov.in/UdyamRegistration.aspx',
      scrapedAt: new Date().toISOString(),
      totalSteps: steps.length,
      steps,
    };

    const totalFields = steps.reduce((sum, s) => sum + s.fields.length, 0);
    const totalButtons = steps.reduce((sum, s) => sum + s.buttons.length, 0);

    logger.success(
      `Schema built: ${steps.length} step(s), ${totalFields} field(s), ${totalButtons} button(s).`,
    );

    return schema;
  } catch (err) {
    logger.error('Failed to build schema.', err);
    throw err;
  }
};

export { buildSchema, cleanField, cleanButton, cleanObject };
