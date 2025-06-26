// src/components/ui/ErrorAlert.tsx
import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  message: string;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, className }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-red-500 bg-red-100 px-4 py-2 text-sm text-red-700",
        className
      )}
    >
      <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorAlert;
