import type { ProblemCount, UrgencySelection } from "@/reports/report-types";
import { BreakdownList, ReportSection } from "./shared";
import { formatAutonomyCounts } from "./helpers";

interface UrgencyReportSectionProps {
  urgencySelections: UrgencySelection[];
  topProblems: ProblemCount[];
}

export function UrgencyReportSection({
  urgencySelections,
  topProblems,
}: UrgencyReportSectionProps) {
  return (
    <ReportSection title="Urgência">
      <div className="space-y-6">
        {urgencySelections.length ? (
          <div className="space-y-4">
            {urgencySelections.map((selection) => {
              const dayItems = selection.days.map((day) => {
                const autonomyHelper = formatAutonomyCounts(day.autonomyCounts);
                return {
                  key: `${selection.label}-${day.date}`,
                  label: day.date,
                  value: `${day.consultations} consultas`,
                  helper: autonomyHelper
                    ? `Autonomia ${autonomyHelper}`
                    : undefined,
                };
              });

              return (
                <article
                  key={selection.label}
                  className="space-y-3 rounded-lg border border-border/50 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{selection.label}</p>
                    </div>
                    <span className="text-xs uppercase text-muted-foreground">
                      {selection.totalConsultations}{" "}
                      {selection.totalConsultations === 1 ? "registo" : "registos"}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Dias selecionados
                      </p>
                      {dayItems.length ? (
                        <BreakdownList size="xs" className="mt-2" items={dayItems} />
                      ) : (
                        <p className="mt-2 text-xs italic text-muted-foreground">
                          Sem dias selecionados.
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Totais por autonomia
                      </p>
                      <BreakdownList
                        size="xs"
                        className="mt-2"
                        items={Object.entries(selection.autonomyTotals).map(
                          ([autonomy, count]) => ({
                            key: `${selection.label}-${autonomy}`,
                            label: autonomy,
                            value: count,
                          })
                        )}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-xs italic text-muted-foreground">
            Sem registos selecionados para urgência.
          </p>
        )}

        {topProblems.length > 0 && (
          <div className="space-y-2 text-sm">
            <p className="text-xs uppercase text-muted-foreground">
              20 problemas de saúde mais frequentes
            </p>
            <BreakdownList
              size="xs"
              items={topProblems.map((problem) => ({
                key: problem.code,
                label: problem.code,
                value: problem.count,
              }))}
            />
          </div>
        )}
      </div>
    </ReportSection>
  );
}

