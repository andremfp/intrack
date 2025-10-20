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

// MGF-specific view queries
export async function getMGFConsultations(
  userId?: string,
  specialtyYear?: number,
  page: number = 1,
  pageSize: number = PAGINATION_CONSTANTS.CONSULTATIONS_PAGE_SIZE
): Promise<
  ApiResponse<{ consultations: ConsultationMGF[]; totalCount: number }>
> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("consultations_mgf")
    .select("*", { count: "exact" })
    .order("date", { ascending: false })
    .range(from, to);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (specialtyYear !== undefined) {
    query = query.eq("specialty_year", specialtyYear);
  }

  const { data, error, count } = await query;

  if (error) return failure(error, "getMGFConsultations");
  if (!data) return success({ consultations: [], totalCount: 0 });

  return success({
    consultations: data,
    totalCount: count || 0,
  });
}
