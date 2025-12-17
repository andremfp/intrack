import { supabase } from "@/supabase";
import type { ApiResponse } from "@/errors";
import type { Tables, TablesInsert, TablesUpdate } from "@/schema";
import { success, failure, AppError } from "@/errors";
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
};

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
  ApiResponse<{ created: number; errors: Array<{ index: number; error: string }> }>
> {
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

  return success({ created: totalCreated, errors });
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
      query = query.eq("details->>new_contraceptive", filters.new_contraceptive);
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
      query = query.eq("details->>new_contraceptive", filters.new_contraceptive);
    }
  }

  const sortField = sorting?.field || "date";
  const sortOrder = sorting?.order || "desc";

  if (sortField === "age") {
    const { data, error } = await query;

    if (error) return failure(error, "getMGFConsultationsForExport");
    if (!data) return success([]);

    const sortedData = sortConsultationsWithFavorites(data, {
      field: "age",
      order: sortOrder,
    });

    return success(sortedData);
  }

  query = query
    .order("favorite", { ascending: false, nullsFirst: false })
    .order(sortField, { ascending: sortOrder === "asc" });

  const { data, error } = await query;

  if (error) return failure(error, "getMGFConsultationsForExport");
  if (!data) return success([]);

  return success(data);
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
  byContraceptive: Array<{ contraceptive: string; count: number }>;
  byNewContraceptive: Array<{ newContraceptive: string; count: number }>;
  byDiagnosis: Array<{ code: string; count: number }>;
  byProblems: Array<{ code: string; count: number }>;
  byNewDiagnosis: Array<{ code: string; count: number }>;
}



