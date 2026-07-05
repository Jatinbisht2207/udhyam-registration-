import React from 'react';
import ProgressBar from '../components/ProgressBar';
import Toast from '../components/Toast';
import { useFormContext } from '../context/FormContext';

export default function MainLayout({ children }) {
  const { currentStep, toast, hideToast } = useFormContext();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-md">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-wide sm:text-2xl">
            Udyam Registration Portal
          </h1>
          <p className="mt-0.5 text-xs text-blue-200 sm:text-sm">
            Ministry of Micro, Small &amp; Medium Enterprises — Government of India
          </p>
        </div>
      </header>

      {/* Progress */}
      <ProgressBar currentStep={currentStep} />

      {/* Main content */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Ministry of MSME, Government of India. All rights reserved.
      </footer>

      {/* Toast */}
      <Toast
        message={toast?.message}
        type={toast?.type}
        visible={!!toast}
        onClose={hideToast}
      />
    </div>
  );
}

