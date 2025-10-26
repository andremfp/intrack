import { supabase } from "@/supabase";
import type { ApiResponse } from "@/errors";
import type { Tables, TablesInsert, TablesUpdate } from "@/schema";
import { success, failure, AppError } from "@/errors";
import {
  getDefaultSpecialtyDetails,
  type SpecialtyDetails,
  PAGINATION_CONSTANTS,
} from "@/constants";

export type Consultation = Tables<"consultations">;
export type ConsultationInsert = TablesInsert<"consultations">;
export type ConsultationUpdate = TablesUpdate<"consultations">;
export type ConsultationMGF = Tables<"consultations_mgf">;

// MGF-specific details type
export type MGFDetails = {
  type?: string | null;
  presential?: boolean | null;
  chronic_diseases?: string[] | null;
  diagnosis?: string | null;
  problems?: string | null;
  new_diagnosis?: string | null;
  alert?: string | null;
  alert_motive?: string | null;
  contraceptive?: string | null;
  new_contraceptive?: boolean | null;
  smoker?: boolean | null;
  procedure?: string | null;
  notes?: string | null;
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

// Filtering and sorting options for MGF consultations
export interface MGFConsultationsFilters {
  sex?: string;
  healthNumber?: string;
  ageMin?: number;
  ageMax?: number;
  type?: string;
  presential?: boolean;
  smoker?: boolean;
}

export interface MGFConsultationsSorting {
  field: "date" | "age" | "health_number";
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
