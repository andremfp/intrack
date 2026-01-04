import { stableStringify } from "./stable-stringify";

/**
 * Query key builders for React Query cache management
 *
 * Provides consistent, stable keys for consultations, metrics, and reports.
 * Keys include user context to ensure proper isolation between users.
 */

export const consultations = {
  /**
   * All consultations query keys
   */
  all: ["consultations"] as const,

  /**
   * Prefix for invalidating all consultations for a user/specialty
   */
  prefix: ({
    userId,
    specialtyYear,
  }: {
    userId: string;
    specialtyYear: number;
  }) => [...consultations.all, "list", userId, specialtyYear] as const,

  /**
   * Specific consultations list with pagination, filters, and sorting
   */
  list: ({
    userId,
    specialtyYear,
    page,
    pageSize,
    filters,
    sorting,
  }: {
    userId: string;
    specialtyYear: number;
    page: number;
    pageSize: number;
    filters: Record<string, unknown>;
    sorting: { field: string; order: "asc" | "desc" };
  }) =>
    [
      ...consultations.prefix({ userId, specialtyYear }),
      page,
      pageSize,
      stableStringify(filters),
      stableStringify(sorting),
    ] as const,
};

export const metrics = {
  /**
   * All metrics query keys
   */
  all: ["metrics"] as const,

  /**
   * Prefix for invalidating all metrics for a user/specialty
   */
  prefix: ({
    userId,
    specialtyCode,
  }: {
    userId: string;
    specialtyCode: string;
  }) => [...metrics.all, "summary", userId, specialtyCode] as const,

  /**
   * Specific metrics summary with filters
   */
  summary: ({
    userId,
    specialtyCode,
    filters,
    implicitFilters,
  }: {
    userId: string;
    specialtyCode: string;
    filters: Record<string, unknown>;
    implicitFilters: Record<string, unknown>;
  }) =>
    [
      ...metrics.prefix({ userId, specialtyCode }),
      stableStringify(filters),
      stableStringify(implicitFilters),
    ] as const,
};

export const reports = {
  /**
   * All reports query keys
   */
  all: ["reports"] as const,

  /**
   * Prefix for invalidating all reports for a user/specialty
   */
  prefix: ({
    userId,
    specialtyCode,
  }: {
    userId: string;
    specialtyCode: string;
  }) => [...reports.all, "data", userId, specialtyCode] as const,

  /**
   * Specific report data
   */
  data: ({
    userId,
    specialtyCode,
    reportKey,
  }: {
    userId: string;
    specialtyCode: string;
    reportKey: string;
  }) => [...reports.prefix({ userId, specialtyCode }), reportKey] as const,
};
