import { supabase } from "@/supabase";
import type { ApiResponse } from "@/errors";
import type { Tables, TablesInsert, TablesUpdate } from "@/schema";
import { success, failure, AppError, ErrorMessages } from "@/errors";
import { normalizeToISODate } from "@/utils/utils";
import {
  getDefaultSpecialtyDetails,
  type SpecialtyDetails,
  PAGINATION_CONSTANTS,
  type ConsultationsSortingField,
} from "@/constants";
import { sortConsultationsWithFavorites } from "@/lib/api/helpers";
import { checkRateLimit, clearRateLimitCache } from "@/lib/api/rate-limit";
import type { RateLimitOperation } from "@/lib/api/rate-limit";
import {
  calculateMetrics,
  getEmptyMetrics,
  type ConsultationMetrics,
} from "@/lib/api/consultation-metrics";
import {
  applyMGFFilters,
  type ConsultationsFilters,
} from "@/lib/api/consultation-filters";
export type { ConsultationMetrics } from "@/lib/api/consultation-metrics";
export type { ConsultationsFilters } from "@/lib/api/consultation-filters";
export { calculateMetrics, getEmptyMetrics };

export type Consultation = Tables<"consultations">;
export type ConsultationInsert = TablesInsert<"consultations">;
export type ConsultationUpdate = TablesUpdate<"consultations">;
export type ConsultationMGF = Tables<"consultations_mgf">;

async function ensureOperationAllowed(
  operation: RateLimitOperation
): Promise<AppError | null> {
  const result = await checkRateLimit(operation, undefined, { force: true });
  if (!result.success) {
    return result.error;
  }
  if (!result.data.allowed) {
    return new AppError(ErrorMessages.TOO_MANY_REQUESTS);
  }

  return null;
}

function successWithClear<T>(
  data: T,
  operation: RateLimitOperation
): ApiResponse<T> {
  clearRateLimitCache(operation);
  return success(data);
}

/**
 * Prepares complete details object for a consultation
 * Merges provided details with default specialty fields
 */
export function prepareConsultationDetails(
  specialtyCode: string,
  providedDetails: SpecialtyDetails
): SpecialtyDetails {
  const defaultDetails = getDefaultSpecialtyDetails(specialtyCode);
  return { ...defaultDetails, ...providedDetails };
}

export async function getConsultation(
  id: string
): Promise<ApiResponse<Consultation>> {
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return failure(error, "getConsultation");
  if (!data) {
    return failure(new AppError("Consulta não encontrada."), "getConsultation");
  }

  return success(data);
}

export async function createConsultation(
  consultation: ConsultationInsert
): Promise<ApiResponse<Consultation>> {
  const { data, error } = await supabase
    .from("consultations")
    .insert(consultation)
    .select()
    .single();

  if (error) return failure(error, "createConsultation");
  if (!data) {
    return failure(
      new AppError("Erro ao criar consulta."),
      "createConsultation"
    );
  }

  return success(data);
}

export async function updateConsultation(
  id: string,
  consultation: ConsultationUpdate
): Promise<ApiResponse<Consultation>> {
  const { data, error } = await supabase
    .from("consultations")
    .update(consultation)
    .eq("id", id)
    .select()
    .single();

  if (error) return failure(error, "updateConsultation");
  if (!data) {
    return failure(
      new AppError("Erro ao atualizar consulta."),
      "updateConsultation"
    );
  }

  return success(data);
}

export async function deleteConsultation(
  id: string
): Promise<ApiResponse<void>> {
  const { error } = await supabase.from("consultations").delete().eq("id", id);

  if (error) return failure(error, "deleteConsultation");
  return success();
}

export async function createConsultationsBatch(
  consultations: ConsultationInsert[]
): Promise<
  ApiResponse<{
    created: number;
    errors: Array<{ index: number; error: string }>;
  }>
