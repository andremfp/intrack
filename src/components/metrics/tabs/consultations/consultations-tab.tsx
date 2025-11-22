import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationMetrics } from "@/lib/api/consultations";
import { BreakdownChart } from "../../charts/breakdown-chart";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { MetricCard } from "../../cards/metric-card";
import { BreakdownTable } from "../../charts/breakdown-table";
import { getFieldLabel } from "../../utils";
import {
  ConsultationFilters,
  type FilterConfig,
} from "@/components/filters/consultation-filters";

interface ConsultationsTabProps {
  specialty: Specialty | null;
  selectedYear: number | undefined;
  selectedLocation: string | undefined;
  selectedInternship: string | undefined;
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
  onSelectedYearChange: (year: number | undefined) => void;
  onSelectedLocationChange: (location: string | undefined) => void;
  onSelectedInternshipChange: (internship: string | undefined) => void;
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

export function ConsultationsTab({
  specialty,
  selectedYear,
  selectedLocation,
  selectedInternship,
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
  onSelectedYearChange,
  onSelectedLocationChange,
  onSelectedInternshipChange,
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
}: ConsultationsTabProps) {
  const filterConfig: FilterConfig = {
    enabledFields: [
      "year",
      "location",
      "internship",
      "sex",
      "autonomy",
      "ageRange",
      "dateRange",
    ],
    badgeLocation: "outside",
    specialty,
    locations,
    internships,
    filterValues: {
      year: selectedYear,
      location: selectedLocation,
      internship: selectedInternship,
      type: selectedType,
      presential: selectedPresential,
      smoker: selectedSmoker,
      sex: selectedSex,
      autonomy: selectedAutonomy,
      ageMin: selectedAgeMin,
      ageMax: selectedAgeMax,
      dateFrom: selectedDateFrom,
      dateTo: selectedDateTo,
    },
    filterSetters: {
      year: (value) => onSelectedYearChange(value as number | undefined),
      location: (value) =>
        onSelectedLocationChange(value as string | undefined),
      internship: (value) =>
        onSelectedInternshipChange(value as string | undefined),
      type: (value) => onSelectedTypeChange(value as string | undefined),
      presential: (value) =>
        onSelectedPresentialChange(value as boolean | undefined),
      smoker: (value) => onSelectedSmokerChange(value as boolean | undefined),
      sex: (value) => onSelectedSexChange(value as string | undefined),
      autonomy: (value) =>
        onSelectedAutonomyChange(value as string | undefined),
      ageMin: (value) => onSelectedAgeMinChange(value as number | undefined),
      ageMax: (value) => onSelectedAgeMaxChange(value as number | undefined),
      dateFrom: (value) =>
        onSelectedDateFromChange(value as string | undefined),
      dateTo: (value) => onSelectedDateToChange(value as string | undefined),
    },
    onApplyFilters: (newFilters) => {
      onApplyFilters?.(newFilters);
    },
  };

  return (
    <div className="flex flex-col gap-3 px-1">
      {/* Filters button */}
      <div className="flex justify-end pt-4">
        <ConsultationFilters config={filterConfig} />
      </div>

      <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
        <BreakdownChart
          title="Tipo de Consulta"
          data={metrics.byType.map((item) => ({
            label: item.label,
            type: item.type,
            value: item.count,
          }))}
        />
        <MetricCard
          title="Atendimento"
          data={metrics.byPresential}
          getKey={(item) => item.presential}
          getLabel={(key) => (key === "true" ? "Presencial" : "Remoto")}
        />
      </div>
      <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
        <Collapsible className="lg:col-span-2">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex w-full items-center justify-between"
            >
              <span>Fumadores</span>
              <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 grid gap-3">
            <MetricCard
              title="Fumadores"
              data={metrics.bySmoker}
              getKey={(item) => item.smoker}
              getLabel={(key) => (key === "true" ? "Sim" : "Não")}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
        <Collapsible className="lg:col-span-2">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex w-full items-center justify-between"
            >
              <span>Contracetivos</span>
              <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 grid gap-3 grid-cols-1 lg:grid-cols-2">
            <BreakdownTable
              title="Contracetivos"
              data={metrics.byContraceptive
                .filter((item) => item.contraceptive !== "none")
                .map((item) => ({
                  label: getFieldLabel("contraceptive", item.contraceptive),
                  count: item.count,
                }))}
            />
            <BreakdownTable
              title="Novos Contracetivos"
              data={metrics.byNewContraceptive
                .filter((item) => item.newContraceptive !== "none")
                .map((item) => ({
                  label: getFieldLabel(
                    "new_contraceptive",
                    item.newContraceptive
                  ),
                  count: item.count,
                }))}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
