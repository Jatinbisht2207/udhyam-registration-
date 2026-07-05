import { useMemo } from 'react';
import { buildStepSchema } from '../validations/validators';

/**
 * Custom hook that extracts step metadata from the loaded schema
 * and builds the corresponding Zod validation schema.
 *
 * @param {number} stepIndex  – 0-based index into schema.steps[]
 * @param {object|null} schema – the full schema.json object
 */
export default function useSchemaForm(stepIndex, schema) {
  return useMemo(() => {
    if (!schema || !schema.steps || !schema.steps[stepIndex]) {
      return { fields: [], buttons: [], zodSchema: null, stepTitle: '' };
    }

    const step = schema.steps[stepIndex];
    const fields = step.fields || [];
    const buttons = step.buttons || [];
    const zodSchema = buildStepSchema(fields);
    const stepTitle = step.title || '';

    return { fields, buttons, zodSchema, stepTitle };
  }, [stepIndex, schema]);
}
