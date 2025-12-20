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

export interface UrgencySelection {
  label: string;
  internships: string[];
  days: UrgencyDay[];
  totalConsultations: number;
  autonomyTotals: Record<string, number>;
}

export interface InternshipsSample {
  label: string;
  internships: string[];
  weeks: WeekSample[];
}

export interface ProblemCount {
  code: string;
  count: number;
}

export interface PresentialCounts {
  presential: number;
  remote: number;
}

export interface MGFReportSummary {
  totalConsultations: number;
  typeCounts: Record<string, number>;
  autonomyCounts: Record<string, number>;
  presentialCounts: PresentialCounts;
}

export type UnitSamplePresentialKey = "presential" | "remote";

export interface UnitSampleTypeBreakdown {
  consultations: number;
  typeCounts: Record<string, number>;
}

export interface UnitSampleAutonomyBreakdown {
  consultations: number;
  presential: Record<UnitSamplePresentialKey, UnitSampleTypeBreakdown>;
}

export interface UnitSampleBreakdown {
  totalConsultations: number;
  autonomy: Record<string, UnitSampleAutonomyBreakdown>;
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
