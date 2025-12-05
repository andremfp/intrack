import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a date-like value to an ISO calendar date string (YYYY-MM-DD).
 *
 * - If the string already looks like YYYY-MM-DD, it is trimmed to 10 chars.
 * - Otherwise we try to parse it as a Date and convert to YYYY-MM-DD.
 * - If parsing fails, the original value is returned unchanged.
 */
export function normalizeToISODate(date: string): string {
  if (!date) return date;

  // Common case: already an ISO date/time string
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
    return date.slice(0, 10);
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toISOString().split("T")[0];
}

export interface PasswordCriteria {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function validatePasswordCriteria(password: string): PasswordCriteria {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const criteria = validatePasswordCriteria(password);
  return (
    criteria.minLength &&
    criteria.hasUppercase &&
    criteria.hasLowercase &&
    criteria.hasNumber &&
    criteria.hasSpecialChar
  );
}
