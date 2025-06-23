// src/components/SectionCard.tsx
import React from 'react';

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children, className = '' }) => {
  return (
    <section className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-6 ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h2>}
      {children}
    </section>
  );
};

export default SectionCard;
