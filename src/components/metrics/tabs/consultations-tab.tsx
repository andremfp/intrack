import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { MetricCard } from "../cards/metric-card";
import { getFieldLabel, mapEnabledFieldsToDataFields } from "../helpers";
import type { FilterUIConfig } from "@/components/filters/types";
import { createFilterConfig } from "@/components/filters/helpers";
import { METRICS_CONSULTATIONS_ENABLED_FIELDS } from "@/constants";
import type { ConsultationsFilters, MetricsTabProps } from "../helpers";
import { EmptyMetricsState } from "../empty-metrics-state";
import { MetricsToolbar } from "../metrics-toolbar";
import { BreakdownChart } from "../charts/breakdown-chart";
import { ICPC2CodeTable } from "../charts/icpc2-code-table";

export function ConsultationsTab({
  specialty,
  filters,
  setFilter,
  metrics,
  hasActiveFilters,
  onExportExcel,
  isExportingExcel,
  isExportDisabled,
  onRefresh,
  isRefreshing,
}: MetricsTabProps) {
  // Get the data fields that correspond to enabled filter fields for this tab
  const enabledDataFields = useMemo(
    () => mapEnabledFieldsToDataFields(METRICS_CONSULTATIONS_ENABLED_FIELDS),
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

  const filterConfig: FilterUIConfig = createFilterConfig({
    enabledFields: METRICS_CONSULTATIONS_ENABLED_FIELDS,
    badgeLocation: "outside",
    filterValues,
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
      <MetricsToolbar
        filterConfig={filterConfig}
        hasActiveFilters={!!hasActiveFilters}
        totalConsultations={metrics.totalConsultations}
        onExportExcel={onExportExcel}
        isExportingExcel={isExportingExcel}
        isExportDisabled={isExportDisabled}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
        <div className="relative">
          <BreakdownChart
            title="Tipo de Consulta"
            data={metrics.byType.map((item) => ({
              label: item.label,
              type: item.type,
              value: item.count,
            }))}
          />
        </div>
        <div className="relative">
          <MetricCard
            title="Atendimento"
            data={metrics.byPresential}
            getKey={(item) => item.presential}
            getLabel={(key) => (key === "true" ? "Presencial" : "Remoto")}
          />
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
        <Collapsible className="lg:col-span-2">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex w-full items-center justify-between"
            >
              <span>Caracterização do Utente</span>
              <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 grid gap-3 grid-cols-1 lg:grid-cols-2">
            <MetricCard
              title="Tipologia de Família"
              data={metrics.byFamilyType}
              getKey={(item) => item.familyType}
              getLabel={(key) => getFieldLabel("family_type", key)}
            />
            <MetricCard
              title="Escolaridade"
              data={metrics.bySchoolLevel}
              getKey={(item) => item.schoolLevel}
              getLabel={(key) => getFieldLabel("school_level", key)}
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
              <span>História Clínica</span>
              <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 grid gap-3 grid-cols-1 lg:grid-cols-2">
            <MetricCard
              title="Fumadores"
              data={metrics.bySmoker}
              getKey={(item) => item.smoker}
              getLabel={(key) => getFieldLabel("smoker", key)}
            />
            <MetricCard
              title="PNV Cumprido"
              data={metrics.byVaccinationPlan}
              getKey={(item) => item.vaccinationPlan}
              getLabel={(key) => (key === "sim" ? "Sim" : "Não")}
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
            <MetricCard
              title="Contracetivos"
              data={metrics.byContraceptive}
              getKey={(item) => item.contraceptive}
              getLabel={(key) => getFieldLabel("contraceptive", key)}
            />
            <MetricCard
              title="Novos Contracetivos"
              data={metrics.byNewContraceptive}
              getKey={(item) => item.newContraceptive}
              getLabel={(key) => getFieldLabel("new_contraceptive", key)}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <Collapsible>
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
      </div>
      <div className="grid grid-cols-1 gap-3">
        <Collapsible>
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
      </div>
      <div className="grid grid-cols-1 gap-3">
        <Collapsible>
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
