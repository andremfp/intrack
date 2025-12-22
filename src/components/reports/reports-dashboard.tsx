import { DataErrorDisplay } from "@/components/ui/data-error-display";
import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { useReportsData } from "@/hooks/reports/use-reports";
import type { MGFReportKey } from "@/reports/mgf/mgf-reports";
import { getReportTabDefinition } from "@/reports/helpers";

const reportSectionsLoaders = import.meta.glob("./*/sections.tsx");

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

  const [SpecialtySections, setSpecialtySections] =
    useState<ComponentType<SpecialtyReportSectionsProps> | null>(null);
  const [moduleLoadError, setModuleLoadError] = useState(false);

  useEffect(() => {
    let canceled = false;
    const modulePath = `./${specialtyCode}/sections.tsx`;
    const loader = reportSectionsLoaders[modulePath];
    if (!definition) {
      setSpecialtySections(null);
      return;
    }

    if (!loader) {
      setSpecialtySections(null);
      setModuleLoadError(true);
      return;
    }

    setModuleLoadError(false);
    setSpecialtySections(null);
    loader()
      .then((mod) => {
        if (canceled) return;
        const sectionModule = mod as SpecialtyReportSectionsModule;
        setSpecialtySections(() => sectionModule.default);
      })
      .catch(() => {
        if (canceled) return;
        setSpecialtySections(null);
        setModuleLoadError(true);
      });

    return () => {
      canceled = true;
    };
  }, [definition, specialtyCode]);

  if (!definition) {
    return <p className="text-sm text-destructive">Relatório inválido.</p>;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pb-4 pt-2">
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

      {moduleLoadError && !isLoading && !error && (
        <div className="rounded-lg border border-border/50 p-4 text-sm text-destructive">
          Relatório específico para {specialtyCode} indisponível.
        </div>
      )}

      {SpecialtySections && (
        <SpecialtySections data={data} specialtyCode={specialtyCode} />
      )}
    </div>
  );
}

interface SpecialtyReportSectionsProps {
  data?: unknown;
  specialtyCode: string;
}

interface SpecialtyReportSectionsModule {
  default: ComponentType<SpecialtyReportSectionsProps>;
}
