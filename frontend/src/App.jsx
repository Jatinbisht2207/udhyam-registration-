import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FormProvider } from './context/FormContext';
import MainLayout from './layouts/MainLayout';
import AadhaarPage from './pages/Aadhaar';
import OTPPage from './pages/OTP';
import PANPage from './pages/PAN';

export default function App() {
  return (
    <BrowserRouter>
      <FormProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<AadhaarPage />} />
            <Route path="/otp" element={<OTPPage />} />
            <Route path="/pan" element={<PANPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </FormProvider>
    </BrowserRouter>
  );
}
