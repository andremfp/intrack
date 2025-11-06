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

interface ICPC2TabProps {
  specialty: Specialty | null;
  selectedYear: number | undefined;
  metrics: ConsultationMetrics;
  onSelectedYearChange: (year: number | undefined) => void;
}

export function ICPC2Tab({
  specialty,
  selectedYear,
  metrics,
  onSelectedYearChange,
}: ICPC2TabProps) {
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
