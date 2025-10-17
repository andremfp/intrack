import { supabase } from "@/lib/supabase";
import type { ApiResponse } from "@/lib/errors";
import type { Tables } from "@/schema";
import { success, failure, AppError, ErrorMessages } from "@/lib/errors";

export type Specialty = Tables<"specialties">;

export async function getSpecialties(): Promise<ApiResponse<Specialty[]>> {
  const { data, error } = await supabase
    .from("specialties")
    .select("*")
    .order("name", { ascending: true });

  if (error) return failure(error, "getSpecialties");
  if (!data)
    return failure(
      new AppError(ErrorMessages.SPECIALTY_NOT_FOUND),
      "getSpecialties"
    );

  return success(data);
}

export async function getSpecialty(
  id: string
): Promise<ApiResponse<Specialty>> {
  const { data, error } = await supabase
    .from("specialties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return failure(error, "getSpecialty");
  if (!data) {
    return failure(
      new AppError(ErrorMessages.SPECIALTY_NOT_FOUND),
      "getSpecialty"
    );
  }

  return success(data);
}
