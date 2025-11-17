import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationMetrics } from "@/lib/api/consultations";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { ICPC2CodeTable } from "../../charts/icpc2-code-table";
import { MGF_FIELDS, COMMON_CONSULTATION_FIELDS } from "@/constants";

interface ICPC2TabProps {
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

export function ICPC2Tab({
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
}: ICPC2TabProps) {
  // Only show internship selector when location is not 'health_unit'
  const shouldShowInternship =
    internships.length > 0 && selectedLocation !== "health_unit";

  return (
    <div className="flex flex-col gap-3 px-1">
      {/* Year, Location, and Internship selectors */}
      {(specialty && specialty.years > 1) ||
      locations.length > 0 ||
      shouldShowInternship ? (
        <div className="flex items-center flex-wrap gap-3 lg:px-6 pt-4">
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

      <div className="flex flex-col gap-3 lg:px-6">
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex w-full items-center justify-between"
            >
              <span>Diagnósticos</span>
              <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ICPC2CodeTable
              title="Códigos ICPC-2 de diagnóstico"
              data={metrics.byDiagnosis.filter((item) => item.count > 0)}
            />
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex w-full items-center justify-between"
            >
              <span>Problemas</span>
              <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ICPC2CodeTable
              title="Códigos ICPC-2 de problemas"
              data={metrics.byProblems.filter((item) => item.count > 0)}
            />
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex w-full items-center justify-between"
            >
              <span>Novos Diagnósticos</span>
              <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ICPC2CodeTable
              title="Códigos ICPC-2 de novos diagnósticos"
              data={metrics.byNewDiagnosis.filter((item) => item.count > 0)}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
