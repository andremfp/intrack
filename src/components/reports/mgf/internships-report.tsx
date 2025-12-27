import type { InternshipsSample } from "@/reports/report-types";
import { BreakdownList, ReportSection } from "./shared";

interface InternshipsReportSectionProps {
  internshipSamples: InternshipsSample[];
}

export function InternshipsReportSection({
  internshipSamples,
}: InternshipsReportSectionProps) {
  const samplesWithTotals = internshipSamples.map((sample) => ({
    ...sample,
    totalConsultations: sample.weeks.reduce(
      (sum, week) => sum + week.consultations,
      0
    ),
  }));

  return (
    <ReportSection title="Formações complementares">
      <div className="space-y-4">
        {samplesWithTotals.length ? (
          samplesWithTotals.map((sample) => {
            const autonomyItems = Object.entries(sample.autonomyCounts)
              .filter(([, count]) => count > 0)
              .map(([autonomy, count]) => ({
                key: `${sample.label}-autonomy-${autonomy}`,
                label: autonomy,
                value: count,
                kind: "autonomy" as const,
              }));

            return (
              <article
                key={sample.label}
                className="space-y-4 rounded-lg border border-border/50 p-4"
              >
                <div className="flex items-center justify-between text-sm font-semibold">
                  <p className="text-sm font-semibold">{sample.label}</p>
                  <span className="text-xs uppercase text-muted-foreground">
                    {sample.totalConsultations} consultas
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-xs uppercase text-muted-foreground">
                    Amostra selecionada
                  </p>
                  {sample.weeks.length ? (
                    <ul className="space-y-2 text-sm">
                      {sample.weeks.map((week) => (
                        <li
                          key={`${sample.label}-${week.weekKey}`}
                          className="flex items-center justify-between text-xs"
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
                  ) : (
                    <p className="text-xs italic text-muted-foreground">
                      Sem registos suficientes na amostra selecionada.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase text-muted-foreground">
                    Detalhes da amostra
                  </p>
                  {autonomyItems.length ? (
                    <BreakdownList
                      size="xs"
                      className="mt-2"
                      items={autonomyItems}
                    />
                  ) : (
                    <p className="mt-2 text-xs italic text-muted-foreground">
                      Sem registos de autonomia.
                    </p>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <p className="text-xs italic text-muted-foreground">
            Sem registos selecionados para as formações complementares.
          </p>
        )}
      </div>
    </ReportSection>
  );
}
