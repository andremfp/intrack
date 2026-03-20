import type { ConsultationMGF } from "@/lib/api/consultations";

/**
 * Builds a valid ConsultationMGF object with sensible defaults.
 * Pass an overrides object to pin only the fields relevant to each test.
 */
export function makeConsultationMGF(
  overrides: Partial<ConsultationMGF> = {}
): ConsultationMGF {
  return {
    id: "test-consultation-id",
    user_id: "test-user-id",
    // specialty_id lives on the base table but is present on the view row
    specialty_id: "test-specialty-id",
    date: "2024-06-17",
    process_number: 12345,
    age: 30,
    age_unit: "years",
    sex: "m",
    location: "unidade",
    autonomy: "total",
    presential: true,
    specialty_year: 1,
    type: "SA",
    favorite: false,
    // Nullable MGF-specific fields default to null
    alcohol: null,
    drugs: null,
    family_type: null,
    professional_situation: null,
    school_level: null,
    smoker: null,
    vaccination_plan: null,
    details: {},
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ...overrides,
  } as ConsultationMGF;
}
