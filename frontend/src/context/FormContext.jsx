import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { TOAST_DURATION } from '../constants';

const FormContext = createContext(null);

export function FormProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  // Fetch schema.json from public/ on mount
  useEffect(() => {
    async function loadSchema() {
      try {
        const res = await fetch('/schema.json');
        if (!res.ok) throw new Error('Failed to load schema');
        const data = await res.json();
        setSchema(data);
      } catch (err) {
        setError(err.message);
      }
    }
    loadSchema();
  }, []);

  const setStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  const updateFormData = useCallback((data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, TOAST_DURATION);
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const value = {
    currentStep,
    formData,
    loading,
    schema,
    error,
    toast,
    setStep,
    updateFormData,
    setLoading,
    setSchema,
    showToast,
    hideToast,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useFormContext() {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return ctx;
}
