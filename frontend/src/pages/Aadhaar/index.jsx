import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../../context/FormContext';
import useSchemaForm from '../../hooks/useSchemaForm';
import FormField from '../../components/FormField';
import Loader from '../../components/Loader';
import { submitAadhaar } from '../../services/api';
import { getFieldKey } from '../../utils';

export default function AadhaarPage() {
  const navigate = useNavigate();
  const { schema, loading, setLoading, setStep, updateFormData, showToast } = useFormContext();
  const { fields, buttons, zodSchema, stepTitle } = useSchemaForm(0, schema);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    resolver: zodSchema ? zodResolver(zodSchema) : undefined,
    defaultValues: fields.reduce((acc, f) => {
      const key = getFieldKey(f);
      acc[key] = f.type === 'checkbox' ? false : '';
      return acc;
    }, {}),
  });

  // Ensure correct step indicator
  useEffect(() => {
    setStep(1);
  }, [setStep]);

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await submitAadhaar(data);
    setLoading(false);

    if (result.success) {
      updateFormData(data);
      showToast(result.message, 'success');
      setStep(2);
      navigate('/otp');
    } else {
      showToast(result.message, 'error');
    }
  };

  if (!schema) {
    return <Loader />;
  }

  const buttonLabel = buttons[0]?.label || 'Validate & Generate OTP';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-1 text-lg font-semibold text-gray-900">{stepTitle}</h2>
      <p className="mb-6 text-sm text-gray-500">
        Enter your Aadhaar details to begin the registration process.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-1">
        {fields.map((field) => (
          <FormField
            key={getFieldKey(field)}
            field={field}
            register={register}
            error={errors[getFieldKey(field)]}
          />
        ))}

        {loading ? (
          <Loader />
        ) : (
          <button
            type="submit"
            disabled={!isValid}
            className="mt-4 w-full rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {buttonLabel}
          </button>
        )}
      </form>
    </div>
  );
}
