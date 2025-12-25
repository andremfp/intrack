import type { ProblemCount, UrgencySelection } from "@/reports/report-types";
import { BreakdownList, ReportSection } from "./shared";

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
          <div className="space-y-3">
            {urgencySelections.map((selection) => {
              const dayItems = selection.days.map((day) => {
                return {
                  key: `${selection.label}-${selection.internship}-${day.date}`,
                  date: day.date,
                  consultations: day.consultations,
                  kind: "autonomy" as const,
                };
              });

              const autonomyItems = Object.entries(
                selection.autonomyTotals
              ).map(([autonomy, count]) => ({
                key: `${selection.label}-${selection.internship}-${autonomy}`,
                label: autonomy,
                value: count,
                kind: "autonomy" as const,
              }));

              return (
                <article
                  key={`${selection.label}-${selection.internship}`}
                  className="space-y-4 rounded-lg border border-border/50 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{selection.label}</p>
                    </div>
                    <span className="text-xs uppercase text-muted-foreground">
                      {selection.totalConsultations}{" "}
                      {selection.totalConsultations === 1
                        ? "consulta"
                        : "consultas"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                      <p className="text-xs uppercase text-muted-foreground">
                        Amostra selecionada
                      </p>
                      {dayItems.length ? (
                        <div className="mt-2 space-y-2 text-sm">
                          {dayItems.map((day) => (
                            <div
                              key={day.key}
                              className="flex items-center justify-between"
                            >
                              <span>{day.date}</span>
                              <span className="font-semibold">
                                {day.consultations}{" "}
                                {day.consultations === 1
                                  ? "consulta"
                                  : "consultas"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs italic text-muted-foreground">
                          Sem dias selecionados.
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Detalhe da amostra
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
