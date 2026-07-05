import React from 'react';

function Dropdown({
  label,
  name,
  options = [],
  required = false,
  error,
  register,
  disabled = false,
  className = '',
}) {
  const selectId = `select-${name}`;
  const errorId = `${selectId}-error`;

  const registrationProps = register
    ? register(name, { required: required && `${label || name} is required` })
    : { name };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          disabled={disabled}
          aria-label={label || name}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`w-full appearance-none rounded-lg border px-4 py-2.5 pr-10 text-sm text-gray-900 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-300 bg-red-50'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-300 bg-white'
          } ${disabled ? 'bg-gray-100 opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          {...registrationProps}
        >
          <option value="">-- Select --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.text}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p id={errorId} className="text-xs text-red-600 mt-0.5" role="alert">
          {error.message || error}
        </p>
      )}
    </div>
  );
}

export default Dropdown;
