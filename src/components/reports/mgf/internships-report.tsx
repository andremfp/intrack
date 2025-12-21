import type { InternshipsSample } from "@/reports/report-types";
import { ReportSection } from "./shared";

interface InternshipsReportSectionProps {
  internshipSamples: InternshipsSample[];
}

export function InternshipsReportSection({
  internshipSamples,
}: InternshipsReportSectionProps) {
  return (
    <ReportSection
      title="Formações complementares"
      subtitle="Semanas inscritas por estágio"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {internshipSamples.map((sample) => {
          const sampleTotal = sample.weeks.reduce(
            (sum, week) => sum + week.consultations,
            0
          );

          return (
            <article
              key={sample.label}
              className="space-y-3 rounded-lg border border-border/50 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{sample.label}</p>
                <span className="text-xs uppercase text-muted-foreground">
                  {sampleTotal} consultas
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Estágios: {sample.internships.join(" · ")}
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
                  Sem registos suficientes
                </p>
              )}
            </article>
          );
        })}
      </div>
    </ReportSection>
  );
}

