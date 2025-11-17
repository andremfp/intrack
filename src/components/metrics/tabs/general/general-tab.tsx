import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Specialty } from "@/lib/api/specialties";
import { DonutCenterChart } from "../../charts/donut-center-chart";
import type { ConsultationMetrics } from "@/lib/api/consultations";
import { TimeSeriesChart } from "../../charts/time-series-chart";
import { MGF_FIELDS, COMMON_CONSULTATION_FIELDS } from "@/constants";

interface GeneralTabProps {
  specialty: Specialty | null;
  selectedYear: number | undefined;
  selectedLocation: string | undefined;
  selectedInternship: string | undefined;
  locations: string[];
  internships: string[];
  metrics: ConsultationMetrics;
  getSexLabel: (sex: string) => string;
  onSelectedYearChange: (year: number | undefined) => void;
  onSelectedLocationChange: (location: string | undefined) => void;
  onSelectedInternshipChange: (internship: string | undefined) => void;
}

// Helper function to get internship label from value
function getInternshipLabel(value: string): string {
  const internshipField = MGF_FIELDS.find(
    (field) => field.key === "internship"
  );
  if (!internshipField?.options) return value;
  const option = internshipField.options.find((opt) => opt.value === value);
  return option?.label || value;
}

// Helper function to get location label from value
function getLocationLabel(value: string): string {
  const locationField = COMMON_CONSULTATION_FIELDS.find(
    (field) => field.key === "location"
  );
  if (!locationField?.options) return value;
  const option = locationField.options.find((opt) => opt.value === value);
  return option?.label || value;
}

export function GeneralTab({
  specialty,
  selectedYear,
  selectedLocation,
  selectedInternship,
  locations,
  internships,
  metrics,
  getSexLabel,
  onSelectedYearChange,
  onSelectedLocationChange,
  onSelectedInternshipChange,
}: GeneralTabProps) {
  // Only show internship selector when location is not 'health_unit'
  const shouldShowInternship =
    internships.length > 0 && selectedLocation !== "health_unit";

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 pt-4 px-1">
      {/* Year, Location, and Internship selectors */}
      {(specialty && specialty.years > 1) ||
      locations.length > 0 ||
      shouldShowInternship ? (
        <div className="flex items-center flex-wrap gap-3">
          {/* Year selector for multi-year specialties */}
          {specialty && specialty.years > 1 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                Ano:
              </span>
              <Select
                value={selectedYear?.toString() || "all"}
                onValueChange={(value) =>
                  onSelectedYearChange(
                    value === "all" ? undefined : parseInt(value)
                  )
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {Array.from({ length: specialty.years }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {specialty.code.toUpperCase()}.{i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Location selector */}
          {locations.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                Local:
              </span>
              <Select
                value={selectedLocation || "all"}
                onValueChange={(value) =>
                  onSelectedLocationChange(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os locais</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {getLocationLabel(location)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Internship selector - only shown when location is not 'health_unit' */}
          {shouldShowInternship && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                Estágio:
              </span>
              <Select
                value={selectedInternship || "all"}
                onValueChange={(value) =>
                  onSelectedInternshipChange(
                    value === "all" ? undefined : value
                  )
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estágios</SelectItem>
                  {internships.map((internship) => (
                    <SelectItem key={internship} value={internship}>
                      {getInternshipLabel(internship)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      ) : null}

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
