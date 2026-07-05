import React from 'react';

function Checkbox({
  label,
  name,
  required = false,
  error,
  register,
  defaultChecked = false,
  disabled = false,
  className = '',
}) {
  const checkboxId = `checkbox-${name}`;
  const errorId = `${checkboxId}-error`;

  const registrationProps = register
    ? register(name, { required: required && `${label || name} is required` })
    : { name };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-start gap-3">
        <input
          id={checkboxId}
          type="checkbox"
          defaultChecked={defaultChecked}
          disabled={disabled}
          aria-label={label || name}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`mt-1 h-4 w-4 shrink-0 rounded border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 cursor-pointer ${
            error
              ? 'border-red-500 text-red-600'
              : 'border-gray-300 text-blue-600'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          {...registrationProps}
        />

        {label && (
          <label
            htmlFor={checkboxId}
            className={`text-sm leading-relaxed select-none ${
              disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'
            }`}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-xs text-red-600 ml-7" role="alert">
          {error.message || error}
        </p>
      )}
    </div>
  );
}

export default Checkbox;
