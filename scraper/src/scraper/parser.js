/**
 * Parser Module
 *
 * Parses the raw HTML using Cheerio and extracts only Udyam Registration
 * form elements. Filters out unrelated page elements (feedback widgets,
 * language selectors, floating buttons, navigation, etc.).
 *
 * Only extracts information actually present in the DOM — never invents
 * labels, validation rules, or field names.
 */

import * as cheerio from 'cheerio';
import config from '../config/index.js';
import {
  IGNORED_ELEMENT_PATTERNS,
  REGISTRATION_FORM_CONTAINER,
} from '../constants/index.js';
import logger from '../utils/logger.js';

// ---------------------------------------------------------------------------
// Helper Utilities
// ---------------------------------------------------------------------------

/**
 * Safely read an attribute value from a Cheerio element, returning
 * null when the attribute is absent or empty.
 *
 * @param {cheerio.Cheerio} $el - Cheerio-wrapped element.
 * @param {string} attr         - Attribute name.
 * @returns {string|null}
 */
const readAttr = ($el, attr) => {
  const value = $el.attr(attr);
  return value !== undefined && value !== '' ? value : null;
};

/**
 * Check whether a field name/id matches one of the ASP.NET hidden
 * framework fields that should be ignored.
 *
 * @param {string|null} identifier - The field name or id to test.
 * @returns {boolean} True if the field should be skipped.
 */
const isAspNetFrameworkField = (identifier) => {
  if (!identifier) return false;
  return config.ignoredFieldPatterns.some((p) => identifier.includes(p));
};

/**
 * Check whether an element belongs to a non-registration widget
 * (feedback, bhashini, chat, accessibility, navigation, etc.).
 *
 * Tests the element's own class/id and its ancestors' classes/ids
 * against the IGNORED_ELEMENT_PATTERNS list.
 *
 * @param {cheerio.Cheerio} $el  - The element to test.
 * @returns {boolean} True if the element should be excluded.
 */
const isNonRegistrationElement = ($el) => {
  // Collect all class and id values from the element and its ancestors
  const identifiers = [];

  let $current = $el;
  // Walk up a few levels to catch containers
  for (let i = 0; i < 6 && $current.length; i++) {
    const cls = readAttr($current, 'class') || '';
    const id = readAttr($current, 'id') || '';
    identifiers.push(cls.toLowerCase(), id.toLowerCase());
    $current = $current.parent();
  }

  const combined = identifiers.join(' ');
  return IGNORED_ELEMENT_PATTERNS.some((pattern) => combined.includes(pattern));
};

// ---------------------------------------------------------------------------
// Label Extraction
// ---------------------------------------------------------------------------

/**
 * Find the associated label text for a form element using multiple
 * strategies tailored to the Udyam Registration DOM structure:
 *
 *   1. A <label> whose `for` attribute matches the element's `id`.
 *   2. Preceding <b> tag within the same .form-group (Udyam uses
 *      numbered bold labels like "1. Aadhaar Number").
 *   3. Preceding sibling <span> or <label> text.
 *   4. Parent <div class="checkbox"> inline text content.
 *   5. An ancestor <label> wrapping the element.
 *
 * @param {cheerio.CheerioAPI} $ - Cheerio instance.
 * @param {cheerio.Cheerio} $el  - The form element.
 * @returns {string|null}
 */
const findLabel = ($, $el) => {
  const id = readAttr($el, 'id');

  // Strategy 1 — Explicit <label for="...">
  if (id) {
    const labelEl = $(`label[for="${id}"]`);
    if (labelEl.length) {
      const text = labelEl.text().trim();
      if (text) return text;
    }
  }

  // Strategy 2 — Preceding <b> tag within the same .form-group
  // The Udyam portal labels its fields as: <b>1. Aadhaar Number</b>
  const $formGroup = $el.closest('.form-group, .left-box, .checkbox');
  if ($formGroup.length) {
    const $boldLabel = $formGroup.find('b').first();
    if ($boldLabel.length) {
      const text = $boldLabel.text().trim();
      // Strip leading numbering like "1. " or "2. "
      const cleaned = text.replace(/^\d+\.\s*/, '');
      if (cleaned) return cleaned;
    }
  }

  // Strategy 3 — Preceding sibling <b>, <span>, or <label>
  const $prev = $el.prevAll('b, span, label').first();
  if ($prev.length) {
    const text = $prev.text().trim();
    // Filter out validator messages ("Required", etc.)
    if (text && !text.match(/^Required$/i) && text.length > 1) {
      return text.replace(/^\d+\.\s*/, '');
    }
  }

  // Strategy 4 — For checkboxes: extract surrounding text from
  // the parent container (Udyam puts consent text inline)
  const inputType = (readAttr($el, 'type') || '').toLowerCase();
  if (inputType === 'checkbox') {
    const $container = $el.closest('.checkbox, div');
    if ($container.length) {
      const clone = $container.clone();
      clone.find('input, span, br').remove();
      const text = clone.text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 5) {
        // Truncate long consent text to a reasonable label
        return text.length > 120 ? text.substring(0, 120) + '...' : text;
      }
    }
  }

  // Strategy 5 — Ancestor <label>
  const $parentLabel = $el.closest('label');
  if ($parentLabel.length) {
    const clone = $parentLabel.clone();
    clone.find('input, select, textarea').remove();
    const text = clone.text().trim();
    if (text) return text;
  }

  return null;
};

