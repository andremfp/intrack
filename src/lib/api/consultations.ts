import { supabase } from "@/supabase";
import type { ApiResponse } from "@/errors";
import type { Tables, TablesInsert, TablesUpdate } from "@/schema";
import { success, failure, AppError } from "@/errors";
import {
  getDefaultSpecialtyDetails,
  type SpecialtyDetails,
  PAGINATION_CONSTANTS,
  MGF_FIELDS,
} from "@/constants";

export type Consultation = Tables<"consultations">;
export type ConsultationInsert = TablesInsert<"consultations">;
export type ConsultationUpdate = TablesUpdate<"consultations">;
export type ConsultationMGF = Tables<"consultations_mgf">;

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

// Filtering and sorting options for MGF consultations
export interface MGFConsultationsFilters {
  sex?: string;
  healthNumber?: string;
  processNumber?: string;
  location?: string;
  autonomy?: string;
  ageMin?: number;
  ageMax?: number;
  type?: string;
  presential?: boolean;
  smoker?: boolean;
}

export interface MGFConsultationsSorting {
  field: "date" | "age" | "health_number" | "process_number";
  order: "asc" | "desc";
}

// MGF-specific view queries
export async function getMGFConsultations(
  userId?: string,
  specialtyYear?: number,
  page: number = 1,
  pageSize: number = PAGINATION_CONSTANTS.CONSULTATIONS_PAGE_SIZE,
  filters?: MGFConsultationsFilters,
  sorting?: MGFConsultationsSorting
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
    if (filters.healthNumber) {
      query = query.eq("health_number", parseInt(filters.healthNumber));
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
  }

  // Apply sorting (default to date descending)
  const sortField = sorting?.field || "date";
  const sortOrder = sorting?.order || "desc";
  query = query.order(sortField, { ascending: sortOrder === "asc" });

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

// Get distinct internships from consultations
// Group all without internship as ""
export async function getDistinctInternships(
  userId: string,
  specialtyYear?: number,
  location?: string
): Promise<ApiResponse<string[]>> {
  try {
    let query = supabase
      .from("consultations_mgf")
      .select("details, location")
      .eq("user_id", userId);

    if (specialtyYear !== undefined) {
      query = query.eq("specialty_year", specialtyYear);
    }

    if (location) {
      query = query.eq("location", location);
    }

    const { data, error } = await query;

    if (error) return failure(error, "getDistinctInternships");
    if (!data) return success([]);

    // Extract distinct internships from details JSONB
    // Only include internships for consultations where location is not 'health_unit'
    const internships = new Set<string>();
    data.forEach((consultation) => {
      // Only show internships for locations other than 'health_unit'
      if (consultation.location === "health_unit") {
        return;
      }

      if (
        consultation.details &&
        typeof consultation.details === "object"
      ) {
        const internship = (consultation.details as Record<string, unknown>)[
          "internship"
        ];
        if (internship && typeof internship === "string") {
          internships.add(internship);
        }
      }
    });

    // Sort alphabetically
    const sortedInternships = Array.from(internships).sort();
    return success(sortedInternships);
  } catch (error) {
    return failure(error as Error, "getDistinctInternships");
  }
}

export async function getDistinctLocations(
  userId: string,
  specialtyYear?: number
): Promise<ApiResponse<string[]>> {
  try {
    let query = supabase
      .from("consultations_mgf")
      .select("location")
      .eq("user_id", userId);

    if (specialtyYear !== undefined) {
      query = query.eq("specialty_year", specialtyYear);
    }

    const { data, error } = await query;

    if (error) return failure(error, "getDistinctLocations");
    if (!data) return success([]);

    // Extract distinct locations
    const locations = new Set<string>();
    data.forEach((consultation) => {
      if (consultation.location && typeof consultation.location === "string") {
        locations.add(consultation.location);
      }
    });

    // Sort alphabetically
    const sortedLocations = Array.from(locations).sort();
    return success(sortedLocations);
  } catch (error) {
    return failure(error as Error, "getDistinctLocations");
  }
}

// Fetch aggregated metrics for consultations
export async function getConsultationMetrics(
  userId: string,
  specialtyYear?: number,
  internship?: string,
  location?: string
): Promise<ApiResponse<ConsultationMetrics>> {
  try {
    // Build query with database-level filtering
    let query = supabase
      .from("consultations_mgf")
      .select("*")
      .eq("user_id", userId);

    if (specialtyYear !== undefined) {
      query = query.eq("specialty_year", specialtyYear);
    }

    if (location) {
      query = query.eq("location", location);
    }

    // Filter by internship at database level using JSONB operator (details->>internship)
    // This is more efficient than fetching all data and filtering in JavaScript
    if (internship) {
      query = query.eq("details->>internship", internship);
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
    let ageInYears = c.age;
    if (c.age_unit === "months") {
      ageInYears = c.age / 12;
    } else if (c.age_unit === "days") {
      ageInYears = c.age / 365;
    }
    return sum + ageInYears;
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
      let ageYears = c.age;
      if (c.age_unit === "months") ageYears = c.age / 12;
      else if (c.age_unit === "days") ageYears = c.age / 365;
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
      const key = c.smoker ? "true" : "false";
      smokerCounts.set(key, (smokerCounts.get(key) || 0) + 1);
    }
  });
  const bySmoker = Array.from(smokerCounts.entries()).map(
    ([smoker, count]) => ({ smoker, count })
  );

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
    if (diagnosis && typeof diagnosis === "string") {
      const codes = diagnosis.split(";").map((code) => code.trim());
      codes.forEach((code) => {
        if (code) {
          diagnosisCounts.set(code, (diagnosisCounts.get(code) || 0) + 1);
        }
      });
    }
  });
  const byDiagnosis = Array.from(diagnosisCounts.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  // By problems codes (split by semicolon and count each code)
  const problemsCounts = new Map<string, number>();
  consultations.forEach((c) => {
    const problems = getDetail(c, "problems");
    if (problems && typeof problems === "string") {
      const codes = problems.split(";").map((code) => code.trim());
      codes.forEach((code) => {
        if (code) {
          problemsCounts.set(code, (problemsCounts.get(code) || 0) + 1);
        }
      });
    }
  });
  const byProblems = Array.from(problemsCounts.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  // By new diagnosis codes (split by semicolon and count each code)
  const newDiagnosisCounts = new Map<string, number>();
  consultations.forEach((c) => {
    const newDiagnosis = getDetail(c, "new_diagnosis");
    if (newDiagnosis && typeof newDiagnosis === "string") {
      const codes = newDiagnosis.split(";").map((code) => code.trim());
      codes.forEach((code) => {
        if (code) {
          newDiagnosisCounts.set(code, (newDiagnosisCounts.get(code) || 0) + 1);
        }
      });
    }
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
