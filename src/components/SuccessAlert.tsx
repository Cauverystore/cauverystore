// src/components/SuccessAlert.tsx
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessAlertProps {
  message: string;
  className?: string;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ message, className = '' }) => {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-md border border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900 dark:text-green-100 ${className}`}
    >
      <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default SuccessAlert;
