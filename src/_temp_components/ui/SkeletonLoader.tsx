// src/components/ui/SkeletonLoader.tsx
import React from 'react';
import classNames from 'classnames';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = 'w-full',
  height = 'h-4',
  className = '',
  rounded = true,
}) => {
  return (
    <div
      className={classNames(
        'animate-pulse bg-gray-300 dark:bg-gray-700',
        width,
        height,
        { 'rounded-md': rounded },
        className
      )}
    />
  );
};

export default SkeletonLoader;
