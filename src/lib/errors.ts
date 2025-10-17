// Simple app error with user-friendly message
export class AppError extends Error {
  userMessage: string;
  details: unknown | undefined;

  constructor(userMessage: string, details: unknown | undefined = undefined) {
    super(userMessage);
    this.name = "AppError";
    this.userMessage = userMessage;
    this.details = details;
  }
}

// Common error messages in Portuguese
export const ErrorMessages = {
  USER_NOT_FOUND: "Não foi possível carregar o seu perfil.",
  AUTH_FAILED: "Erro de autenticação. Por favor, faça login novamente.",
  NETWORK: "Erro de conexão. Verifique a sua internet.",
  UNKNOWN: "Ocorreu um erro inesperado. Tente novamente.",
  SPECIALTY_NOT_FOUND: "Especialidade não encontrada.",
  SPECIALTY_LOAD_FAILED: "Não foi possível carregar as especialidades.",
  SPECIALTY_UPDATE_FAILED: "Não foi possível atualizar a especialidade.",
  NO_FIELDS_TO_UPDATE: "Nenhum campo para atualizar.",
  DELETE_ACCOUNT_FAILED: "Não foi possível eliminar a conta.",
} as const;

// Convert any error to AppError with friendly message
export function handleError(error: unknown, context?: string): AppError {
  // Always log for developers (even if it's already an AppError)
  const prefix = context ? `[${context}]` : "";

  if (error instanceof AppError) {
    // Log the user-friendly message
    console.error(`${prefix} AppError:`, error.userMessage);
    // Also log technical details if available
    if (error.details) {
      console.error(`${prefix} Details:`, error.details);
    }
    return error;
  }

  // Log the raw error
  console.error(`${prefix} Error:`, error);

  // Supabase errors
  if (error && typeof error === "object" && "code" in error) {
    const supaError = error as { code: string };
    if (supaError.code === "PGRST116") {
      return new AppError(ErrorMessages.USER_NOT_FOUND, error);
    }
  }

  // Network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new AppError(ErrorMessages.NETWORK, error);
  }

  // Default
  return new AppError(ErrorMessages.UNKNOWN, error);
}

// API Response type
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

// Helpers
export function success<T = void>(data?: T): ApiResponse<T> {
  return { success: true, data: data as T };
}

export function failure<T = void>(
  error: unknown,
  context?: string
): ApiResponse<T> {
  return { success: false, error: handleError(error, context) };
}
