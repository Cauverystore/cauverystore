// src/components/ui/LabeledInput.tsx
import React, { InputHTMLAttributes, forwardRef } from 'react';

interface LabeledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  wrapperClassName?: string;
}

const LabeledInput = forwardRef<HTMLInputElement, LabeledInputProps>(
  ({ label, error, required, wrapperClassName = '', ...props }, ref) => {
    return (
      <div className={`mb-4 ${wrapperClassName}`}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          ref={ref}
          {...props}
          className={`w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 ring-red-200 focus:ring-red-400'
              : 'border-gray-300 dark:border-gray-600 focus:ring-green-400'
          } bg-white dark:bg-gray-800 text-black dark:text-white`}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

LabeledInput.displayName = 'LabeledInput';

export default LabeledInput;
