import React from 'react';

function Input({
  label,
  name,
  placeholder = '',
  type = 'text',
  required = false,
  error,
  register,
  validation = {},
  autocomplete,
  disabled = false,
  className = '',
}) {
  const inputId = `input-${name}`;
  const errorId = `${inputId}-error`;

  const registrationProps = register
    ? register(name, { required: required && `${label || name} is required`, ...validation })
    : { name };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autocomplete}
        aria-label={label || name}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-300 bg-red-50'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-300 bg-white'
        } ${disabled ? 'bg-gray-100 opacity-60 cursor-not-allowed' : ''}`}
        {...registrationProps}
      />

      {error && (
        <p id={errorId} className="text-xs text-red-600 mt-0.5" role="alert">
          {error.message || error}
        </p>
      )}
    </div>
  );
}

export default Input;
