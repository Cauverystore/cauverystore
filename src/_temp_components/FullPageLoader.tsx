// src/components/FullPageLoader.tsx
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-700 dark:text-gray-300 text-sm">Loading, please wait...</p>
      </div>
    </div>
  );
};

export default FullPageLoader;
