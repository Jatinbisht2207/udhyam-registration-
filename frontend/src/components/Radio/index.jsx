import React from 'react';

function Radio({
  label,
  name,
  options = [],
  required = false,
  error,
  register,
  disabled = false,
  className = '',
}) {
  const groupId = `radio-group-${name}`;
  const errorId = `${groupId}-error`;

  const registrationProps = register
    ? register(name, { required: required && `${label || name} is required` })
    : { name };

  return (
    <fieldset
      className={`flex flex-col gap-2 ${className}`}
      aria-describedby={error ? errorId : undefined}
      role="radiogroup"
      aria-label={label || name}
    >
      {label && (
        <legend className="text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </legend>
      )}

      <div className="flex flex-col gap-2.5">
        {options.map((opt) => {
          const optionId = `${name}-${opt.value}`;
          return (
            <div key={opt.value} className="flex items-center gap-2.5">
              <input
                id={optionId}
                type="radio"
                value={opt.value}
                disabled={disabled}
                aria-invalid={!!error}
                className={`h-4 w-4 shrink-0 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 cursor-pointer ${
                  error
                    ? 'border-red-500 text-red-600'
                    : 'border-gray-300 text-blue-600'
                } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                {...registrationProps}
              />
              <label
                htmlFor={optionId}
                className={`text-sm select-none ${
                  disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'
                }`}
              >
                {opt.text || opt.label || opt.value}
              </label>
            </div>
          );
        })}
      </div>

      {error && (
        <p id={errorId} className="text-xs text-red-600 mt-0.5" role="alert">
          {error.message || error}
        </p>
      )}
    </fieldset>
  );
}

export default Radio;
