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

interface GeneralTabProps {
  specialty: Specialty | null;
  selectedYear: number | undefined;
  metrics: ConsultationMetrics;
  getSexLabel: (sex: string) => string;
  onSelectedYearChange: (year: number | undefined) => void;
}

export function GeneralTab({
  specialty,
  selectedYear,
  metrics,
  getSexLabel,
  onSelectedYearChange,
}: GeneralTabProps) {
  return (
    <div className="flex flex-col h-full min-h-0 gap-3 pt-4 px-1">
      {/* Year selector for multi-year specialties */}
      {specialty && specialty.years > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
              Ano da Especialidade:
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
        </div>
      )}

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
