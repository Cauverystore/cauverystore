// src/components/SkeletonLoader.tsx
import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded'
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-300 dark:bg-gray-700 ${width} ${height} ${rounded} ${className}`}
    />
  );
};

export default SkeletonLoader;
