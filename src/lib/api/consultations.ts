import { supabase } from "@/supabase";
import type { ApiResponse } from "@/errors";
import type { Tables, TablesInsert, TablesUpdate } from "@/schema";
import { success, failure, AppError, ErrorMessages } from "@/errors";
import { normalizeToISODate } from "@/utils/utils";
import {
  getDefaultSpecialtyDetails,
  type SpecialtyDetails,
  PAGINATION_CONSTANTS,
  MGF_FIELDS,
  ageToYears,
  type ConsultationsSortingField,
} from "@/constants";
import { sortConsultationsWithFavorites } from "@/lib/api/helpers";
import { checkRateLimit, clearRateLimitCache } from "@/lib/api/rate-limit";
import type { RateLimitOperation } from "@/lib/api/rate-limit";

export type Consultation = Tables<"consultations">;
export type ConsultationInsert = TablesInsert<"consultations">;
export type ConsultationUpdate = TablesUpdate<"consultations">;
export type ConsultationMGF = Tables<"consultations_mgf">;

/**
 * Consultation filter state type with all possible filter fields.
 * All fields are optional to support different use cases (metrics, consultations, etc.)
 * This is the single source of truth for all consultation filter types.
 */
export type ConsultationsFilters = {
  year?: number;
  location?: string;
  internship?: string;
  processNumber?: string;
  sex?: string;
  autonomy?: string;
  ageMin?: number;
  ageMax?: number;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  presential?: boolean;
  smoker?: string;
  contraceptive?: string;
  new_contraceptive?: string;
  family_type?: string;
  school_level?: string;
  profession?: string;
  professional_situation?: string;
  vaccination_plan?: boolean;
  alcohol?: boolean;
  drugs?: boolean;
};

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
    if (filters.sex) {
      query = query.eq("sex", filters.sex);
    }

    // Age filtering with unit conversion to years
    // For age filtering, we need to consider age_unit and convert to a common unit (years)
    if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
      // Build filter conditions for each unit type
      const conditions: string[] = [];

      // For years
      let yearsCondition = "age_unit.eq.years";
      if (filters.ageMin !== undefined) {
        yearsCondition += `,age.gte.${filters.ageMin}`;
      }
      if (filters.ageMax !== undefined) {
        yearsCondition += `,age.lte.${filters.ageMax}`;
      }
      conditions.push(`and(${yearsCondition})`);

      // For months (convert years to months)
      let monthsCondition = "age_unit.eq.months";
      if (filters.ageMin !== undefined) {
        monthsCondition += `,age.gte.${filters.ageMin * 12}`;
      }
      if (filters.ageMax !== undefined) {
        monthsCondition += `,age.lte.${filters.ageMax * 12}`;
      }
      conditions.push(`and(${monthsCondition})`);

      // For weeks (convert years to weeks)
      let weeksCondition = "age_unit.eq.weeks";
      if (filters.ageMin !== undefined) {
        weeksCondition += `,age.gte.${filters.ageMin * 52}`;
      }
      if (filters.ageMax !== undefined) {
        weeksCondition += `,age.lte.${filters.ageMax * 52}`;
      }
      conditions.push(`and(${weeksCondition})`);

      // For days (convert years to days)
      let daysCondition = "age_unit.eq.days";
      if (filters.ageMin !== undefined) {
        daysCondition += `,age.gte.${Math.floor(filters.ageMin * 365)}`;
      }
      if (filters.ageMax !== undefined) {
        daysCondition += `,age.lte.${Math.floor(filters.ageMax * 365)}`;
      }
      conditions.push(`and(${daysCondition})`);

      // Combine all conditions with OR
      query = query.or(conditions.join(","));
    }
    if (filters.type) {
      query = query.eq("type", filters.type);
    }
    if (filters.presential !== undefined) {
      query = query.eq("presential", filters.presential);
    }
    if (filters.smoker !== undefined) {
      query = query.eq("smoker", filters.smoker);
    }
    if (filters.processNumber) {
      query = query.eq("process_number", parseInt(filters.processNumber));
    }
    if (filters.location) {
      query = query.eq("location", filters.location);
    }
    if (filters.autonomy) {
      query = query.eq("autonomy", filters.autonomy);
    }
    if (filters.dateFrom) {
      query = query.gte("date", filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte("date", filters.dateTo);
    }
    if (filters.internship) {
      query = query.eq("details->>internship", filters.internship);
    }
    if (filters.contraceptive) {
      query = query.eq("details->>contraceptive", filters.contraceptive);
    }
    if (filters.new_contraceptive) {
      query = query.eq(
        "details->>new_contraceptive",
        filters.new_contraceptive
      );
    }
    if (filters.professional_situation) {
      query = query.eq(
        "details->>professional_situation",
        filters.professional_situation
      );
    }
    if (filters.profession) {
      query = query.eq("details->>profession", filters.profession);
    }
    if (filters.alcohol !== undefined) {
      query = query.eq("alcohol", filters.alcohol);
    }
    if (filters.drugs !== undefined) {
      query = query.eq("drugs", filters.drugs);
    }
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
    if (filters.sex) {
      query = query.eq("sex", filters.sex);
    }

    if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
      const conditions: string[] = [];

      let yearsCondition = "age_unit.eq.years";
      if (filters.ageMin !== undefined) {
        yearsCondition += `,age.gte.${filters.ageMin}`;
      }
      if (filters.ageMax !== undefined) {
        yearsCondition += `,age.lte.${filters.ageMax}`;
      }
      conditions.push(`and(${yearsCondition})`);

      let monthsCondition = "age_unit.eq.months";
      if (filters.ageMin !== undefined) {
        monthsCondition += `,age.gte.${filters.ageMin * 12}`;
      }
      if (filters.ageMax !== undefined) {
        monthsCondition += `,age.lte.${filters.ageMax * 12}`;
      }
      conditions.push(`and(${monthsCondition})`);

      let weeksCondition = "age_unit.eq.weeks";
      if (filters.ageMin !== undefined) {
        weeksCondition += `,age.gte.${filters.ageMin * 52}`;
      }
      if (filters.ageMax !== undefined) {
        weeksCondition += `,age.lte.${filters.ageMax * 52}`;
      }
      conditions.push(`and(${weeksCondition})`);

      let daysCondition = "age_unit.eq.days";
      if (filters.ageMin !== undefined) {
        daysCondition += `,age.gte.${Math.floor(filters.ageMin * 365)}`;
      }
      if (filters.ageMax !== undefined) {
        daysCondition += `,age.lte.${Math.floor(filters.ageMax * 365)}`;
      }
      conditions.push(`and(${daysCondition})`);

      query = query.or(conditions.join(","));
    }

    if (filters.type) {
      query = query.eq("type", filters.type);
    }
    if (filters.presential !== undefined) {
      query = query.eq("presential", filters.presential);
    }
    if (filters.smoker !== undefined) {
      query = query.eq("smoker", filters.smoker);
    }
    if (filters.processNumber) {
      query = query.eq("process_number", parseInt(filters.processNumber));
    }
    if (filters.location) {
      query = query.eq("location", filters.location);
    }
    if (filters.autonomy) {
      query = query.eq("autonomy", filters.autonomy);
    }
    if (filters.dateFrom) {
      query = query.gte("date", filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte("date", filters.dateTo);
    }
    if (filters.internship) {
      query = query.eq("details->>internship", filters.internship);
    }
    if (filters.contraceptive) {
      query = query.eq("details->>contraceptive", filters.contraceptive);
    }
    if (filters.new_contraceptive) {
      query = query.eq(
        "details->>new_contraceptive",
        filters.new_contraceptive
      );
    }
    if (filters.professional_situation) {
      query = query.eq(
        "details->>professional_situation",
        filters.professional_situation
      );
    }
    if (filters.profession) {
      query = query.eq("details->>profession", filters.profession);
    }
    if (filters.alcohol !== undefined) {
      query = query.eq("alcohol", filters.alcohol);
    }
    if (filters.drugs !== undefined) {
      query = query.eq("drugs", filters.drugs);
    }
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

// Metrics types
export interface ConsultationMetrics {
  totalConsultations: number;
  averageAge: number;
  byMonth: Array<{ month: string; count: number }>;
  bySex: Array<{ sex: string; count: number }>;
  byAgeRange: Array<{ range: string; count: number }>;
  byType: Array<{ type: string; label: string; count: number }>;
  byPresential: Array<{ presential: string; count: number }>;
  bySmoker: Array<{ smoker: string; count: number }>;
  byVaccinationPlan: Array<{ vaccinationPlan: string; count: number }>;
  byFamilyType: Array<{ familyType: string; count: number }>;
  bySchoolLevel: Array<{ schoolLevel: string; count: number }>;
  byProfessionalSituation: Array<{
    professionalSituation: string;
    count: number;
  }>;
  byContraceptive: Array<{ contraceptive: string; count: number }>;
  byNewContraceptive: Array<{ newContraceptive: string; count: number }>;
  byDiagnosis: Array<{ code: string; count: number }>;
  byProblems: Array<{ code: string; count: number }>;
  byNewDiagnosis: Array<{ code: string; count: number }>;
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

    // Convert year to specialtyYear for API compatibility
    const specialtyYear = filters?.year;
    if (specialtyYear !== undefined) {
      query = query.eq("specialty_year", specialtyYear);
    }

    if (filters?.location) {
      query = query.eq("location", filters.location);
    }

    // Filter by internship at database level using JSONB operator (details->>internship)
    // This is more efficient than fetching all data and filtering in JavaScript
    if (filters?.internship) {
      query = query.ilike("details->>internship", filters.internship);
    }

    if (filters?.family_type) {
      query = query.eq("details->>family_type", filters.family_type);
    }

    if (filters?.school_level) {
      query = query.eq("details->>school_level", filters.school_level);
    }

    if (filters?.profession) {
      // Profession can be stored as just the code (from forms) or "CODE - Description" (from imports)
      // Use ilike with pattern to match both formats
      query = query.ilike("details->>profession", `${filters.profession}%`);
    }

    if (filters?.vaccination_plan !== undefined) {
      query = query.eq("vaccination_plan", filters.vaccination_plan);
    }

    if (filters?.professional_situation) {
      query = query.eq(
        "details->>professional_situation",
        filters.professional_situation
      );
    }

    if (filters?.alcohol !== undefined) {
      query = query.eq("alcohol", filters.alcohol);
    }

    if (filters?.drugs !== undefined) {
      query = query.eq("drugs", filters.drugs);
    }

    if (filters?.sex) {
      query = query.eq("sex", filters.sex);
    }

    if (filters?.autonomy) {
      query = query.eq("autonomy", filters.autonomy);
    }

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }

    // Exclude specific type if requested (e.g., exclude 'AM' for general tab)
    if (excludeType) {
      query = query.neq("type", excludeType);
    }

    if (filters?.presential !== undefined) {
      query = query.eq("presential", filters.presential);
    }

    if (filters?.smoker) {
      query = query.eq("smoker", filters.smoker);
    }

    // Age filtering with unit conversion to years
    if (filters?.ageMin !== undefined || filters?.ageMax !== undefined) {
      const conditions: string[] = [];

      // For years
      let yearsCondition = "age_unit.eq.years";
      if (filters.ageMin !== undefined) {
        yearsCondition += `,age.gte.${filters.ageMin}`;
      }
      if (filters.ageMax !== undefined) {
        yearsCondition += `,age.lte.${filters.ageMax}`;
      }
      conditions.push(`and(${yearsCondition})`);

      // For months (convert years to months)
      let monthsCondition = "age_unit.eq.months";
      if (filters.ageMin !== undefined) {
        monthsCondition += `,age.gte.${filters.ageMin * 12}`;
      }
      if (filters.ageMax !== undefined) {
        monthsCondition += `,age.lte.${filters.ageMax * 12}`;
      }
      conditions.push(`and(${monthsCondition})`);

      // For weeks (convert years to weeks)
      let weeksCondition = "age_unit.eq.weeks";
      if (filters.ageMin !== undefined) {
        weeksCondition += `,age.gte.${Math.floor(filters.ageMin * 52.1429)}`;
      }
      if (filters.ageMax !== undefined) {
        weeksCondition += `,age.lte.${Math.ceil(filters.ageMax * 52.1429)}`;
      }
      conditions.push(`and(${weeksCondition})`);

      // For days (convert years to days)
      let daysCondition = "age_unit.eq.days";
      if (filters.ageMin !== undefined) {
        daysCondition += `,age.gte.${Math.floor(filters.ageMin * 365.25)}`;
      }
      if (filters.ageMax !== undefined) {
        daysCondition += `,age.lte.${Math.ceil(filters.ageMax * 365.25)}`;
      }
      conditions.push(`and(${daysCondition})`);

      // Combine all conditions with OR
      query = query.or(conditions.join(","));
    }

    // Date range filtering
    if (filters?.dateFrom) {
      query = query.gte("date", filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte("date", filters.dateTo);
    }

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

function getEmptyMetrics(): ConsultationMetrics {
  return {
    totalConsultations: 0,
    averageAge: 0,
    byMonth: [],
    bySex: [],
    byAgeRange: [],
    byType: [],
    byPresential: [],
    bySmoker: [],
    byVaccinationPlan: [],
    byFamilyType: [],
    bySchoolLevel: [],
    byProfessionalSituation: [],
    byContraceptive: [],
    byNewContraceptive: [],
    byDiagnosis: [],
    byProblems: [],
    byNewDiagnosis: [],
  };
}

function calculateMetrics(
  consultations: ConsultationMGF[]
): ConsultationMetrics {
  // Helper to safely extract values from details JSONB
  const getDetail = (c: ConsultationMGF, key: string): unknown => {
    if (!c.details || typeof c.details !== "object") return null;
    return (c.details as Record<string, unknown>)[key] ?? null;
  };

  const typeValueToLabel = new Map(
    (MGF_FIELDS.find((field) => field.key === "type")?.options ?? []).map(
      (option) => [option.value, option.label]
    )
  );
  // Initialize all metric maps and counters in single pass
  const totalConsultations = consultations.length;
  let totalAgeInYears = 0;
  let validAgeCount = 0;

  // Age range buckets: 0-17, 18-44, 45-64, 65+
  const ageRangeBuckets: {
    label: string;
    min: number;
    max?: number;
    count: number;
  }[] = [
    { label: "0-17", min: 0, max: 17, count: 0 },
    { label: "18-44", min: 18, max: 44, count: 0 },
    { label: "45-64", min: 45, max: 64, count: 0 },
    { label: "65+", min: 65, count: 0 },
  ];

  // Initialize all maps for counting
  const monthCounts = new Map<string, number>();
  const sexCounts = new Map<string, number>();
  const typeCounts = new Map<string, number>();
  const presentialCounts = new Map<string, number>();
  const smokerCounts = new Map<string, number>();
  const vaccinationPlanCounts = new Map<string, number>();
  const familyTypeCounts = new Map<string, number>();
  const schoolLevelCounts = new Map<string, number>();
  const professionalSituationCounts = new Map<string, number>();
  const contraceptiveCounts = new Map<string, number>();
  const newContraceptiveCounts = new Map<string, number>();
  const diagnosisCounts = new Map<string, number>();
  const problemsCounts = new Map<string, number>();
  const newDiagnosisCounts = new Map<string, number>();

  // Single-pass iteration through all consultations
  consultations.forEach((c) => {
    // Age calculations (average age and age ranges)
    if (c.age !== null && c.age !== undefined && c.age_unit) {
      const ageYears = ageToYears(c.age, c.age_unit);
      totalAgeInYears += ageYears;
      validAgeCount += 1;

      const age = Math.floor(ageYears);
      const bucket = ageRangeBuckets.find((b) =>
        b.max !== undefined ? age >= b.min && age <= b.max : age >= b.min
      );
      if (bucket) bucket.count += 1;
    }

    // Month grouping
    if (c.date) {
      const date = new Date(c.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
    }

    // Sex counting
    if (c.sex) {
      sexCounts.set(c.sex, (sexCounts.get(c.sex) || 0) + 1);
    }

    // Type counting
    if (c.type) {
      let typeValue: string;
      if (typeof c.type === "string") {
        typeValue = c.type;
      } else if (typeof c.type === "object" && c.type !== null) {
        typeValue = JSON.stringify(c.type);
      } else {
        return;
      }
      typeCounts.set(typeValue, (typeCounts.get(typeValue) || 0) + 1);
    }

    // Presential counting
    if (c.presential !== null && c.presential !== undefined) {
      const key = c.presential ? "true" : "false";
      presentialCounts.set(key, (presentialCounts.get(key) || 0) + 1);
    }

    // Smoker counting
    if (c.smoker !== null && c.smoker !== undefined) {
      smokerCounts.set(c.smoker, (smokerCounts.get(c.smoker) || 0) + 1);
    }

    // Vaccination plan counting
    if (c.vaccination_plan !== null && c.vaccination_plan !== undefined) {
      const key = c.vaccination_plan ? "true" : "false";
      vaccinationPlanCounts.set(key, (vaccinationPlanCounts.get(key) || 0) + 1);
    }

    // Family type counting
    if (c.family_type !== null && c.family_type !== undefined) {
      familyTypeCounts.set(
        c.family_type,
        (familyTypeCounts.get(c.family_type) || 0) + 1
      );
    }

    // School level counting
    if (c.school_level !== null && c.school_level !== undefined) {
      schoolLevelCounts.set(
        c.school_level,
        (schoolLevelCounts.get(c.school_level) || 0) + 1
      );
    }

    // Professional situation counting
    if (
      c.professional_situation !== null &&
      c.professional_situation !== undefined
    ) {
      professionalSituationCounts.set(
        c.professional_situation,
        (professionalSituationCounts.get(c.professional_situation) || 0) + 1
      );
    }

    // Contraceptive counting
    const contraceptive = getDetail(c, "contraceptive");
    if (contraceptive && typeof contraceptive === "string") {
      contraceptiveCounts.set(
        contraceptive,
        (contraceptiveCounts.get(contraceptive) || 0) + 1
      );
    }

    // New contraceptive counting
    const newContraceptive = getDetail(c, "new_contraceptive");
    if (newContraceptive) {
      const key =
        typeof newContraceptive === "string" ? newContraceptive : "Sim";
      newContraceptiveCounts.set(
        key,
        (newContraceptiveCounts.get(key) || 0) + 1
      );
    }

    // Diagnosis codes counting
    const diagnosis = getDetail(c, "diagnosis");
    const diagnosisCodes = Array.isArray(diagnosis) ? diagnosis : [];
    diagnosisCodes.forEach((code) => {
      const normalized = String(code).trim();
      if (normalized) {
        diagnosisCounts.set(
          normalized,
          (diagnosisCounts.get(normalized) || 0) + 1
        );
      }
    });

    // Problems codes counting
    const problems = getDetail(c, "problems");
    const problemsCodes = Array.isArray(problems) ? problems : [];
    problemsCodes.forEach((code) => {
      const normalized = String(code).trim();
      if (normalized) {
        problemsCounts.set(
          normalized,
          (problemsCounts.get(normalized) || 0) + 1
        );
      }
    });

    // New diagnosis codes counting
    const newDiagnosis = getDetail(c, "new_diagnosis");
    const newDiagnosisCodes = Array.isArray(newDiagnosis) ? newDiagnosis : [];
    newDiagnosisCodes.forEach((code) => {
      const normalized = String(code).trim();
      if (normalized) {
        newDiagnosisCounts.set(
          normalized,
          (newDiagnosisCounts.get(normalized) || 0) + 1
        );
      }
    });
  });
  // Calculate final metrics using data from single-pass iteration
  const averageAge = validAgeCount > 0 ? totalAgeInYears / validAgeCount : 0;

  const byAgeRange = ageRangeBuckets
    .filter((b) => b.count > 0)
    .map((b) => ({ range: b.label, count: b.count }));

  const byMonth = Array.from(monthCounts.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const bySex = Array.from(sexCounts.entries()).map(([sex, count]) => ({
    sex,
    count,
  }));

  const byType = Array.from(typeCounts.entries())
    .map(([type, count]) => ({
      type,
      label: typeValueToLabel.get(type) ?? type,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const byPresential = Array.from(presentialCounts.entries()).map(
    ([presential, count]) => ({
      presential,
      count,
    })
  );

  const bySmoker = Array.from(smokerCounts.entries()).map(
    ([smoker, count]) => ({
      smoker,
      count,
    })
  );

  const byVaccinationPlan = Array.from(vaccinationPlanCounts.entries()).map(
    ([vaccinationPlan, count]) => ({ vaccinationPlan, count })
  );

  const byFamilyType = Array.from(familyTypeCounts.entries()).map(
    ([familyType, count]) => ({ familyType, count })
  );

  const bySchoolLevel = Array.from(schoolLevelCounts.entries()).map(
    ([schoolLevel, count]) => ({ schoolLevel, count })
  );

  const byProfessionalSituation = Array.from(
    professionalSituationCounts.entries()
  ).map(([professionalSituation, count]) => ({ professionalSituation, count }));

  const byContraceptive = Array.from(contraceptiveCounts.entries())
    .map(([contraceptive, count]) => ({ contraceptive, count }))
    .sort((a, b) => b.count - a.count);

  const byNewContraceptive = Array.from(newContraceptiveCounts.entries()).map(
    ([newContraceptive, count]) => ({ newContraceptive, count })
  );

  const byDiagnosis = Array.from(diagnosisCounts.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  const byProblems = Array.from(problemsCounts.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  const byNewDiagnosis = Array.from(newDiagnosisCounts.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalConsultations,
    averageAge,
    byAgeRange,
    byMonth,
    bySex,
    byType,
    byPresential,
    bySmoker,
    byVaccinationPlan,
    byFamilyType,
    bySchoolLevel,
    byProfessionalSituation,
    byContraceptive,
    byNewContraceptive,
    byDiagnosis,
    byProblems,
    byNewDiagnosis,
  };
}
