import React from 'react';

interface LoadingSpinnerProps {
  size?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'h-8 w-8',
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-4 border-t-transparent border-green-500 dark:border-green-300 ${size}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default LoadingSpinner;
