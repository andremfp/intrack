import type { Tables } from "@/schema";
import { MGF_FIELDS, ageToYears } from "@/constants";

// Use schema type directly to avoid a circular dependency with consultations.ts.
// Structurally identical to ConsultationMGF exported from consultations.ts.
type ConsultationMGFRow = Tables<"consultations_mgf">;

export interface ConsultationMetrics {
  totalConsultations: number;
  averageAge: number;
  bySex: Array<{ sex: string; count: number }>;
  byAgeRange: Array<{ range: string; count: number }>;
  byType: Array<{ type: string; label: string; count: number }>;
  byPresential: Array<{ presential: string; count: number }>;
  byLocation: Array<{ location: string; count: number }>;
  byAutonomy: Array<{ autonomy: string; count: number }>;
  byOwnList: Array<{ ownList: string; count: number }>;
  bySmoker: Array<{ smoker: string; count: number }>;
  byVaccinationPlan: Array<{ vaccinationPlan: string; count: number }>;
  byAlcohol: Array<{ alcohol: string; count: number }>;
  byDrugs: Array<{ drugs: string; count: number }>;
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
  byReferral: Array<{
    referral: string;
    label: string;
    count: number;
    motives: Array<{ code: string; count: number }>;
  }>;
}

export function getEmptyMetrics(): ConsultationMetrics {
  return {
    totalConsultations: 0,
    averageAge: 0,
    bySex: [],
    byAgeRange: [],
    byType: [],
    byPresential: [],
    byLocation: [],
    byAutonomy: [],
    byOwnList: [],
    bySmoker: [],
    byVaccinationPlan: [],
    byAlcohol: [],
    byDrugs: [],
    byFamilyType: [],
    bySchoolLevel: [],
    byProfessionalSituation: [],
    byContraceptive: [],
    byNewContraceptive: [],
    byDiagnosis: [],
    byProblems: [],
    byNewDiagnosis: [],
    byReferral: [],
  };
}

