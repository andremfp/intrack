import type { ConsultationMGF } from "@/lib/api/consultations";

export interface WeekSample {
  weekKey: string;
  startDate: string;
  endDate: string;
  consultations: number;
  uniqueDays: number;
}

export interface UrgencyDay {
  date: string;
  consultations: number;
  autonomyCounts: Record<string, number>;
}

type CountMap = Record<string, number>;

export interface PresentialCounts {
  presential: number;
  remote: number;
}

export interface MGFReportSummary {
  totalConsultations: number;
  typeCounts: CountMap;
  autonomyCounts: CountMap;
  presentialCounts: PresentialCounts;
}

export type UnitSamplePresentialKey = boolean;

export interface UnitSampleTypeBreakdown {
  consultations: number;
  typeCounts: CountMap;
}

export interface UnitSampleAutonomyBreakdown {
  consultations: number;
  presential: Map<UnitSamplePresentialKey, UnitSampleTypeBreakdown>;
}

export interface UnitSampleBreakdown {
  totalConsultations: number;
  autonomy: Record<string, UnitSampleAutonomyBreakdown>;
}

export interface UrgencySelection {
  label: string;
  internship: string;
  days: UrgencyDay[];
  totalConsultations: number;
  autonomyTotals: CountMap;
}

export interface InternshipsSample {
  label: string;
  internships: string[];
  weeks: WeekSample[];
  autonomyCounts: Record<string, number>;
}

export interface ProblemCount {
  code: string;
  count: number;
}

export interface MGFReportData {
  summary: MGFReportSummary;
  unitSampleBreakdown?: UnitSampleBreakdown;
  sampleWeeks?: WeekSample[];
  firstHalfWeeks?: WeekSample[];
  secondHalfWeeks?: WeekSample[];
  urgencySelection?: UrgencySelection[];
  internshipsSamples?: InternshipsSample[];
  topProblems?: ProblemCount[];
}

export interface SpecialtyReportConfig<ReportKey extends string = string> {
  specialtyCode: string;
  reportKey: ReportKey;
  specialtyYears: number[];
  buildReport: (records: ConsultationMGF[]) => MGFReportData;
}
