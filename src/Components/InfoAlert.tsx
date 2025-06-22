import React from 'react';
import { Info } from 'lucide-react';

interface InfoAlertProps {
  message: string;
  className?: string;
}

const InfoAlert: React.FC<InfoAlertProps> = ({ message, className = '' }) => {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-md border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100 ${className}`}
    >
      <Info className="w-5 h-5 mt-0.5 shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default InfoAlert;
