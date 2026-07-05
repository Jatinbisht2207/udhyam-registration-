/**
 * Constants
 *
 * Shared constant values used across the scraper modules.
 */

/**
 * CSS class / ID patterns for elements that are NOT part of the
 * Udyam Registration form and must be excluded from parsing.
 */
export const IGNORED_ELEMENT_PATTERNS = Object.freeze([
  // Bhashini translation plugin
  'bhashini',
  // Feedback widgets
  'feedback',
  'submit-feedback',
  'suggested-feedback',
  // Accessibility / floating controls
  'accessibility',
  'chatbot',
  'chat-widget',
  // Navigation elements
  'navbar',
  'nav-link',
  'menu',
  'header',
  'footer',
]);

/**
 * Step definitions for the Udyam Registration process.
 *
 * Step 1 covers Aadhaar Verification and OTP Verification (both are
 * part of the initial identity confirmation).
 * Step 2 covers PAN Verification.
 */
export const STEPS = Object.freeze([
  {
    step: 1,
    title: 'Aadhaar & OTP Verification',
    description: 'Verify identity using Aadhaar number and OTP',
    substeps: [
      { id: 'aadhaar', title: 'Aadhaar Verification' },
      { id: 'otp', title: 'OTP Verification' },
    ],
  },
  {
    step: 2,
    title: 'PAN Verification',
    description: 'Verify PAN and select organisation type',
  },
]);

/**
 * The main content area selector. Only elements inside this
 * container are part of the registration form.
 */
export const REGISTRATION_FORM_CONTAINER =
  '#ctl00_ContentPlaceHolder1_UpdatePaneldd1';

/**
 * Mapping from HTML input type attribute to a normalised type string
 * used in the output schema.
 */
export const INPUT_TYPE_MAP = Object.freeze({
  text: 'text',
  password: 'password',
  email: 'email',
  number: 'number',
  tel: 'tel',
  url: 'url',
  date: 'date',
  radio: 'radio',
  checkbox: 'checkbox',
  file: 'file',
  hidden: 'hidden',
  submit: 'submit',
  button: 'button',
});
