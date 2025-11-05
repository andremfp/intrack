"use client";

import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getConsultationMetrics,
  type ConsultationMetrics,
} from "@/lib/api/consultations";
import type { Specialty } from "@/lib/api/specialties";
import { toast } from "sonner";
import { getFieldLabel, getSexLabel } from "./metrics-utils";
import { TimeSeriesChart } from "./time-series-chart";
import { BreakdownChart } from "./breakdown-chart";
import { BreakdownTable } from "./breakdown-table";
import { ICPC2CodeTable } from "./icpc2-code-table";
import { MetricCard } from "./metric-card";
import { DonutCenterChart } from "./donut-center-chart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";

interface MetricsDashboardProps {
  userId: string;
  specialty: Specialty | null;
  activeSubTab: "Geral" | "Consultas" | "ICPC-2";
}

export function MetricsDashboard({
  userId,
  specialty,
  activeSubTab,
}: MetricsDashboardProps) {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    specialty && specialty.years > 1 ? 1 : undefined
  );
  const [metrics, setMetrics] = useState<ConsultationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load metrics when user or selected year changes
  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      const result = await getConsultationMetrics(userId, selectedYear);

      if (result.success) {
        setMetrics(result.data);
      } else {
        toast.error("Erro ao carregar métricas", {
          description: result.error.userMessage,
        });
      }

      setIsLoading(false);
    };

    loadMetrics();
  }, [userId, selectedYear]);

  if (isLoading) {
    return (
      <div className="flex flex-1 min-h-full items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">
            A carregar métricas...
          </p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-1 min-h-full items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Sem dados disponíveis</p>
      </div>
    );
  }

  // Render content based on activeSubTab
  if (activeSubTab === "Geral") {
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
                  setSelectedYear(value === "all" ? undefined : parseInt(value))
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

  if (activeSubTab === "Consultas") {
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
                  setSelectedYear(value === "all" ? undefined : parseInt(value))
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

  if (activeSubTab === "ICPC-2") {
    return (
      <div className="flex flex-col gap-3 px-1">
        {/* Year selector for multi-year specialties */}
        {specialty && specialty.years > 1 && (
          <div className="flex items-center justify-between lg:px-6 pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                Ano da Especialidade:
              </span>
              <Select
                value={selectedYear?.toString() || "all"}
                onValueChange={(value) =>
                  setSelectedYear(value === "all" ? undefined : parseInt(value))
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

  return null;
}