// ---------------------------------------------------------------------------
// Required Field Detection
// ---------------------------------------------------------------------------

/**
 * Determine whether a field is required by checking:
 *   1. HTML5 `required` attribute
 *   2. `aria-required="true"` attribute
 *   3. ASP.NET RequiredFieldValidator or CustomValidator spans that
 *      reference this field (using the `controltovalidate` pattern
 *      in the page's JavaScript)
 *
 * @param {cheerio.CheerioAPI} $ - Cheerio instance.
 * @param {cheerio.Cheerio} $el  - The form element.
 * @param {string} html          - Full page HTML for script analysis.
 * @returns {boolean}
 */
const isFieldRequired = ($, $el, html) => {
  // Check HTML5 required attribute
  if ($el.is('[required]')) return true;

  // Check aria-required
  if (readAttr($el, 'aria-required') === 'true') return true;

  // Check ASP.NET validators in the page scripts
  const id = readAttr($el, 'id');
  if (id) {
    // Look for RequiredFieldValidator.controltovalidate = "fieldId"
    const validatorPattern = new RegExp(
      `controltovalidate\\s*=\\s*["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`,
    );
    if (validatorPattern.test(html)) return true;

    // Look for adjacent RequiredFieldValidator spans
    const $formGroup = $el.closest('.form-group, div');
    if ($formGroup.length) {
      const $validators = $formGroup.find(
        'span[id*="RequiredFieldValidator"], span[id*="CustomValidator"]',
      );
      if ($validators.length) return true;
    }
  }

  return false;
};

// ---------------------------------------------------------------------------
// Validation Rule Extraction
// ---------------------------------------------------------------------------

/**
 * Extract validation rules from HTML attributes and ASP.NET validator
 * scripts present in the page.
 *
 * @param {cheerio.Cheerio} $el - The form element.
 * @param {boolean} required    - Whether the field is required.
 * @returns {object} Validation rules object.
 */
const extractValidation = ($el, required) => {
  const rules = {};

  if (required) rules.required = true;

  const maxlength = readAttr($el, 'maxlength');
  if (maxlength) rules.maxlength = parseInt(maxlength, 10);

  const minlength = readAttr($el, 'minlength');
  if (minlength) rules.minlength = parseInt(minlength, 10);

  const pattern = readAttr($el, 'pattern');
  if (pattern) rules.pattern = pattern;

  const min = readAttr($el, 'min');
  if (min) rules.min = min;

  const max = readAttr($el, 'max');
  if (max) rules.max = max;

  return rules;
};

// ---------------------------------------------------------------------------
// Field Extraction
// ---------------------------------------------------------------------------

/**
 * Extract a normalised property object from a single form element.
 *
 * @param {cheerio.CheerioAPI} $ - Cheerio instance.
 * @param {cheerio.Cheerio} $el  - A single form control element.
 * @param {string} html          - Full page HTML for validator analysis.
 * @returns {object|null} Extracted field object, or null if it should be skipped.
 */
