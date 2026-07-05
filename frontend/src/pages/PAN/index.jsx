import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormContext } from '../../context/FormContext';
import useSchemaForm from '../../hooks/useSchemaForm';
import FormField from '../../components/FormField';
import Loader from '../../components/Loader';
import { submitPan } from '../../services/api';
import { getFieldKey } from '../../utils';

export default function PANPage() {
  const { schema, loading, setLoading, setStep, updateFormData, showToast, formData } =
    useFormContext();
  const { fields, buttons, zodSchema, stepTitle } = useSchemaForm(1, schema);

  const {
    register: baseRegister,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    resolver: zodSchema ? zodResolver(zodSchema) : undefined,
    defaultValues: fields.reduce((acc, f) => {
      const key = getFieldKey(f);
      acc[key] = '';
      return acc;
    }, {}),
  });

  // Ensure correct step indicator
  useEffect(() => {
    setStep(3);
  }, [setStep]);

  // Auto-uppercase wrapper for PAN field
  const register = (name, options) => {
    const field = fields.find((f) => getFieldKey(f) === name);
    const isPan =
      field &&
      field.validation?.pattern &&
      field.validation.pattern.includes('[A-Z]');

    const registration = baseRegister(name, options);

    if (isPan) {
      return {
        ...registration,
        onChange: (e) => {
          const upper = e.target.value.toUpperCase();
          setValue(name, upper, { shouldValidate: true });
        },
      };
    }

    return registration;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await submitPan({ ...data, ...formData });
    setLoading(false);

    if (result.success) {
      updateFormData(data);
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  if (!schema) {
    return <Loader />;
  }

  const buttonLabel = buttons[0]?.label || 'Validate PAN';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-1 text-lg font-semibold text-gray-900">{stepTitle}</h2>
      <p className="mb-6 text-sm text-gray-500">
        Provide your PAN details and select your organisation type.
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
