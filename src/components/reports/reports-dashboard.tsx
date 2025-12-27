import { DataErrorDisplay } from "@/components/ui/data-error-display";
import { ExportMenu } from "@/components/ui/export-menu";
import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import type { ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import { useReportsData } from "@/hooks/reports/use-reports";
import type { MGFReportKey } from "@/reports/mgf/mgf-reports";
import { getReportTabDefinition } from "@/reports/helpers";
import {
  buildReportExportMetadataRows,
  buildReportExportSheets,
  buildReportExportTable,
  downloadCsv,
  downloadXlsx,
  downloadReportPdfReact,
} from "@/exports/helpers";
import { toasts } from "@/utils/toasts";

const reportSectionsLoaders = import.meta.glob("./*/sections.tsx");
const reportPdfLoaders = import.meta.glob("./*/pdf.tsx");

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
  const [buildPdfDocument, setBuildPdfDocument] = useState<
    ((props: SpecialtyReportPdfDocProps) => ReactElement<DocumentProps>) | null
  >(null);
  const [moduleLoadError, setModuleLoadError] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let canceled = false;
    const modulePath = `./${specialtyCode}/sections.tsx`;
    const loader = reportSectionsLoaders[modulePath];
    const pdfModulePath = `./${specialtyCode}/pdf.tsx`;
    const pdfLoader = reportPdfLoaders[pdfModulePath];

    if (!definition) {
      setSpecialtySections(null);
      setBuildPdfDocument(null);
      return;
    }

    if (!loader) {
      setSpecialtySections(null);
      setBuildPdfDocument(null);
      setModuleLoadError(true);
      return;
    }

    setModuleLoadError(false);
    setSpecialtySections(null);
    setBuildPdfDocument(null);
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

    if (pdfLoader) {
      pdfLoader()
        .then((mod) => {
          if (canceled) return;
          const pdfModule = mod as SpecialtyReportPdfModule;
          setBuildPdfDocument(() => pdfModule.buildPdfDocument);
        })
        .catch(() => {
          if (canceled) return;
          setBuildPdfDocument(null);
        });
    }

    return () => {
      canceled = true;
    };
  }, [definition, specialtyCode]);

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    if (!data || !definition) return;

    const metadataRows = buildReportExportMetadataRows({
      specialtyCode,
      reportLabel: definition.label,
      reportKey: definition.key,
    });
    const today = new Date();
    const datePart = today.toISOString().split("T")[0];
    const baseFilename = `relatorio_${specialtyCode.toLowerCase()}_${
      definition.key
    }_${datePart}`;

    if (format === "csv") {
      setIsExportingCsv(true);
      try {
        const table = buildReportExportTable({
          reportData: data,
          metadataRows,
          reportLabel: definition.label,
        });
        downloadCsv(table, `${baseFilename}.csv`);
      } catch {
        toasts.error(
          "Erro ao exportar relatório",
          "Não foi possível gerar o CSV. Tente novamente."
        );
      } finally {
        setIsExportingCsv(false);
      }
      return;
    }

    if (format === "xlsx") {
      setIsExportingExcel(true);
      try {
        const sheets = buildReportExportSheets({
          reportData: data,
          metadataRows,
          reportLabel: definition.label,
        });
        if (sheets.length === 0) {
          toasts.error("Sem dados para exportar", "O relatório está vazio.");
          return;
        }
        await downloadXlsx(sheets, `${baseFilename}.xlsx`);
      } catch {
        toasts.error(
          "Erro ao exportar relatório",
          "Não foi possível gerar o ficheiro XLSX. Tente novamente."
        );
      } finally {
        setIsExportingExcel(false);
      }
      return;
    }

    if (!buildPdfDocument) {
      toasts.error(
        "PDF indisponível",
        "A carregar o relatório. Aguarde um momento e tente novamente."
      );
      return;
    }

    setIsPrinting(true);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const filename = `${baseFilename}.pdf`;
    console.debug("[ReportsDashboard] exporting PDF", {
      filename,
      specialtyCode,
      reportKey: definition.key,
    });
    try {
      const pdfDocument = buildPdfDocument({
        data,
        specialtyCode,
        definition: {
          label: definition.label,
          description: definition.description,
          sections: definition.sections,
        },
      });
      await downloadReportPdfReact({ filename, pdfDocument });
      console.debug("[ReportsDashboard] PDF export succeeded", { filename });
    } catch (error) {
      console.error("[ReportsDashboard] downloadReportPdf failed", {
        filename,
        specialtyCode,
        reportKey: definition.key,
        error,
      });
      toasts.error(
        "Erro ao exportar relatório",
        "Não foi possível gerar o PDF. Tente novamente."
      );
    } finally {
      setIsPrinting(false);
    }
    return;
  };

  if (!definition) {
    return <p className="text-sm text-destructive">Relatório inválido.</p>;
  }

  return (
    <div
      ref={reportRef}
      data-report-target="true"
      className="report-print-wrapper flex flex-1 flex-col gap-6 pb-4 pt-2"
    >
      <section className="space-y-3 rounded-lg border border-border/50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Relatório
            </p>
            <h2 className="text-lg font-semibold">{definition.label}</h2>
          </div>
          <div className="report-export-controls print:hidden">
            <ExportMenu
              onExportCsv={() => handleExport("csv")}
              onExportExcel={() => handleExport("xlsx")}
              onExportPdf={() => handleExport("pdf")}
              isExportingCsv={isExportingCsv}
              isExportingExcel={isExportingExcel}
              isPrinting={isPrinting}
              isLoading={isLoading || !data}
            />
          </div>
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

interface SpecialtyReportPdfDocProps extends SpecialtyReportSectionsProps {
  definition: {
    label: string;
    description: string;
    sections: Array<{
      key: string;
      title: string;
      description: string;
      sampleDescription?: string;
    }>;
  };
}

interface SpecialtyReportSectionsModule {
  default: ComponentType<SpecialtyReportSectionsProps>;
}

interface SpecialtyReportPdfModule {
  buildPdfDocument: (
    props: SpecialtyReportPdfDocProps
  ) => ReactElement<DocumentProps>;
}
