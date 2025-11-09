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

interface ConsultationsTabProps {
  specialty: Specialty | null;
  selectedYear: number | undefined;
  metrics: ConsultationMetrics;
  onSelectedYearChange: (year: number | undefined) => void;
}

export function ConsultationsTab({
  specialty,
  selectedYear,
  metrics,
  onSelectedYearChange,
}: ConsultationsTabProps) {
  return (
    <div className="flex flex-col gap-3 px-1">
      {/* Year selector for multi-year specialties */}
      {specialty && specialty.years > 1 && (
        <div className="flex items-center justify-between pt-4">
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
