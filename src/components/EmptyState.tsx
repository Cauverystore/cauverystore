// src/components/EmptyState.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title = "Nothing to show here",
  description = "There is currently no content available.",
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-6 text-gray-600 dark:text-gray-400 ${className}`}>
      {Icon && <Icon size={48} className="mb-4 text-gray-400 dark:text-gray-500" />}
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-sm mb-4 max-w-md">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
