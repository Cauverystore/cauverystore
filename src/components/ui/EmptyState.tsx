// src/components/ui/EmptyState.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Nothing here yet",
  description = "We couldn't find any results.",
  icon,
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 text-muted-foreground",
        className
      )}
    >
      {icon && <div className="mb-4 text-4xl">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default EmptyState;
