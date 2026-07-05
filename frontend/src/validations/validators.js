import { z } from 'zod';
import { getFieldKey } from '../utils';

/**
 * Build a Zod schema for a single field described in schema.json.
 */
export function buildFieldSchema(field) {
  const { type, validation = {} } = field;
  const { required, maxlength, minlength, pattern } = validation;
  const id = (field.id || field.name || '').toLowerCase();

  // ---------- checkbox ----------
  if (type === 'checkbox') {
    return required
      ? z.literal(true, { error: 'You must accept this consent' })
      : z.boolean();
  }

  // ---------- select ----------
  if (type === 'select') {
    let s = z.string();
    if (required) {
      s = s.min(1, 'Please select an option');
    }
    return s;
  }

  // ---------- text fields ----------
  let s = z.string();

  // Aadhaar — 12 digit numeric
  if (id.includes('adhar') && maxlength === 12) {
    s = s
      .length(12, 'Aadhaar number must be exactly 12 digits')
      .regex(/^\d{12}$/, 'Aadhaar must contain only digits');
    return s;
  }

  // PAN — explicit regex pattern from schema
  if (pattern) {
    const re = new RegExp(pattern.replace(/\$$/, '$'));
    s = s.regex(re, 'Invalid format');
    if (maxlength) s = s.max(maxlength);
    return s;
  }

  // Generic text
  if (required) {
    s = s.min(1, 'This field is required');
  }
  if (minlength) {
    s = s.min(minlength, `Minimum ${minlength} characters`);
  }
  if (maxlength) {
    s = s.max(maxlength, `Maximum ${maxlength} characters`);
  }

  return s;
}

/**
 * Build a Zod object schema for an entire step, keyed by sanitized field id.
 */
export function buildStepSchema(fields) {
  const shape = {};
  for (const field of fields) {
    const key = getFieldKey(field);
    shape[key] = buildFieldSchema(field);
  }
  return z.object(shape);
}

/**
 * Standalone OTP schema (OTP is not part of schema.json).
 */
export function buildOtpSchema() {
  return z.object({
    otp: z
      .string()
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain only digits'),
  });
}
