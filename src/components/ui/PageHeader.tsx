import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, className = "" }) => {
  return (
    <div className={`mb-6 text-center ${className}`}>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </div>
  );
};

export default PageHeader;
