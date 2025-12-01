import { useMemo, useRef } from "react";
import { DonutCenterChart } from "../../charts/donut-center-chart";
import { TimeSeriesChart } from "../../charts/time-series-chart";
import type { FilterUIConfig } from "@/components/filters/types";
import { createFilterConfig } from "@/components/filters/helpers";
import { METRICS_GENERAL_ENABLED_FIELDS } from "@/constants";
import type { GeneralTabProps } from "../../helpers";
import { EmptyMetricsState } from "../../empty-metrics-state";
import { MetricsToolbar } from "../../metrics-toolbar";

export function GeneralTab({
  specialty,
  filters,
  setFilter,
  metrics,
  hasActiveFilters,
  getSexLabel,
  onExportExcel,
  isExportingExcel,
}: GeneralTabProps) {
  // Memoize filterValues to prevent unnecessary re-renders and resets
  const filterValues = useMemo(
    () => ({
      year: filters.year,
      location: filters.location,
      autonomy: filters.autonomy,
      sex: filters.sex,
      ageMin: filters.ageMin,
      ageMax: filters.ageMax,
      type: filters.type,
      presential: filters.presential,
      smoker: filters.smoker,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    [
      filters.year,
      filters.location,
      filters.autonomy,
      filters.sex,
      filters.ageMin,
      filters.ageMax,
      filters.type,
      filters.presential,
      filters.smoker,
      filters.dateFrom,
      filters.dateTo,
    ]
  );

  const filterConfig: FilterUIConfig = (createFilterConfig({
    enabledFields: METRICS_GENERAL_ENABLED_FIELDS,
    badgeLocation: "outside",
    filterValues,
    setFilter,
    specialty,
  }) || {
    enabledFields: [],
    badgeLocation: "outside",
    filterValues: {},
    filterSetters: {},
  }) as FilterUIConfig;

  const totalChartRef = useRef<HTMLDivElement | null>(null);
  const ageChartRef = useRef<HTMLDivElement | null>(null);
  const timeSeriesRef = useRef<HTMLDivElement | null>(null);

  // If there are no consultations in the metrics data, show a single
  // empty state instead of rendering multiple empty charts.
  if (metrics.totalConsultations === 0) {
    const disableFilters =
      !hasActiveFilters && metrics.totalConsultations === 0;

    return (
      <EmptyMetricsState
        filterConfig={filterConfig}
        disableFilters={disableFilters}
      />
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 pt-4 px-1">
      <MetricsToolbar
        filterConfig={filterConfig}
        hasActiveFilters={!!hasActiveFilters}
        totalConsultations={metrics.totalConsultations}
        onExportExcel={onExportExcel}
        isExportingExcel={isExportingExcel}
      />

      {/* Key metrics charts: keep side-by-side even on small screens */}
      <div className="grid gap-3 grid-cols-2 flex-shrink-0">
        <div className="relative" ref={totalChartRef}>
          <DonutCenterChart
            title="Total Consultas"
            data={metrics.bySex.map((s) => ({ sex: s.sex, count: s.count }))}
            getKey={(i) => i.sex}
            getLabel={(sex) => getSexLabel(String(sex))}
            centerValue={metrics.totalConsultations.toLocaleString()}
            centerLabel="Consultas"
          />
        </div>
        <div className="relative" ref={ageChartRef}>
          <DonutCenterChart
            title="Idades"
            data={metrics.byAgeRange.map((r) => ({
              range: r.range,
              count: r.count,
            }))}
            getKey={(i) => i.range}
            getLabel={(key) => key}
            centerValue={`${metrics.averageAge.toFixed(1)}`}
            centerLabel="Idade média"
          />
        </div>
      </div>

      {/* Time series chart - takes remaining space */}
      <div className="flex-1 min-h-0 relative" ref={timeSeriesRef}>
        <TimeSeriesChart data={metrics.byMonth} />
      </div>
    </div>
  );
}
