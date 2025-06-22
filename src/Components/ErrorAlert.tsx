// src/components/ErrorAlert.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, className = '' }) => {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-md border border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900 dark:text-red-100 ${className}`}
    >
      <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default ErrorAlert;
