/**
 * Returns a sanitized form field key from a schema field object.
 * Replaces dots and dollar signs with underscores so react-hook-form
 * doesn't interpret them as nested paths.
 */
export function getFieldKey(field) {
  const raw = field.id || field.name || '';
  return raw.replace(/[.$]/g, '_');
}

/**
 * Cleans up a label string — truncates at 80 characters with an ellipsis
 * if the original text is longer.
 */
export function formatLabel(label) {
  if (!label) return '';
  const trimmed = label.trim();
  if (trimmed.length <= 80) return trimmed;
  return `${trimmed.slice(0, 80)}…`;
}

/**
 * Lightweight classnames utility.
 * Joins all truthy values separated by a single space.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
