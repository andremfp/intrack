"use client";

import { useEffect, useMemo, useState } from "react";
import type { Specialty } from "@/lib/api/specialties";
import { useConsultations } from "@/hooks/consultations/use-consultations";
import {
  getMGFConsultationsForExport,
  type ConsultationMGF,
} from "@/lib/api/consultations";
import { PAGINATION_CONSTANTS, TAB_CONSTANTS, EXPORT_MAX_ROWS } from "@/constants";
import { useFilters } from "@/hooks/filters/use-filters";
import {
  defaultConsultationsFilters,
  getFiltersKey,
} from "@/hooks/filters/helpers";
import { ConsultationsTable } from "./consultations-table";
import { DataErrorDisplay } from "@/components/ui/data-error-display";
import { mapConsultationsToExportTable } from "@/exports/helpers";
import { downloadCsv, downloadXlsx } from "@/exports/helpers";
import type { ExportSheet } from "@/exports/types";
import { toasts } from "@/utils/toasts";
import { buildConsultationsExportMetadataRows } from "@/components/consultations/helpers";
import { ImportConsultationModal } from "@/components/modals/import-consultation-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConsultationsDashboardProps {
  userId: string | undefined;
  specialty: Specialty | null;
  specialtyYear: number | undefined;
  onRowClick?: (consultation: ConsultationMGF) => void;
  onAddConsultation?: () => void;
  onRefreshReady?: (refresh: () => Promise<void>) => void;
}

export function ConsultationsDashboard({
  userId,
  specialty,
  specialtyYear,
  onRowClick,
  onAddConsultation,
  onRefreshReady,
}: ConsultationsDashboardProps) {
  // Per-year consultations filters are managed internally and persisted by year.
  const filtersKey = useMemo(
    () =>
      getFiltersKey(
        TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS,
        specialtyYear,
        undefined
      ),
    [specialtyYear]
  );

  const { filters, setFilter } = useFilters({
    filtersKey,
    defaultFilters: defaultConsultationsFilters,
  });

  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [exportConfirm, setExportConfirm] = useState<{
    format: "csv" | "xlsx";
  } | null>(null);

  const {
    consultations,
    totalCount,
    currentPage,
    sorting,
    isLoading,
    isInitialLoad,
    error,
    retryLoadConsultations,
    handleSortingChange,
    handlePageChange,
    handleBulkDelete,
    refreshConsultations,
    isBulkDeleting,
  } = useConsultations({
    userId,
    specialtyYear,
    mainTab: "Consultas",
    filters,
  });

  const executeExport = async (format: "csv" | "xlsx") => {
    if (!userId || specialtyYear === undefined) return;

    if (format === "csv") {
      setIsExportingCsv(true);
    } else {
      setIsExportingExcel(true);
    }

    try {
      const result = await getMGFConsultationsForExport(
        userId,
        specialtyYear,
        filters,
        sorting
      );

      if (!result.success) {
        toasts.apiError(
          result.error,
          "Erro ao exportar consultas para ficheiro"
        );
        return;
      }

      const consultationsForExport: ConsultationMGF[] = result.data;
      const { headers, rows } = mapConsultationsToExportTable(
        consultationsForExport
      );
      const metadataRows = buildConsultationsExportMetadataRows({
        filters,
        specialty,
        specialtyYear,
      });

      const today = new Date();
      const datePart = today.toISOString().split("T")[0];
      const baseFilename = `consultas_${datePart}`;

      if (format === "csv") {
        downloadCsv(
          {
            headers,
            rows,
            metadataRows,
          },
          `${baseFilename}.csv`
        );
      } else {
        const sheets: ExportSheet[] = [
          {
            sheetName: "Consultas",
            headers,
            rows,
            metadataRows,
          },
        ];
        await downloadXlsx(sheets, `${baseFilename}.xlsx`);
      }
    } finally {
      if (format === "csv") {
        setIsExportingCsv(false);
      } else {
        setIsExportingExcel(false);
      }
    }
  };

  const handleExport = (format: "csv" | "xlsx") => {
    if (!userId || specialtyYear === undefined) return;
    setExportConfirm({ format });
  };

  const handleExportConfirm = async () => {
    if (!exportConfirm) return;
    const format = exportConfirm.format;
    setExportConfirm(null);
    await executeExport(format);
  };

  // Expose refresh function to parent
  useEffect(() => {
    onRefreshReady?.(refreshConsultations);
  }, [refreshConsultations, onRefreshReady]);

  if (isLoading && isInitialLoad) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">
            A carregar consultas...
          </p>
        </div>
      </div>
    );
  }

  if (error && consultations.length === 0) {
    return (
      <DataErrorDisplay
        error={error}
        onRetry={retryLoadConsultations}
        title="Erro ao carregar consultas"
      />
    );
  }

  const exportCount = Math.min(totalCount, EXPORT_MAX_ROWS);
  const isCapped = totalCount > EXPORT_MAX_ROWS;

  return (
    <>
      <div className="flex-1 flex flex-col relative min-h-0">
        <ConsultationsTable
          data={{
            consultations,
            totalCount,
          }}
          pagination={{
            currentPage,
            pageSize: PAGINATION_CONSTANTS.CONSULTATIONS_PAGE_SIZE,
            onPageChange: handlePageChange,
          }}
          specialty={{
            code: specialty?.code,
            year: specialty && specialty.years > 1 ? specialtyYear : undefined,
          }}
          filters={{
            filters,
            sorting,
            setFilter,
            onSortingChange: handleSortingChange,
          }}
          actions={{
            onRowClick,
            onAddConsultation,
            onBulkDelete: handleBulkDelete,
            onExportCsv: () => handleExport("csv"),
            onExportExcel: () => handleExport("xlsx"),
            isExportingCsv,
            isExportingExcel,
            onImport: () => setIsImportModalOpen(true),
            onRefresh: refreshConsultations,
            isBulkDeleting: isBulkDeleting,
          }}
          isLoading={isLoading}
        />
      </div>

      <Dialog
        open={exportConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setExportConfirm(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Exportar consultas</DialogTitle>
            <DialogDescription>
              {isCapped ? (
                <>
                  Serão exportadas as primeiras{" "}
                  <strong>{exportCount.toLocaleString("pt-PT")}</strong>{" "}
                  consultas (limite máximo por exportação).{" "}
                  <span className="text-foreground">
                    Aplique filtros para reduzir o número de resultados.
                  </span>
                </>
              ) : (
                <>
                  Vai exportar{" "}
                  <strong>{exportCount.toLocaleString("pt-PT")}</strong>{" "}
                  consulta{exportCount !== 1 ? "s" : ""}.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportConfirm(null)}>
              Cancelar
            </Button>
            <Button onClick={handleExportConfirm}>Exportar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isImportModalOpen &&
        userId &&
        specialty &&
        specialtyYear !== undefined && (
          <ImportConsultationModal
            userId={userId}
            specialty={specialty}
            specialtyYear={specialtyYear}
            onClose={() => setIsImportModalOpen(false)}
            onImportComplete={() => {
              refreshConsultations();
            }}
          />
        )}
    </>
  );
}
