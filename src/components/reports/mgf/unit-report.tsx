import { useMemo } from "react";
import type { WeekSample } from "@/reports/report-types";
import type {
  MGFReportSummary,
  UnitSampleBreakdown,
} from "@/reports/report-types";
import {
  MGF_AUTONOMY_LEVELS_FOR_REPORTS,
  MGF_CONSULTATION_TYPES_FOR_REPORTS,
} from "@/reports/mgf-reports";
import { BreakdownList, ReportSection } from "./shared";
import { PRESENTIAL_KEYS, PRESENTIAL_LABELS } from "./helpers";

interface UnitReportSectionProps {
  summary?: MGFReportSummary;
  sampleWeeks?: WeekSample[];
  firstHalfWeeks?: WeekSample[];
  secondHalfWeeks?: WeekSample[];
  unitSampleBreakdown?: UnitSampleBreakdown;
}

type WeekGroup = {
  label: string;
  weeks: WeekSample[];
};

export function UnitReportSection({
  summary,
  sampleWeeks,
  firstHalfWeeks,
  secondHalfWeeks,
  unitSampleBreakdown,
}: UnitReportSectionProps) {
  const summaryHighlights = useMemo(() => {
    if (!summary) return [];
    return [
      {
        label: "Consultas contabilizadas",
        value: summary.totalConsultations,
      },
      {
        label: "Consultas presenciais",
        value: summary.presentialCounts.presential,
      },
      {
        label: "Consultas não presenciais",
        value: summary.presentialCounts.remote,
      },
    ];
  }, [summary]);

  const rawWeekGroups = useMemo(
    () => [
      { label: "Amostra principal", weeks: sampleWeeks },
      { label: "Ano 2 - 1.ª metade", weeks: firstHalfWeeks },
      { label: "Ano 3 - 2.ª metade", weeks: secondHalfWeeks },
    ],
    [sampleWeeks, firstHalfWeeks, secondHalfWeeks]
  );

  const unitWeekGroups = useMemo(
    () =>
      rawWeekGroups.filter(
        (group): group is WeekGroup =>
          Array.isArray(group.weeks) && group.weeks.length > 0
      ),
    [rawWeekGroups]
  );

  const unitSampleAutonomyKeys = unitSampleBreakdown
    ? [
        ...MGF_AUTONOMY_LEVELS_FOR_REPORTS.filter(
          (autonomy) => autonomy in unitSampleBreakdown.autonomy
        ),
        ...Object.keys(unitSampleBreakdown.autonomy).filter(
          (autonomy) => !MGF_AUTONOMY_LEVELS_FOR_REPORTS.includes(autonomy)
        ),
      ]
    : [];

  return (
    <ReportSection title="Unidade de Saúde">
      <div className="space-y-6">
        {unitWeekGroups.length ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase text-muted-foreground">
                Semanas selecionadas
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {unitWeekGroups.map((group) => (
                <article
                  key={group.label}
                  className="rounded-lg border border-border/50 bg-muted/20 p-3"
                >
                  <p className="text-xs uppercase text-muted-foreground">
                    {group.label}
                  </p>
                  <div className="mt-2 space-y-2 text-sm">
                    {group.weeks.map((week) => (
                      <div
                        key={`${group.label}-${week.weekKey}`}
                        className="flex items-center justify-between"
                      >
                        <span>
                          {week.startDate} → {week.endDate}
                        </span>
                        <span className="font-semibold">
                          {week.consultations}{" "}
                          {week.consultations === 1 ? "consulta" : "consultas"}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs italic text-muted-foreground">
            Nenhuma semana de amostra definida.
          </p>
        )}

        {summary && (
          <div className="space-y-4 rounded-lg border border-border/50 p-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {summaryHighlights.map((highlight) => (
                <div
                  key={highlight.label}
                  className="flex flex-col gap-1 rounded-lg bg-muted/70 p-3"
                >
                  <span className="text-xs uppercase text-muted-foreground">
                    {highlight.label}
                  </span>
                  <span className="text-2xl font-semibold">
                    {highlight.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Tipologia
                </p>
                <BreakdownList
                  size="sm"
                  className="mt-2"
                  items={Object.entries(summary.typeCounts).map(([type, count]) => ({
                    label: type,
                    value: count,
                    key: type,
                  }))}
                />
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Autonomia
                </p>
                <BreakdownList
                  size="sm"
                  className="mt-2"
                  items={Object.entries(summary.autonomyCounts).map(
                    ([autonomy, count]) => ({
                      label: autonomy,
                      value: count,
                      key: autonomy,
                    })
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {unitSampleBreakdown && unitSampleBreakdown.totalConsultations > 0 && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
              <span>Detalhe da amostra</span>
              <span>{unitSampleBreakdown.totalConsultations} consultas</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {unitSampleAutonomyKeys.map((autonomy) => {
                const autonomyData =
                  unitSampleBreakdown.autonomy[autonomy];
                if (!autonomyData) {
                  return null;
                }
                return (
                  <article
                    key={autonomy}
                    className="space-y-3 rounded-lg border border-border/50 p-3"
                  >
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{autonomy}</span>
                      <span>{autonomyData.consultations} consultas</span>
                    </div>
                    <div className="space-y-3 text-xs">
                      {PRESENTIAL_KEYS.map((state) => {
                        const stateData = autonomyData.presential.get(state);
                        if (!stateData) {
                          return null;
                        }
                        return (
                          <div key={String(state)} className="space-y-2">
                            <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
                              <span>
                                {
                                  PRESENTIAL_LABELS[
                                    (state ? "true" : "false") as "true" | "false"
                                  ]
                                }
                              </span>
                              <span>
                                {stateData.consultations} consultas
                              </span>
                            </div>
                            <BreakdownList
                              size="xs"
                              className="mt-2"
                              items={MGF_CONSULTATION_TYPES_FOR_REPORTS.map(
                                (type) => ({
                                  key: `${autonomy}-${state}-${type}`,
                                  label: type,
                                  value: stateData.typeCounts[type] ?? 0,
                                })
                              )}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ReportSection>
  );
}

