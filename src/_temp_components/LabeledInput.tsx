// src/components/LabeledInput.tsx
import React from 'react';
import FormField from './FormField';

interface LabeledInputProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  description?: string;
}

const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required,
  error,
  description
}) => {
  return (
    <FormField label={label} htmlFor={id} required={required} error={error} description={description}>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md shadow-sm outline-none text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
    </FormField>
  );
};

export default LabeledInput;
