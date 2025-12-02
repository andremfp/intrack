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
