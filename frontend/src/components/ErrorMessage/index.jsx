import React from 'react';

function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <p className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
      {message}
    </p>
  );
}

export default ErrorMessage;
