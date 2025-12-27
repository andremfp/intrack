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
    Boolean(summary) ||
    Boolean(unitSampleBreakdown?.totalConsultations);

  const urgencySelections = data?.urgencySelection ?? [];
  const topProblems = data?.topProblems ?? [];
  const internshipSamples = data?.internshipsSamples ?? [];

  const hasUrgencyData = Boolean(
    urgencySelections.length || topProblems.length
  );
  const hasFormacaoData = Boolean(internshipSamples.length);
  const hasReportData = hasUnitSampleData || hasUrgencyData || hasFormacaoData;

  if (!hasReportData) {
    return (
      <div className="rounded-lg border border-border/50 p-4 text-sm text-muted-foreground">
        Ainda não há dados disponíveis para exibir neste relatório.
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

