// src/components/ui/InputError.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputErrorProps {
  message?: string;
  className?: string;
}

const InputError: React.FC<InputErrorProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`flex items-center text-sm text-red-500 mt-1 ${className}`}>
      <AlertCircle size={16} className="mr-1" />
      {message}
    </div>
  );
};

export default InputError;