const extractFieldProperties = ($, $el, html) => {
  const tagName = ($el.prop('tagName') || $el.get(0)?.tagName || '')
    .toString()
    .toLowerCase();
  const name = readAttr($el, 'name');
  const id = readAttr($el, 'id');

  // Skip ASP.NET framework hidden fields
  if (isAspNetFrameworkField(name) || isAspNetFrameworkField(id)) return null;

  // Skip elements outside the registration form (widgets, nav, etc.)
  if (isNonRegistrationElement($el)) return null;

  // Skip hidden inputs
  const rawType = (readAttr($el, 'type') || '').toLowerCase();
  if (rawType === 'hidden') return null;

  // Determine normalised input type
  const inputType =
    tagName === 'select'
      ? 'select'
      : tagName === 'textarea'
        ? 'textarea'
        : rawType || 'text';

  // Detect required status
  const required = isFieldRequired($, $el, html);

  // Extract dropdown options for <select> elements
  let options = null;
  if (tagName === 'select') {
    options = $el
      .find('option')
      .map((_i, opt) => ({
        value: $(opt).attr('value') ?? '',
        text: $(opt).text().trim(),
      }))
      .get();
  }

  return {
    label: findLabel($, $el),
    name: name,
    id: id,
    tagName: tagName,
    inputType: inputType,
    type: inputType,
    required: required,
    placeholder: readAttr($el, 'placeholder'),
    defaultValue: rawType === 'submit' ? null : readAttr($el, 'value'),
    disabled: $el.is('[disabled]'),
    readonly: $el.is('[readonly]'),
    autocomplete: readAttr($el, 'autocomplete'),
    className: readAttr($el, 'class'),
    ariaLabel: readAttr($el, 'aria-label'),
    ariaDescribedBy: readAttr($el, 'aria-describedby'),
    validation: extractValidation($el, required),
    options: options,
  };
};

// ---------------------------------------------------------------------------
// Button Extraction
// ---------------------------------------------------------------------------

/**
 * Extract registration buttons from within the form container only.
 *
 * @param {cheerio.CheerioAPI} $ - Cheerio instance.
 * @param {cheerio.Cheerio} $container - The registration form container.
 * @returns {Array<object>} Array of button descriptors.
 */
const extractButtons = ($, $container) => {
  const buttons = [];
  const selector = 'input[type="submit"], input[type="button"], button';

  $container.find(selector).each((_i, el) => {
    const $el = $(el);
    const name = readAttr($el, 'name');
    const id = readAttr($el, 'id');

    // Skip framework fields
    if (isAspNetFrameworkField(name) || isAspNetFrameworkField(id)) return;

    // Skip non-registration elements
    if (isNonRegistrationElement($el)) return;

    const label = $el.text().trim() || readAttr($el, 'value') || null;

    // Decode HTML entities in the label (e.g., &amp; → &)
    const cleanLabel = label ? label.replace(/&amp;/g, '&') : null;

    buttons.push({
      label: cleanLabel,
      name: name,
      id: id,
      tagName: ($el.prop('tagName') || $el.get(0)?.tagName || '')
        .toString()
        .toLowerCase(),
      type: readAttr($el, 'type') || 'button',
      disabled: $el.is('[disabled]'),
      className: readAttr($el, 'class'),
    });
  });

  return buttons;
};

// ---------------------------------------------------------------------------
// Main Parse Function
// ---------------------------------------------------------------------------

/**
 * Parse raw HTML and extract only Udyam Registration form elements.
 *
 * Scopes extraction to the ContentPlaceHolder1 UpdatePanel container
 * to exclude navigation, footer, feedback widgets, and other non-form
 * elements.
 *
 * @param {string} html - The full page HTML string.
 * @returns {{ fields: Array<object>, buttons: Array<object> }}
 */
const parseFormElements = (html) => {
  try {
    logger.info('Parsing HTML for registration form elements...');
    const $ = cheerio.load(html);

    // Scope extraction to the main registration form container
    const $container = $(REGISTRATION_FORM_CONTAINER);

    if (!$container.length) {
      logger.warn(
        `Registration form container "${REGISTRATION_FORM_CONTAINER}" not found. ` +
          'Falling back to full page extraction.',
      );
    }

    const $scope = $container.length ? $container : $('form');
    const fields = [];

    // Collect inputs, selects, and textareas within the form container
    $scope.find('input, select, textarea').each((_i, el) => {
      const $el = $(el);
      const field = extractFieldProperties($, $el, html);
      if (field) {
        fields.push(field);
      }
    });

    const buttons = extractButtons($, $scope);

    logger.success(
      `Parsed ${fields.length} registration field(s) and ${buttons.length} button(s).`,
    );

    return { fields, buttons };
  } catch (err) {
    logger.error('Failed to parse form elements.', err);
    throw err;
  }
};

export { parseFormElements, extractFieldProperties, extractButtons };
