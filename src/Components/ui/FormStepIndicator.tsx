// src/components/ui/FormStepIndicator.tsx
import React from 'react';

interface FormStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

const FormStepIndicator: React.FC<FormStepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels = [],
}) => {
  const getStepClass = (index: number) => {
    if (index < currentStep) return 'bg-green-600 text-white';
    if (index === currentStep) return 'bg-blue-600 text-white';
    return 'bg-gray-300 text-gray-700';
  };

  return (
    <div className="flex items-center justify-center gap-4 my-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${getStepClass(i)}`}
          >
            {i + 1}
          </div>
          {stepLabels[i] && (
            <span className="mt-1 text-xs text-center max-w-[80px]">{stepLabels[i]}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default FormStepIndicator;
