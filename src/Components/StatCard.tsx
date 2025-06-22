import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  growth?: string;
  color?: string; // Tailwind color utility e.g. "green", "red", "yellow"
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  growth,
  color = 'green',
}) => {
  const colorClass = `text-${color}-600 dark:text-${color}-400`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h2>
        {growth && (
          <p className={`text-xs mt-1 font-medium ${colorClass}`}>
            {growth}
          </p>
        )}
      </div>
      {icon && (
        <div className={`text-3xl ${colorClass}`}>
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatCard;
