import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { ICPC2CodeTable } from "../../charts/icpc2-code-table";
import { ConsultationFilters } from "@/components/filters/consultation-filters";
import type { FilterUIConfig } from "@/components/filters/types";
import { createFilterConfig } from "@/components/filters/helpers";
import { METRICS_ICPC2_ENABLED_FIELDS } from "@/constants";
import type { MetricsTabProps } from "../../helpers";

export function ICPC2Tab({
  specialty,
  filters,
  setFilter,
  metrics,
}: MetricsTabProps) {
  // Memoize filterValues to prevent unnecessary re-renders and resets
  const filterValues = useMemo(
    () => ({
      year: filters.year,
      location: filters.location,
      internship: filters.internship,
      type: filters.type,
      presential: filters.presential,
      smoker: filters.smoker,
      sex: filters.sex,
      autonomy: filters.autonomy,
      ageMin: filters.ageMin,
      ageMax: filters.ageMax,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    [
      filters.year,
      filters.location,
      filters.internship,
      filters.type,
      filters.presential,
      filters.smoker,
      filters.sex,
      filters.autonomy,
      filters.ageMin,
      filters.ageMax,
      filters.dateFrom,
      filters.dateTo,
    ]
  );

  const filterConfig: FilterUIConfig = (createFilterConfig({
    enabledFields: METRICS_ICPC2_ENABLED_FIELDS,
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
