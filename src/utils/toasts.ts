import { toast } from "sonner";
import type { AppError } from "@/errors";

/**
 * Standardized toast helper
 * Provides consistent toast handling patterns across the application
 */
export const toasts = {
  /**
   * Show error toast from API response error
   */
  apiError: (error: AppError, title: string = "Erro") => {
    toast.error(title, {
      description: error.userMessage,
      closeButton: true,
    });
  },

  /**
   * Show error toast with custom message
   */
  error: (title: string, description?: string) => {
    toast.error(title, {
      ...(description && { description }),
      closeButton: true,
    });
  },

  /**
   * Show success toast
   */
  success: (title: string, description?: string) => {
    toast.success(title, {
      ...(description && { description }),
      closeButton: true,
    });
  },

  /**
   * Show warning toast
   */
  warning: (title: string, description?: string) => {
    toast.warning(title, {
      ...(description && { description }),
      closeButton: true,
    });
  },
};

