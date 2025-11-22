import { toast } from "sonner";
import type { AppError } from "@/errors";

/**
 * Standardized error toast helper
 * Provides consistent error handling patterns across the application
 */
export const errorToast = {
  /**
   * Show error toast from API response error
   */
  fromApiError: (error: AppError, title: string = "Erro") => {
    toast.error(title, {
      description: error.userMessage,
    });
  },

  /**
   * Show error toast with custom message
   */
  show: (title: string, description?: string) => {
    toast.error(title, {
      ...(description && { description }),
    });
  },

  /**
   * Show error toast from API response
   * Handles both success and error cases
   */
  fromApiResponse: <T>(
    response: { success: true; data: T } | { success: false; error: AppError },
    title: string = "Erro"
  ): response is { success: false; error: AppError } => {
    if (!response.success) {
      errorToast.fromApiError(response.error, title);
      return true;
    }
    return false;
  },
};

