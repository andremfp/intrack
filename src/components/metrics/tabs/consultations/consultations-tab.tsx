import { BreakdownChart } from "../../charts/breakdown-chart";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { MetricCard } from "../../cards/metric-card";
import { BreakdownTable } from "../../charts/breakdown-table";
import { getFieldLabel } from "../../helpers";
import { ConsultationFilters } from "@/components/filters/consultation-filters";
import type { FilterUIConfig } from "@/components/filters/types";
import { createFilterConfig } from "@/components/filters/helpers";
import { METRICS_CONSULTATIONS_ENABLED_FIELDS } from "@/constants";
import type { ConsultationsFilters, MetricsTabProps } from "../../helpers";
import { EmptyMetricsState } from "../../empty-metrics-state";

export function ConsultationsTab({
  specialty,
  filters,
  setFilter,
  metrics,
  hasActiveFilters,
}: MetricsTabProps) {
  const filterConfig: FilterUIConfig = createFilterConfig({
    enabledFields: METRICS_CONSULTATIONS_ENABLED_FIELDS,
    badgeLocation: "outside",
    filterValues: filters,
    setFilter,
    specialty,
  }) || {
    enabledFields: [],
    badgeLocation: "outside",
    filterValues: {} as ConsultationsFilters,
    filterSetters: {},
  };

  // If there are no consultations in the metrics data, show a single
  // empty state instead of rendering multiple empty charts/tables.
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
      {/* Filters - badges on left, button on right */}
      <ConsultationFilters
        config={filterConfig}
        isLoading={!hasActiveFilters && metrics.totalConsultations === 0}
      />

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
