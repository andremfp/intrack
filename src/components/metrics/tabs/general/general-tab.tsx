import type { Specialty } from "@/lib/api/specialties";
import { DonutCenterChart } from "../../charts/donut-center-chart";
import type { ConsultationMetrics } from "@/lib/api/consultations";
import { TimeSeriesChart } from "../../charts/time-series-chart";
import { MetricsFilters } from "../../metrics-filters";

interface GeneralTabProps {
  specialty: Specialty | null;
  selectedYear: number | undefined;
  selectedLocation: string | undefined;
  selectedInternship: string | undefined;
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
  onSelectedInternshipChange: (internship: string | undefined) => void;
  onSelectedSexChange: (sex: string | undefined) => void;
  onSelectedAutonomyChange: (autonomy: string | undefined) => void;
  onSelectedAgeMinChange: (ageMin: number | undefined) => void;
  onSelectedAgeMaxChange: (ageMax: number | undefined) => void;
  onSelectedDateFromChange: (dateFrom: string | undefined) => void;
  onSelectedDateToChange: (dateTo: string | undefined) => void;
}

export function GeneralTab({
  specialty,
  selectedYear,
  selectedLocation,
  selectedInternship,
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
  onSelectedInternshipChange,
  onSelectedSexChange,
  onSelectedAutonomyChange,
  onSelectedAgeMinChange,
  onSelectedAgeMaxChange,
  onSelectedDateFromChange,
  onSelectedDateToChange,
}: GeneralTabProps) {
  return (
    <div className="flex flex-col h-full min-h-0 gap-3 pt-4 px-1">
      {/* Filters - badges on left, button on right */}
      <MetricsFilters
        specialty={specialty}
        selectedYear={selectedYear}
        selectedLocation={selectedLocation}
        selectedInternship={selectedInternship}
        selectedSex={selectedSex}
        selectedAutonomy={selectedAutonomy}
        selectedAgeMin={selectedAgeMin}
        selectedAgeMax={selectedAgeMax}
        selectedDateFrom={selectedDateFrom}
        selectedDateTo={selectedDateTo}
        locations={locations}
        internships={internships}
        onSelectedYearChange={onSelectedYearChange}
        onSelectedLocationChange={onSelectedLocationChange}
        onSelectedInternshipChange={onSelectedInternshipChange}
        onSelectedSexChange={onSelectedSexChange}
        onSelectedAutonomyChange={onSelectedAutonomyChange}
        onSelectedAgeMinChange={onSelectedAgeMinChange}
        onSelectedAgeMaxChange={onSelectedAgeMaxChange}
        onSelectedDateFromChange={onSelectedDateFromChange}
        onSelectedDateToChange={onSelectedDateToChange}
      />

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
