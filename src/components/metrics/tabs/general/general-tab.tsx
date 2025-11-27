import { useMemo } from "react";
import { DonutCenterChart } from "../../charts/donut-center-chart";
import { TimeSeriesChart } from "../../charts/time-series-chart";
import { ConsultationFilters } from "@/components/filters/consultation-filters";
import type { FilterUIConfig } from "@/components/filters/types";
import { createFilterConfig } from "@/components/filters/helpers";
import { METRICS_GENERAL_ENABLED_FIELDS } from "@/constants";
import type { GeneralTabProps } from "../../helpers";

export function GeneralTab({
  specialty,
  filters,
  setFilter,
  metrics,
  getSexLabel,
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

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 pt-4 px-1">
      {/* Filters - badges on left, button on right */}
      <ConsultationFilters config={filterConfig} />

      {/* Key metrics charts: keep side-by-side even on small screens */}
      <div className="grid gap-3 grid-cols-2 flex-shrink-0">
        <DonutCenterChart
          title="Total Consultas"
          data={metrics.bySex.map((s) => ({ sex: s.sex, count: s.count }))}
          getKey={(i) => i.sex}
          getLabel={(sex) => getSexLabel(String(sex))}
          centerValue={metrics.totalConsultations.toLocaleString()}
          centerLabel="Consultas"
        />
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

      {/* Time series chart - takes remaining space */}
      <div className="flex-1 min-h-0">
        <TimeSeriesChart data={metrics.byMonth} />
      </div>
    </div>
  );
}
