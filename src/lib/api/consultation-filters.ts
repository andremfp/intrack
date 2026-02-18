/**
 * Single source of truth for the consultation filter shape.
 * Lives here (rather than in consultations.ts) to avoid a circular dependency:
 * consultations.ts imports applyMGFFilters from this file, so this file must
 * not import from consultations.ts.
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

/**
 * Structural interface covering the Supabase filter methods used by
 * applyMGFFilters. PostgrestFilterBuilder satisfies this at runtime;
 * test mocks implement it explicitly.
 */
export interface FilterableQuery {
  eq(column: string, value: unknown): FilterableQuery;
  gte(column: string, value: unknown): FilterableQuery;
  lte(column: string, value: unknown): FilterableQuery;
  or(filter: string): FilterableQuery;
  neq(column: string, value: unknown): FilterableQuery;
  ilike(column: string, pattern: string): FilterableQuery;
}

/**
 * Applies ConsultationsFilters to any FilterableQuery (Supabase query builder
 * or test mock). Used by getMGFConsultations, getMGFConsultationsForExport,
 * getConsultationMetrics, and getConsultationTimeSeries.
 *
 * Unified behaviour:
 *   internship  → ilike (case-insensitive, no wildcard)
 *   profession  → ilike with trailing % (matches both code-only and
 *                 "CODE - Description" formats)
 *   age math    → 52.1429 weeks/yr, 365.25 days/yr;
 *                 Math.floor for ageMin, Math.ceil for ageMax
 *   year        → maps to specialty_year column
 *   excludeType → optional; adds neq("type", ...) clause
 *
 * The generic preserves the caller's concrete query type so no casts are
 * needed at call sites.
 */
export function applyMGFFilters<Q extends FilterableQuery>(
  query: Q,
  filters: ConsultationsFilters,
  excludeType?: string
): Q {
  // Work with a FilterableQuery-typed variable to satisfy intermediate
  // assignments, then cast back to Q at the end.  The cast is safe because
  // Supabase filter methods return `this` (the same object).
  let q: FilterableQuery = query;

  if (filters.year !== undefined) {
    q = q.eq("specialty_year", filters.year);
  }

  if (filters.location) {
    q = q.eq("location", filters.location);
  }

  if (filters.internship) {
    q = q.ilike("details->>internship", filters.internship);
  }

  if (filters.sex) {
    q = q.eq("sex", filters.sex);
  }

  if (filters.type) {
    q = q.eq("type", filters.type);
  }

  if (excludeType) {
    q = q.neq("type", excludeType);
  }

  if (filters.presential !== undefined) {
    q = q.eq("presential", filters.presential);
  }

  if (filters.autonomy) {
    q = q.eq("autonomy", filters.autonomy);
  }

  if (filters.smoker) {
    q = q.eq("smoker", filters.smoker);
  }

  if (filters.vaccination_plan !== undefined) {
    q = q.eq("vaccination_plan", filters.vaccination_plan);
  }

  if (filters.alcohol !== undefined) {
    q = q.eq("alcohol", filters.alcohol);
  }

  if (filters.drugs !== undefined) {
    q = q.eq("drugs", filters.drugs);
  }

  if (filters.processNumber) {
    q = q.eq("process_number", parseInt(filters.processNumber));
  }

  if (filters.dateFrom) {
    q = q.gte("date", filters.dateFrom);
  }

  if (filters.dateTo) {
    q = q.lte("date", filters.dateTo);
  }

  if (filters.profession) {
    q = q.ilike("details->>profession", `${filters.profession}%`);
  }

  if (filters.family_type) {
    q = q.eq("details->>family_type", filters.family_type);
  }

  if (filters.school_level) {
    q = q.eq("details->>school_level", filters.school_level);
  }

  if (filters.professional_situation) {
    q = q.eq(
      "details->>professional_situation",
      filters.professional_situation
    );
  }

  if (filters.contraceptive) {
    q = q.eq("details->>contraceptive", filters.contraceptive);
  }

  if (filters.new_contraceptive) {
    q = q.eq("details->>new_contraceptive", filters.new_contraceptive);
  }

  // Age filtering — four unit conversions so the same year-range works
  // regardless of which unit the record stores the patient's age in.
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
      weeksCondition += `,age.gte.${Math.floor(filters.ageMin * 52.1429)}`;
    }
    if (filters.ageMax !== undefined) {
      weeksCondition += `,age.lte.${Math.ceil(filters.ageMax * 52.1429)}`;
    }
    conditions.push(`and(${weeksCondition})`);

    let daysCondition = "age_unit.eq.days";
    if (filters.ageMin !== undefined) {
      daysCondition += `,age.gte.${Math.floor(filters.ageMin * 365.25)}`;
    }
    if (filters.ageMax !== undefined) {
      daysCondition += `,age.lte.${Math.ceil(filters.ageMax * 365.25)}`;
    }
    conditions.push(`and(${daysCondition})`);

    q = q.or(conditions.join(","));
  }

  return q as Q;
}