export function calculateMetrics(
  consultations: ConsultationMGFRow[]
): ConsultationMetrics {
  // Helper to safely extract values from details JSONB
  const getDetail = (c: ConsultationMGFRow, key: string): unknown => {
    if (!c.details || typeof c.details !== "object") return null;
    return (c.details as Record<string, unknown>)[key] ?? null;
  };

  const typeValueToLabel = new Map(
    (MGF_FIELDS.find((field) => field.key === "type")?.options ?? []).map(
      (option) => [option.value, option.label]
    )
  );
  // Create map from the referrence field options so labels cover all referral values.
  const referralValueToLabel = new Map(
    (MGF_FIELDS.find((field) => field.key === "referrence")?.options ?? []).map(
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
  const sexCounts = new Map<string, number>();
  const typeCounts = new Map<string, number>();
  const presentialCounts = new Map<string, number>();
  const locationCounts = new Map<string, number>();
  const autonomyCounts = new Map<string, number>();
  const ownListCounts = new Map<string, number>();
  const smokerCounts = new Map<string, number>();
  const vaccinationPlanCounts = new Map<string, number>();
  const alcoholCounts = new Map<string, number>();
  const drugsCounts = new Map<string, number>();
  const familyTypeCounts = new Map<string, number>();
  const schoolLevelCounts = new Map<string, number>();
  const professionalSituationCounts = new Map<string, number>();
  const contraceptiveCounts = new Map<string, number>();
  const newContraceptiveCounts = new Map<string, number>();
  const diagnosisCounts = new Map<string, number>();
  const problemsCounts = new Map<string, number>();
  const newDiagnosisCounts = new Map<string, number>();
  // Referral tracking: Map<referralType, Map<motiveCode, count>>
  const referralMotiveCounts = new Map<string, Map<string, number>>();
  const referralCounts = new Map<string, number>();

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

    // Location counting
    if (c.location !== null && c.location !== undefined) {
      locationCounts.set(c.location, (locationCounts.get(c.location) || 0) + 1);
    }

    // Autonomy counting
    if (c.autonomy !== null && c.autonomy !== undefined) {
      autonomyCounts.set(c.autonomy, (autonomyCounts.get(c.autonomy) || 0) + 1);
    }

    // Own list counting
    const ownList = getDetail(c, "own_list");
    if (ownList !== null && ownList !== undefined) {
      const key = ownList ? "true" : "false";
      ownListCounts.set(key, (ownListCounts.get(key) || 0) + 1);
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

    // Alcohol counting
    if (c.alcohol !== null && c.alcohol !== undefined) {
      const key = c.alcohol ? "true" : "false";
      alcoholCounts.set(key, (alcoholCounts.get(key) || 0) + 1);
    }

    // Drugs counting
    if (c.drugs !== null && c.drugs !== undefined) {
      const key = c.drugs ? "true" : "false";
      drugsCounts.set(key, (drugsCounts.get(key) || 0) + 1);
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

    // Referral counting
    const referral = getDetail(c, "referrence");
    // Referrals are always arrays (migrated from legacy string format)
    const referralValues = Array.isArray(referral)
      ? referral.filter(
          (v): v is string => typeof v === "string" && v.length > 0
        )
      : [];

    // Count each referral type
    referralValues.forEach((referralValue) => {
      referralCounts.set(
        referralValue,
        (referralCounts.get(referralValue) || 0) + 1
      );

      // Track motives for this referral
      const referralMotive = getDetail(c, "referrence_motive");
      const motiveCodes = Array.isArray(referralMotive) ? referralMotive : [];
      if (motiveCodes.length > 0) {
        if (!referralMotiveCounts.has(referralValue)) {
          referralMotiveCounts.set(referralValue, new Map<string, number>());
        }
        const motiveMap = referralMotiveCounts.get(referralValue)!;
        motiveCodes.forEach((code) => {
          const normalized = String(code).trim();
          if (normalized) {
            motiveMap.set(normalized, (motiveMap.get(normalized) || 0) + 1);
          }
        });
      }
    });
  });
  // Calculate final metrics using data from single-pass iteration
  const averageAge = validAgeCount > 0 ? totalAgeInYears / validAgeCount : 0;

  const byAgeRange = ageRangeBuckets
    .filter((b) => b.count > 0)
    .map((b) => ({ range: b.label, count: b.count }));

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

  const byLocation = Array.from(locationCounts.entries()).map(
    ([location, count]) => ({
      location,
      count,
    })
  );

  const byAutonomy = Array.from(autonomyCounts.entries()).map(
    ([autonomy, count]) => ({
      autonomy,
      count,
    })
  );

  const byOwnList = Array.from(ownListCounts.entries()).map(
    ([ownList, count]) => ({
      ownList,
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

  const byAlcohol = Array.from(alcoholCounts.entries()).map(
    ([alcohol, count]) => ({ alcohol, count })
  );

  const byDrugs = Array.from(drugsCounts.entries()).map(([drugs, count]) => ({
    drugs,
    count,
  }));

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

  const byReferral = Array.from(referralCounts.entries())
    .map(([referral, count]) => {
      const motivesMap = referralMotiveCounts.get(referral) || new Map();
      const motives = Array.from(motivesMap.entries())
        .map(([code, motiveCount]) => ({ code, count: motiveCount }))
        .sort((a, b) => b.count - a.count);
      return {
        referral,
        label: referralValueToLabel.get(referral) ?? referral,
        count,
        motives,
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    totalConsultations,
    averageAge,
    byAgeRange,
    bySex,
    byType,
    byPresential,
    byLocation,
    byAutonomy,
    byOwnList,
    bySmoker,
    byVaccinationPlan,
    byAlcohol,
    byDrugs,
    byFamilyType,
    bySchoolLevel,
    byProfessionalSituation,
    byContraceptive,
    byNewContraceptive,
    byDiagnosis,
    byProblems,
    byNewDiagnosis,
    byReferral,
  };
}