// Fetch aggregated metrics for consultations
// Accepts ConsultationsFilters and converts year to specialtyYear internally
export async function getConsultationMetrics(
  userId: string,
  filters?: ConsultationsFilters
): Promise<ApiResponse<ConsultationMetrics>> {
  try {
    // Build query with database-level filtering
    let query = supabase
      .from("consultations_mgf")
      .select("*")
      .eq("user_id", userId);

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

    if (filters?.sex) {
      query = query.eq("sex", filters.sex);
    }

    if (filters?.autonomy) {
      query = query.eq("autonomy", filters.autonomy);
    }

    if (filters?.type) {
      query = query.eq("type", filters.type);
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
    const metrics = calculateMetrics(data);
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
  // Total consultations
  const totalConsultations = consultations.length;

  // Average age (convert all ages to years)
  const totalAgeInYears = consultations.reduce((sum, c) => {
    if (!c.age || !c.age_unit) return sum;
    return sum + ageToYears(c.age, c.age_unit);
  }, 0);
  const averageAge =
    totalConsultations > 0 ? totalAgeInYears / totalConsultations : 0;

  // By age ranges (years): 0-17, 18-44, 45-64, 65+
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
  consultations.forEach((c) => {
    if (c.age !== null && c.age !== undefined && c.age_unit) {
      const ageYears = ageToYears(c.age, c.age_unit);
      const age = Math.floor(ageYears);
      const bucket = ageRangeBuckets.find((b) =>
        b.max !== undefined ? age >= b.min && age <= b.max : age >= b.min
      );
      if (bucket) bucket.count += 1;
    }
  });
  const byAgeRange = ageRangeBuckets
    .filter((b) => b.count > 0)
    .map((b) => ({ range: b.label, count: b.count }));

  // By month (group by year-month)
  const monthCounts = new Map<string, number>();
  consultations.forEach((c) => {
    if (c.date) {
      const date = new Date(c.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
    }
  });
  const byMonth = Array.from(monthCounts.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // By sex
  const sexCounts = new Map<string, number>();
  consultations.forEach((c) => {
    if (c.sex) {
      sexCounts.set(c.sex, (sexCounts.get(c.sex) || 0) + 1);
    }
  });
  const bySex = Array.from(sexCounts.entries()).map(([sex, count]) => ({
    sex,
    count,
  }));

  // By type - parse the type from JSON if needed
  const typeCounts = new Map<string, number>();
  consultations.forEach((c) => {
    if (c.type) {
      let typeValue: string;
      if (typeof c.type === "string") {
        typeValue = c.type;
      } else if (typeof c.type === "object" && c.type !== null) {
        // If it's stored as JSON object, try to extract the value
        typeValue = JSON.stringify(c.type);
      } else {
        return;
      }
      typeCounts.set(typeValue, (typeCounts.get(typeValue) || 0) + 1);
    }
  });
  const byType = Array.from(typeCounts.entries())
    .map(([type, count]) => ({
      type,
      label: typeValueToLabel.get(type) ?? type,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // By presential
  const presentialCounts = new Map<string, number>();
  consultations.forEach((c) => {
    if (c.presential !== null && c.presential !== undefined) {
      const key = c.presential ? "true" : "false";
      presentialCounts.set(key, (presentialCounts.get(key) || 0) + 1);
    }
  });
  const byPresential = Array.from(presentialCounts.entries()).map(
    ([presential, count]) => ({
      presential,
      count,
    })
  );

  // By smoker
  const smokerCounts = new Map<string, number>();
  consultations.forEach((c) => {
    if (c.smoker !== null && c.smoker !== undefined) {
      smokerCounts.set(c.smoker, (smokerCounts.get(c.smoker) || 0) + 1);
    }
  });
  const bySmoker = Array.from(smokerCounts.entries()).map(([smoker, count]) => ({
    smoker,
    count,
  }));

  // By contraceptive
  const contraceptiveCounts = new Map<string, number>();
  consultations.forEach((c) => {
    const contraceptive = getDetail(c, "contraceptive");
    if (contraceptive && typeof contraceptive === "string") {
      contraceptiveCounts.set(
        contraceptive,
        (contraceptiveCounts.get(contraceptive) || 0) + 1
      );
    }
  });
  const byContraceptive = Array.from(contraceptiveCounts.entries())
    .map(([contraceptive, count]) => ({ contraceptive, count }))
    .sort((a, b) => b.count - a.count);

  // By new contraceptive
  const newContraceptiveCounts = new Map<string, number>();
  consultations.forEach((c) => {
    const newContraceptive = getDetail(c, "new_contraceptive");
    if (newContraceptive) {
      const key =
        typeof newContraceptive === "string" ? newContraceptive : "Sim";
      newContraceptiveCounts.set(
        key,
        (newContraceptiveCounts.get(key) || 0) + 1
      );
    }
  });
  const byNewContraceptive = Array.from(newContraceptiveCounts.entries()).map(
    ([newContraceptive, count]) => ({ newContraceptive, count })
  );

  // By diagnosis codes (split by semicolon and count each code)
  const diagnosisCounts = new Map<string, number>();
  consultations.forEach((c) => {
    const diagnosis = getDetail(c, "diagnosis");
    const codes = Array.isArray(diagnosis) ? diagnosis : [];

    codes.forEach((code) => {
      const normalized = String(code).trim();
      if (normalized) {
        diagnosisCounts.set(
          normalized,
          (diagnosisCounts.get(normalized) || 0) + 1
        );
      }
    });
  });
  const byDiagnosis = Array.from(diagnosisCounts.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  // By problems codes (split by semicolon and count each code)
  const problemsCounts = new Map<string, number>();
  consultations.forEach((c) => {
    const problems = getDetail(c, "problems");
    const codes = Array.isArray(problems) ? problems : [];

    codes.forEach((code) => {
      const normalized = String(code).trim();
      if (normalized) {
        problemsCounts.set(
          normalized,
          (problemsCounts.get(normalized) || 0) + 1
        );
      }
    });
  });
  const byProblems = Array.from(problemsCounts.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  // By new diagnosis codes (split by semicolon and count each code)
  const newDiagnosisCounts = new Map<string, number>();
  consultations.forEach((c) => {
    const newDiagnosis = getDetail(c, "new_diagnosis");
    const codes = Array.isArray(newDiagnosis) ? newDiagnosis : [];

    codes.forEach((code) => {
      const normalized = String(code).trim();
      if (normalized) {
        newDiagnosisCounts.set(
          normalized,
          (newDiagnosisCounts.get(normalized) || 0) + 1
        );
      }
    });
  });
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
    byContraceptive,
    byNewContraceptive,
    byDiagnosis,
    byProblems,
    byNewDiagnosis,
  };
}
