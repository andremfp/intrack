import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { MGF_FIELDS, COMMON_CONSULTATION_FIELDS } from "@/constants";

interface ConsultationsTabProps {
  specialty: Specialty | null;
  selectedYear: number | undefined;
  selectedLocation: string | undefined;
  selectedInternship: string | undefined;
  locations: string[];
  internships: string[];
  metrics: ConsultationMetrics;
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

export function ConsultationsTab({
  specialty,
  selectedYear,
  selectedLocation,
  selectedInternship,
  locations,
  internships,
  metrics,
  onSelectedYearChange,
  onSelectedLocationChange,
  onSelectedInternshipChange,
}: ConsultationsTabProps) {
  // Only show internship selector when location is not 'health_unit'
  const shouldShowInternship =
    internships.length > 0 && selectedLocation !== "health_unit";

  return (
    <div className="flex flex-col gap-3 px-1">
      {/* Year, Location, and Internship selectors */}
      {(specialty && specialty.years > 1) ||
      locations.length > 0 ||
      shouldShowInternship ? (
        <div className="flex items-center flex-wrap gap-3 pt-4">
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
                  onSelectedLocationChange(
                    value === "all" ? undefined : value
                  )
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
