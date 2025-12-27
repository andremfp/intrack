import { supabase } from "@/supabase";
import { failure, success, AppError } from "@/errors";
import type { ApiResponse } from "@/errors";
import { getSpecialtyReportConfig } from "@/reports/helpers";
import type { ConsultationMGF } from "./consultations";
import type { MGFReportData } from "@/reports/report-types";

export async function getReportData({
  userId,
  specialtyCode,
  reportKey,
}: {
  userId: string;
  specialtyCode: string;
  reportKey: string;
}): Promise<ApiResponse<MGFReportData>> {
  const config = getSpecialtyReportConfig(specialtyCode, reportKey);
  if (!config) {
    return failure(new AppError("Report inválido"), "getReportData");
  }

  let query = supabase.from("consultations_mgf").select("*");
  query = query.eq("user_id", userId);
  if (config.specialtyYears.length === 1) {
    query = query.eq("specialty_year", config.specialtyYears[0]);
  } else {
    query = query.in("specialty_year", config.specialtyYears);
  }
  query = query.order("date", { ascending: true });

  const { data, error } = await query;
  if (error) {
    return failure(error, "getReportData");
  }

  const records = (data as ConsultationMGF[]) || [];
  const payload = config.buildReport(records);

  return success(payload);
}
