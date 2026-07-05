import React from 'react';
import Input from '../Input';
import Dropdown from '../Dropdown';
import Checkbox from '../Checkbox';
import Radio from '../Radio';
import { getFieldKey, formatLabel } from '../../utils';

/**
 * Dynamic form field renderer — factory pattern.
 * Reads field.type from schema.json and delegates to the
 * appropriate component.
 */
function FormField({ field, register, error }) {
  if (!field) return null;

  const fieldKey = getFieldKey(field);
  const label = formatLabel(field.label);

  const commonProps = {
    label,
    name: fieldKey,
    required: field.required,
    error,
    register,
    disabled: field.disabled,
  };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'number':
    case 'password':
    case 'url':
      return (
        <Input
          {...commonProps}
          type={field.type}
          placeholder={field.placeholder}
          autocomplete={field.autocomplete}
        />
      );

    case 'select':
    case 'dropdown':
      return (
        <Dropdown
          {...commonProps}
          options={field.options || []}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          {...commonProps}
          defaultChecked={field.defaultValue === 'on'}
        />
      );

    case 'radio':
      return (
        <Radio
          {...commonProps}
          options={field.options || []}
        />
      );

    default:
      return (
        <Input
          {...commonProps}
          type="text"
          placeholder={field.placeholder}
          autocomplete={field.autocomplete}
        />
      );
  }
}

export default FormField;
