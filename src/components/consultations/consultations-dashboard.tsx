"use client";

import { useEffect, useMemo } from "react";
import type { Specialty } from "@/lib/api/specialties";
import { useConsultations } from "@/hooks/consultations/use-consultations";
import type {
  ConsultationsFilters,
  ConsultationMGF,
} from "@/lib/api/consultations";
import { PAGINATION_CONSTANTS, TAB_CONSTANTS } from "@/constants";
import { useFilters } from "@/hooks/filters/use-filters";
import {
  defaultConsultationsFilters,
  getFiltersKey,
} from "@/hooks/filters/helpers";
import { ConsultationsTable } from "./consultations-table";
import { DataErrorDisplay } from "@/components/ui/data-error-display";

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

  const { filters, setFilter } = useFilters<ConsultationsFilters>({
    filtersKey,
    defaultFilters: defaultConsultationsFilters,
  });

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
  } = useConsultations({
    userId,
    specialtyYear,
    mainTab: "Consultas",
    filters,
  });

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

  return (
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
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
