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
import { getFieldLabel } from "../../metrics-utils";
import { MetricsFilters } from "../../metrics-filters";

interface ConsultationsTabProps {
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

export function ConsultationsTab({
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
  onSelectedYearChange,
  onSelectedLocationChange,
  onSelectedInternshipChange,
  onSelectedSexChange,
  onSelectedAutonomyChange,
  onSelectedAgeMinChange,
  onSelectedAgeMaxChange,
  onSelectedDateFromChange,
  onSelectedDateToChange,
}: ConsultationsTabProps) {
  return (
    <div className="flex flex-col gap-3 px-1">
      {/* Filters button */}
      <div className="flex justify-end pt-4">
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
