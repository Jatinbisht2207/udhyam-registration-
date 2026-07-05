import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../../context/FormContext';
import { buildOtpSchema } from '../../validations/validators';
import { verifyOtp } from '../../services/api';
import Loader from '../../components/Loader';

const otpSchema = buildOtpSchema();

export default function OTPPage() {
  const navigate = useNavigate();
  const { loading, setLoading, setStep, updateFormData, showToast, formData } = useFormContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  // Ensure correct step indicator
  useEffect(() => {
    setStep(2);
  }, [setStep]);

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await verifyOtp({ ...data, ...formData });
    setLoading(false);

    if (result.success) {
      updateFormData(data);
      showToast(result.message, 'success');
      setStep(3);
      navigate('/pan');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleResend = async () => {
    showToast('OTP has been resent to your registered mobile', 'success');
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-1 text-lg font-semibold text-gray-900">OTP Verification</h2>
      <p className="mb-6 text-sm text-gray-500">
        Enter the 6-digit OTP sent to your Aadhaar-linked mobile number.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
            One-Time Password (OTP)
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            {...register('otp')}
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.otp ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.otp && (
            <p className="text-xs text-red-600 mt-1">{errors.otp.message}</p>
          )}
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={!isValid}
              className="w-full sm:w-auto rounded-md bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              Verify OTP
            </button>
            <button
              type="button"
              onClick={handleResend}
              className="text-sm font-medium text-blue-700 underline-offset-2 hover:underline focus:outline-none"
            >
              Resend OTP
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
