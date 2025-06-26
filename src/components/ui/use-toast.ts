// src/components/ui/use-toast.ts
import { toast as sonnerToast } from "sonner";

type ToastType = "default" | "success" | "error" | "info" | "warning";

interface ToastOptions {
  type?: ToastType;
  description?: string;
  duration?: number;
}

export const useToast = () => {
  const toast = (message: string, options?: ToastOptions) => {
    const { type = "default", description, duration = 3000 } = options || {};

    sonnerToast(message, {
      description,
      duration,
      ...(type !== "default" ? { type } : {}),
    });
  };

  return { toast };
};
