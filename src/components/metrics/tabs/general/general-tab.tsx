import type { Specialty } from "@/lib/api/specialties";
import { DonutCenterChart } from "../../charts/donut-center-chart";
import type { ConsultationMetrics } from "@/lib/api/consultations";
import { TimeSeriesChart } from "../../charts/time-series-chart";
import {
  ConsultationFilters,
  type FilterConfig,
} from "@/components/filters/consultation-filters";

interface GeneralTabProps {
  specialty: Specialty | null;
  selectedYear: number | undefined;
  selectedLocation: string | undefined;
  selectedType: string | undefined;
  selectedPresential: boolean | undefined;
  selectedSmoker: boolean | undefined;
  selectedSex: string | undefined;
  selectedAutonomy: string | undefined;
  selectedAgeMin: number | undefined;
  selectedAgeMax: number | undefined;
  selectedDateFrom: string | undefined;
  selectedDateTo: string | undefined;
  locations: string[];
  internships: string[];
  metrics: ConsultationMetrics;
  getSexLabel: (sex: string) => string;
  onSelectedYearChange: (year: number | undefined) => void;
  onSelectedLocationChange: (location: string | undefined) => void;
  onSelectedTypeChange: (type: string | undefined) => void;
  onSelectedPresentialChange: (presential: boolean | undefined) => void;
  onSelectedSmokerChange: (smoker: boolean | undefined) => void;
  onSelectedSexChange: (sex: string | undefined) => void;
  onSelectedAutonomyChange: (autonomy: string | undefined) => void;
  onSelectedAgeMinChange: (ageMin: number | undefined) => void;
  onSelectedAgeMaxChange: (ageMax: number | undefined) => void;
  onSelectedDateFromChange: (dateFrom: string | undefined) => void;
  onSelectedDateToChange: (dateTo: string | undefined) => void;
  onApplyFilters?: (newFilters?: Record<string, unknown>) => void;
}

export function GeneralTab({
  specialty,
  selectedYear,
  selectedLocation,
  selectedType,
  selectedPresential,
  selectedSmoker,
  selectedSex,
  selectedAutonomy,
  selectedAgeMin,
  selectedAgeMax,
  selectedDateFrom,
  selectedDateTo,
  locations,
  internships,
  metrics,
  getSexLabel,
  onSelectedYearChange,
  onSelectedLocationChange,
  onSelectedTypeChange,
  onSelectedPresentialChange,
  onSelectedSmokerChange,
  onSelectedSexChange,
  onSelectedAutonomyChange,
  onSelectedAgeMinChange,
  onSelectedAgeMaxChange,
  onSelectedDateFromChange,
  onSelectedDateToChange,
  onApplyFilters,
}: GeneralTabProps) {
  const filterConfig: FilterConfig = {
    enabledFields: [
      "year",
      "location",
      "autonomy",
      "sex",
      "ageRange",
      "type",
      "presential",
      "smoker",
      "dateRange",
    ],
    badgeLocation: "outside",
    specialty,
    locations,
    internships,
    filterValues: {
      year: selectedYear,
      location: selectedLocation,
      autonomy: selectedAutonomy,
      sex: selectedSex,
      ageMin: selectedAgeMin,
      ageMax: selectedAgeMax,
      type: selectedType,
      presential: selectedPresential,
      smoker: selectedSmoker,
      dateFrom: selectedDateFrom,
      dateTo: selectedDateTo,
    },
    filterSetters: {
      year: (value) => onSelectedYearChange(value as number | undefined),
      location: (value) =>
        onSelectedLocationChange(value as string | undefined),
      sex: (value) => onSelectedSexChange(value as string | undefined),
      autonomy: (value) =>
        onSelectedAutonomyChange(value as string | undefined),
      ageMin: (value) => onSelectedAgeMinChange(value as number | undefined),
      ageMax: (value) => onSelectedAgeMaxChange(value as number | undefined),
      type: (value) => onSelectedTypeChange(value as string | undefined),
      presential: (value) =>
        onSelectedPresentialChange(value as boolean | undefined),
      smoker: (value) => onSelectedSmokerChange(value as boolean | undefined),
      dateFrom: (value) =>
        onSelectedDateFromChange(value as string | undefined),
      dateTo: (value) => onSelectedDateToChange(value as string | undefined),
    },
    onApplyFilters: (newFilters) => {
      onApplyFilters?.(newFilters);
    },
  };

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
