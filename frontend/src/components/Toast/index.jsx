import React, { useEffect, useCallback } from 'react';

const typeConfig = {
  success: {
    bg: 'bg-green-50 border-green-400',
    text: 'text-green-800',
    icon: (
      <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-red-50 border-red-400',
    text: 'text-red-800',
    icon: (
      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
      </svg>
    ),
  },
};

function Toast({ message, type = 'success', visible = false, onClose }) {
  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [visible, handleClose]);

  // Close on Escape key
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleClose]);

  const config = typeConfig[type] || typeConfig.success;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm transition-all duration-300 ease-in-out ${
        visible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0 pointer-events-none'
      }`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div
        className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg ${config.bg}`}
      >
        {/* Icon */}
        <div className="shrink-0 mt-0.5">{config.icon}</div>

        {/* Message */}
        <p className={`flex-1 text-sm font-medium ${config.text}`}>
          {message}
        </p>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close notification"
          className={`shrink-0 rounded-md p-1 transition-colors duration-150 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 ${config.text}`}
        >
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Toast;
