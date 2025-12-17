import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { ICPC2CodeTable } from "../../charts/icpc2-code-table";
import type { FilterUIConfig } from "@/components/filters/types";
import { createFilterConfig } from "@/components/filters/helpers";
import { METRICS_ICPC2_ENABLED_FIELDS } from "@/constants";
import type { MetricsTabProps } from "../../helpers";
import { mapEnabledFieldsToDataFields } from "../../helpers";
import { EmptyMetricsState } from "../../empty-metrics-state";
import { MetricsToolbar } from "../../metrics-toolbar";

export function ICPC2Tab({
  specialty,
  filters,
  setFilter,
  metrics,
  hasActiveFilters,
  onExportExcel,
  isExportingExcel,
}: MetricsTabProps) {
  // Get the data fields that correspond to enabled filter fields for this tab
  const enabledDataFields = useMemo(
    () => mapEnabledFieldsToDataFields(METRICS_ICPC2_ENABLED_FIELDS),
    []
  );

  // Create filterValues that only includes fields enabled for this tab
  const filterValues = useMemo(() => {
    const values: Record<string, unknown> = {};
    for (const field of enabledDataFields) {
      values[field] = filters[field as keyof typeof filters];
    }
    return values;
  }, [enabledDataFields, filters]);

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

  // If there are no consultations in the metrics data, show a single
  // empty state instead of rendering multiple empty tables.
  if (metrics.totalConsultations === 0) {
    const disableFilters =
      !hasActiveFilters && metrics.totalConsultations === 0;

    return (
      <EmptyMetricsState
        filterConfig={filterConfig}
        disableFilters={disableFilters}
      />
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 pt-4 px-1">
      <MetricsToolbar
        filterConfig={filterConfig}
        hasActiveFilters={!!hasActiveFilters}
        totalConsultations={metrics.totalConsultations}
        onExportExcel={onExportExcel}
        isExportingExcel={isExportingExcel}
      />

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
