// src/components/ui/LabeledSelect.tsx
import React from 'react';
import classNames from 'classnames';

interface Option {
  label: string;
  value: string | number;
}

interface LabeledSelectProps {
  id: string;
  label: string;
  options: Option[];
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

const LabeledSelect: React.FC<LabeledSelectProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  error,
  className = '',
  required = false,
  disabled = false,
}) => {
  return (
    <div className={classNames('mb-4', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={classNames(
          'w-full px-3 py-2 rounded border text-sm bg-white dark:bg-gray-800 dark:text-white',
          'focus:outline-none focus:ring-2 focus:ring-green-500',
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        )}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default LabeledSelect;
