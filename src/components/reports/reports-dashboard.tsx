import { useMemo } from "react";
import { DataErrorDisplay } from "@/components/ui/data-error-display";
import { useReportsData } from "@/hooks/reports/use-reports";
import type { MGFReportKey } from "@/reports/mgf-reports";
import {
  MGF_AUTONOMY_LEVELS_FOR_REPORTS,
  MGF_CONSULTATION_TYPES_FOR_REPORTS,
} from "@/reports/mgf-reports";
import type { UnitSamplePresentialKey } from "@/reports/report-types";
import { getReportTabDefinition } from "@/reports/helpers";

const PRESENTIAL_KEYS: UnitSamplePresentialKey[] = ["presential", "remote"];
const PRESENTIAL_LABELS: Record<UnitSamplePresentialKey, string> = {
  presential: "Presencial",
  remote: "Não presencial",
};

interface ReportsDashboardProps {
  userId: string;
  specialtyCode: string;
  reportKey: MGFReportKey;
}

export function ReportsDashboard({
  userId,
  specialtyCode,
  reportKey,
}: ReportsDashboardProps) {
  const definition = getReportTabDefinition(specialtyCode, reportKey);
  const { data, isLoading, error, refresh } = useReportsData({
    userId,
    specialtyCode,
    reportKey,
  });

  const summary = data?.summary;
  const unitSampleBreakdown = data?.unitSampleBreakdown;
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

  const summaryHighlights = useMemo(() => {
    if (!summary) return [];
    return [
      {
        label: "Consultas contabilizadas",
        value: summary.totalConsultations,
        helper: "Amostra definida na descrição",
      },
      {
        label: "Consultas presenciais",
        value: summary.presentialCounts.presential,
        helper: "Registos marcados como presenciais",
      },
      {
        label: "Consultas não presenciais",
        value: summary.presentialCounts.remote,
        helper: "Registos marcados como remotos",
      },
    ];
  }, [summary]);

  if (!definition) {
    return <p className="text-sm text-destructive">Relatório inválido.</p>;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pb-4">
      <section className="space-y-3 rounded-lg border border-border/50 p-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Relatório
          </p>
          <h2 className="text-lg font-semibold">{definition.label}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {definition.description}
        </p>
        <ul className="list-disc space-y-1 pl-4 text-sm leading-snug text-foreground">
          {definition.sections.map((section) => (
            <li key={section.key}>
              <span className="font-medium">{section.title}:</span>{" "}
              {section.description}
              <br />
              {section.sampleDescription && (
                <span className="text-xs text-muted-foreground italic">
                  {section.sampleDescription}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {isLoading && (
        <div className="rounded-lg border border-border/50 p-4 text-sm text-muted-foreground">
          Carregando dados do relatório...
        </div>
      )}

      {error && (
        <DataErrorDisplay
          error={error}
          onRetry={refresh}
          title="Erro ao carregar o relatório"
        />
      )}

      {data?.sampleWeeks && data.sampleWeeks.length > 0 && (
        <section className="rounded-lg border border-border/50 p-4">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
            Unidade de Saúde - Amostra selecionada
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {data.sampleWeeks.map((week) => (
              <li
                key={week.weekKey}
                className="flex items-center justify-between"
              >
                <span>
                  {week.startDate} → {week.endDate}
                </span>
                <span className="font-semibold">
                  {week.consultations} consultas
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data?.firstHalfWeeks && data.firstHalfWeeks.length > 0 && (
        <section className="rounded-lg border border-border/50 p-4">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
            Unidade de Saúde - Amostra selecionada (Ano 2)
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {data.firstHalfWeeks.map((week) => (
              <li
                key={`first-${week.weekKey}`}
                className="flex items-center justify-between"
              >
                <span>
                  {week.startDate} → {week.endDate}
                </span>
                <span className="font-semibold">
                  {week.consultations} consultas
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data?.secondHalfWeeks && data.secondHalfWeeks.length > 0 && (
        <section className="rounded-lg border border-border/50 p-4">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
            Unidade de Saúde - Amostra selecionada (Ano 3)
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {data.secondHalfWeeks.map((week) => (
              <li
                key={`second-${week.weekKey}`}
                className="flex items-center justify-between"
              >
                <span>
                  {week.startDate} → {week.endDate}
                </span>
                <span className="font-semibold">
                  {week.consultations} consultas
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {summary && (
        <section className="space-y-4 rounded-lg border border-border/50 p-4">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
            Unidade de Saúde - Resumo da amostra
          </h3>
          <div className="grid gap-3 md:grid-cols-3">
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
                <p className="text-xs text-muted-foreground">
                  {highlight.helper}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Tipologia
              </p>
              <div className="mt-2 space-y-1 text-sm">
                {Object.entries(summary.typeCounts).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between border-b border-border/50 pb-1"
                  >
                    <span>{type}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Autonomia
              </p>
              <div className="mt-2 space-y-1 text-sm">
                {Object.entries(summary.autonomyCounts).map(
                  ([autonomy, count]) => (
                    <div
                      key={autonomy}
                      className="flex items-center justify-between border-b border-border/50 pb-1"
                    >
                      <span>{autonomy}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {unitSampleBreakdown && unitSampleBreakdown.totalConsultations > 0 && (
        <section className="rounded-lg border border-border/50 p-4">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
            Unidade de Saúde - Detalhe da amostra
          </h3>
          <p className="text-xs text-muted-foreground">
            {unitSampleBreakdown.totalConsultations} consultas contabilizadas
          </p>
          <div className="mt-3 space-y-4 text-sm">
            {unitSampleAutonomyKeys.map((autonomy) => {
              const autonomyData = unitSampleBreakdown!.autonomy[autonomy];
              return (
                <article
                  key={autonomy}
                  className="space-y-2 rounded-lg border border-border/50 p-3"
                >
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>{autonomy}</span>
                    <span>{autonomyData.consultations} consultas</span>
                  </div>
                  <div className="space-y-2">
                    {PRESENTIAL_KEYS.map((state) => {
                      const stateData = autonomyData.presential[state];
                      return (
                        <div key={state} className="space-y-1">
                          <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
                            <span>{PRESENTIAL_LABELS[state]}</span>
                            <span>{stateData.consultations} consultas</span>
                          </div>
                          <div className="grid gap-1 text-xs">
                            {MGF_CONSULTATION_TYPES_FOR_REPORTS.map((type) => (
                              <div
                                key={`${autonomy}-${state}-${type}`}
                                className="flex items-center justify-between"
                              >
                                <span className="text-muted-foreground">
                                  {type}
                                </span>
                                <span className="font-semibold">
                                  {stateData.typeCounts[type] ?? 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {data?.urgencySelection && data.urgencySelection.length > 0 && (
        <section className="rounded-lg border border-border/50 p-4">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
            Urgência
          </h3>
          <div className="mt-3 space-y-4">
            {data.urgencySelection.map((selection) => (
              <article
                key={selection.label}
                className="space-y-2 rounded-lg border border-border/50 p-3"
              >
                {/* Amostra selecionada */}
                <div className="text-xs text-muted-foreground">
                  Amostra selecionada:{" "}
                  {selection.days.map((day) => day.date).join("; ")}
                </div>
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{selection.label}</span>
                  <span>{selection.totalConsultations} registos</span>
                </div>
                <ul className="space-y-2 text-sm">
                  {selection.days.map((day) => (
                    <li key={day.date} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span>{day.date}</span>
                        <span className="text-xs text-muted-foreground">
                          {day.consultations} consultas
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Autonomia{" "}
                        {Object.entries(day.autonomyCounts)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(" · ")}
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      {data?.topProblems && data.topProblems.length > 0 && (
        <section className="rounded-lg border border-border/50 p-4">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
            Urgência - 20 problemas de saúde mais frequentes
          </h3>
          <div className="mt-3 text-sm">
            <div className="grid grid-cols-[2fr,1fr] gap-2 border-b border-border/50 pb-2 text-xs uppercase text-muted-foreground">
              <span>Problema</span>
              <span>Frequência</span>
            </div>
            <div className="space-y-1 pt-2 text-xs text-foreground">
              {data.topProblems.map((problem) => (
                <div
                  key={problem.code}
                  className="grid grid-cols-[2fr,1fr] items-center gap-2"
                >
                  <span>{problem.code}</span>
                  <span className="text-right font-semibold">
                    {problem.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {data?.internshipsSamples && data.internshipsSamples.length > 0 && (
        <section className="rounded-lg border border-border/50 p-4">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
            Formações complementares
          </h3>
          <div className="mt-3 space-y-4">
            {data.internshipsSamples.map((sample) => (
              <article key={sample.label} className="space-y-1">
                <div className="text-sm font-medium">{sample.label}</div>
                {sample.weeks.length ? (
                  <ul className="text-sm text-muted-foreground">
                    {sample.weeks.map((week) => (
                      <li key={`${sample.label}-${week.weekKey}`}>
                        {" "}
                        {week.startDate} → {week.endDate} ({week.consultations}{" "}
                        consultas)
                      </li>
                    ))}
                    {/* Total */}
                    <div className="text-xs text-muted-foreground">
                      Total:{" "}
                      {sample.weeks.reduce(
                        (sum, week) => sum + week.consultations,
                        0
                      )}{" "}
                      consultas
                    </div>
                  </ul>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    Sem registos suficientes
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
