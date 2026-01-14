import { InternshipsReportSection } from "./internships-report";
import { UnitReportSection } from "./unit-report";
import { UrgencyReportSection } from "./urgency-report";
import type { MGFReportData } from "@/reports/report-types";

interface MGFReportSectionsProps {
  data?: MGFReportData;
}

export default function MGFReportSections({ data }: MGFReportSectionsProps) {
  const summary = data?.summary;
  const unitSampleBreakdown = data?.unitSampleBreakdown;
  const sampleWeeks = data?.sampleWeeks;
  const firstHalfWeeks = data?.firstHalfWeeks;
  const secondHalfWeeks = data?.secondHalfWeeks;

  const weekGroups = [sampleWeeks, firstHalfWeeks, secondHalfWeeks];
  const hasWeekGroups = weekGroups.some((weeks) => weeks && weeks.length > 0);

  const hasUnitSampleData =
    hasWeekGroups ||
    (summary?.totalConsultations ?? 0) > 0 ||
    (unitSampleBreakdown?.totalConsultations ?? 0) > 0;

  const urgencySelections = data?.urgencySelection ?? [];
  const topProblems = data?.topProblems ?? [];
  const allInternshipSamples = data?.internshipsSamples ?? [];

  const hasUrgencyData = Boolean(
    urgencySelections.length || topProblems.length
  );
  // Filter out samples with no data (empty weeks and no autonomy counts)
  const internshipSamples = allInternshipSamples.filter(
    (sample) =>
      (sample.weeks?.length ?? 0) > 0 ||
      Object.values(sample.autonomyCounts ?? {}).some((count) => count > 0)
  );
  const hasFormacaoData = internshipSamples.length > 0;
  const hasReportData = hasUnitSampleData || hasUrgencyData || hasFormacaoData;

  if (!hasReportData) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-lg border border-border/50 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Ainda não há dados disponíveis para exibir neste relatório.
        </p>
      </div>
    );
  }

  return (
    <>
      {hasUnitSampleData && (
        <UnitReportSection
          summary={summary}
          sampleWeeks={sampleWeeks}
          firstHalfWeeks={firstHalfWeeks}
          secondHalfWeeks={secondHalfWeeks}
          unitSampleBreakdown={unitSampleBreakdown}
        />
      )}

      {hasUrgencyData && (
        <UrgencyReportSection
          urgencySelections={urgencySelections}
          topProblems={topProblems}
        />
      )}

      {hasFormacaoData && (
        <InternshipsReportSection internshipSamples={internshipSamples} />
      )}
    </>
  );
}