> {
  const rateLimitError = await ensureOperationAllowed("import");
  if (rateLimitError) {
    return failure(rateLimitError, "createConsultationsBatch");
  }

  if (consultations.length === 0) {
    return success({ created: 0, errors: [] });
  }

  // Supabase supports batch insert, but we need to handle errors per row
  // We'll insert in chunks to avoid overwhelming the database
  const CHUNK_SIZE = 100;
  const chunks: ConsultationInsert[][] = [];
  for (let i = 0; i < consultations.length; i += CHUNK_SIZE) {
    chunks.push(consultations.slice(i, i + CHUNK_SIZE));
  }

  let totalCreated = 0;
  const errors: Array<{ index: number; error: string }> = [];
  let globalIndex = 0;

  for (const chunk of chunks) {
    const { data, error } = await supabase
      .from("consultations")
      .insert(chunk)
      .select();

    if (error) {
      // If batch insert fails, try inserting one by one to identify problematic rows
      for (let i = 0; i < chunk.length; i++) {
        const consultation = chunk[i];
        const { error: singleError } = await supabase
          .from("consultations")
          .insert(consultation)
          .select()
          .single();

        if (singleError) {
          errors.push({
            index: globalIndex + i,
            error: singleError.message || "Erro desconhecido",
          });
        } else {
          totalCreated++;
        }
      }
    } else {
      totalCreated += data?.length || 0;
    }

    globalIndex += chunk.length;
  }

  return successWithClear({ created: totalCreated, errors }, "import");
}

/**
 * Fetches all consultations for a user in a given date range (inclusive).
 * Used by the import flow to detect duplicates by (date + process_number).
 */
export async function getUserConsultationsInDateRange(
  userId: string,
  dateFrom: string,
  dateTo: string
): Promise<ApiResponse<Consultation[]>> {
  const normalizedFrom = normalizeToISODate(dateFrom);
  const normalizedTo = normalizeToISODate(dateTo);

  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("user_id", userId)
    .gte("date", normalizedFrom)
    .lte("date", normalizedTo);

  if (error) return failure(error, "getUserConsultationsInDateRange");
  return success(data || []);
}

/**
 * Fetches a single consultation by (user_id, date, process_number).
 * Returns null when no consultation exists for that key.
 */
export async function getConsultationByDateAndProcessNumber(params: {
  userId: string;
  date: string;
  processNumber: number;
}): Promise<ApiResponse<Consultation | null>> {
  const normalizedDate = normalizeToISODate(params.date);

  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("user_id", params.userId)
    .eq("date", normalizedDate)
    .eq("process_number", params.processNumber)
    .limit(1);

  if (error) return failure(error, "getConsultationByDateAndProcessNumber");

  const consultation = Array.isArray(data) && data.length > 0 ? data[0] : null;
  return success(consultation);
}

// Generic sorting options for consultations (works for any specialty)
export interface ConsultationsSorting extends Record<string, unknown> {
  field: ConsultationsSortingField;
  order: "asc" | "desc";
}

// MGF-specific view queries
export async function getMGFConsultations(
  userId?: string,
  specialtyYear?: number,
  page: number = 1,
  pageSize: number = PAGINATION_CONSTANTS.CONSULTATIONS_PAGE_SIZE,
  filters?: ConsultationsFilters,
  sorting?: ConsultationsSorting
): Promise<
  ApiResponse<{ consultations: ConsultationMGF[]; totalCount: number }>
> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("consultations_mgf")
    .select("*", { count: "exact" });

  // Apply user filter
  if (userId) {
    query = query.eq("user_id", userId);
  }

  // Apply specialty year filter
  if (specialtyYear !== undefined) {
    query = query.eq("specialty_year", specialtyYear);
  }

  // Apply additional filters
  if (filters) {
    query = applyMGFFilters(query, filters);
  }

  // Apply sorting (default to date descending)
  const sortField = sorting?.field || "date";
  const sortOrder = sorting?.order || "desc";

  // Special handling for age sorting - need to convert all ages to years first
  // Since Supabase doesn't support computed expressions in ORDER BY, we need to
  // fetch all matching records, sort in JavaScript, then apply pagination
  if (sortField === "age") {
    // Fetch all matching records (without pagination limit)
    const { data: allData, error, count } = await query;

    if (error) return failure(error, "getMGFConsultations");
    if (!allData) return success({ consultations: [], totalCount: 0 });

    // Sort by favorites first, then by age using utility function
    const sortedData = sortConsultationsWithFavorites(allData, {
      field: "age",
      order: sortOrder,
    });

    // Apply pagination manually
    const paginatedData = sortedData.slice(from, to + 1);

    return success({
      consultations: paginatedData,
      totalCount: count || 0,
    });
  }

  // For non-age sorting, use database sorting
  // Sort by favorites first (favorites at top), then by the selected field
  query = query
    .order("favorite", { ascending: false, nullsFirst: false })
    .order(sortField, { ascending: sortOrder === "asc" });

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) return failure(error, "getMGFConsultations");
  if (!data) return success({ consultations: [], totalCount: 0 });

  return success({
    consultations: data,
    totalCount: count || 0,
  });
}

