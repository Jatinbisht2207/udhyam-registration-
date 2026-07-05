import React from 'react';

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    role="status"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const variantClasses = {
  primary:
    'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 focus:ring-blue-400 shadow-md hover:shadow-lg',
  secondary:
    'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-300 shadow-sm hover:shadow-md',
};

function Button({
  label,
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  variant = 'primary',
  className = '',
}) {
  const isDisabled = disabled || loading;

  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer';

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={label}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${isDisabled ? disabledClasses : ''} ${className}`}
    >
      {loading && <Spinner />}
      {loading ? 'Please wait…' : label}
    </button>
  );
}

export default Button;
