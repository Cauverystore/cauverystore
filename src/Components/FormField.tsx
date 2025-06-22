// src/components/FormField.tsx
import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required = false,
  error,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`mb-5 ${className}`}>
      <label htmlFor={htmlFor} className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {children}

      {description && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;