export async function getMGFConsultationsForExport(
  userId: string,
  specialtyYear?: number,
  filters?: ConsultationsFilters,
  sorting?: ConsultationsSorting,
  maxRows: number = 10000
): Promise<ApiResponse<ConsultationMGF[]>> {
  if (!userId) {
    return success([]);
  }

  const rateLimitError = await ensureOperationAllowed("export");
  if (rateLimitError) {
    return failure(rateLimitError, "getMGFConsultationsForExport");
  }

  let query = supabase
    .from("consultations_mgf")
    .select("*")
    .eq("user_id", userId)
    .limit(maxRows);

  if (specialtyYear !== undefined) {
    query = query.eq("specialty_year", specialtyYear);
  }

  if (filters) {
    query = applyMGFFilters(query, filters);
  }

  const sortField = sorting?.field || "date";
  const sortOrder = sorting?.order || "desc";

  if (sortField === "age") {
    const { data, error } = await query;

    if (error) return failure(error, "getMGFConsultationsForExport");
    if (!data) return successWithClear([], "export");

    const sortedData = sortConsultationsWithFavorites(data, {
      field: "age",
      order: sortOrder,
    });

    return successWithClear(sortedData, "export");
  }

  query = query
    .order("favorite", { ascending: false, nullsFirst: false })
    .order(sortField, { ascending: sortOrder === "asc" });

  const { data, error } = await query;

  if (error) return failure(error, "getMGFConsultationsForExport");
  if (!data) return successWithClear([], "export");

  return successWithClear(data, "export");
}

// Type for Supabase client that allows dynamic table/view names
type SupabaseWithDynamicFrom = typeof supabase & {
  from: (relation: string) => ReturnType<typeof supabase.from>;
};

// Fetch aggregated metrics for consultations
// Accepts ConsultationsFilters and converts year to specialtyYear internally
export async function getConsultationMetrics(
  userId: string,
  filters?: ConsultationsFilters,
  specialtyCode?: string,
  excludeType?: string
): Promise<ApiResponse<ConsultationMetrics>> {
  try {
    // Build query with database-level filtering
    const viewName = specialtyCode
      ? `consultations_${specialtyCode}`
      : "consultations_mgf";

    // Use typed client that allows dynamic view names
    // Supabase types are strict but these views exist in the database
    const typedSupabase = supabase as SupabaseWithDynamicFrom;
    let query = typedSupabase.from(viewName).select("*").eq("user_id", userId);

    query = applyMGFFilters(query, filters ?? {}, excludeType);

    const { data, error } = await query;

    if (error) return failure(error, "getConsultationMetrics");
    if (!data) return success(getEmptyMetrics());

    // Calculate metrics (data is already filtered at database level)
    const metrics = calculateMetrics(data as unknown as ConsultationMGF[]);
    return success(metrics);
  } catch (error) {
    return failure(error as Error, "getConsultationMetrics");
  }
}

export interface TimeSeriesDataPoint {
  date: string; // YYYY-MM-DD format
  count: number;
}

/**
 * Fetch timeseries data aggregated by day for consultations.
 * This is optimized for chart display with date range filtering.
 */
export async function getConsultationTimeSeries(
  userId: string,
  filters?: ConsultationsFilters,
  specialtyCode?: string,
  excludeType?: string
): Promise<ApiResponse<TimeSeriesDataPoint[]>> {
  try {
    // Build query with database-level filtering
    const viewName = specialtyCode
      ? `consultations_${specialtyCode}`
      : "consultations_mgf";

    // Use typed client that allows dynamic view names
    const typedSupabase = supabase as SupabaseWithDynamicFrom;
    let query = typedSupabase
      .from(viewName)
      .select("date")
      .eq("user_id", userId);

    query = applyMGFFilters(query, filters ?? {}, excludeType);

    const { data, error } = await query;

    if (error) return failure(error, "getConsultationTimeSeries");
    if (!data) return success([]);

    // Aggregate by day
    const dayCounts = new Map<string, number>();
    (data as Array<{ date: string }>).forEach((c) => {
      if (c.date) {
        // Normalize date to YYYY-MM-DD format
        const dateStr = c.date.split("T")[0];
        dayCounts.set(dateStr, (dayCounts.get(dateStr) || 0) + 1);
      }
    });

    // Convert to array and sort by date
    const timeSeriesData: TimeSeriesDataPoint[] = Array.from(
      dayCounts.entries()
    )
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return success(timeSeriesData);
  } catch (error) {
    return failure(error as Error, "getConsultationTimeSeries");
  }
}

