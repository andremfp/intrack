"use client";

import { useEffect, useState } from "react";

import {
  getConsultationMetrics,
  type ConsultationMetrics,
} from "@/lib/api/consultations";
import type { Specialty } from "@/lib/api/specialties";
import { toast } from "sonner";
import { getSexLabel } from "./metrics-utils";
import { GeneralTab } from "./tabs/general/general-tab";
import { ConsultationsTab } from "./tabs/consultations/consultations-tab";
import { ICPC2Tab } from "./tabs/icpc-2-codes/icpc-2-tab";

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
      <GeneralTab
        specialty={specialty}
        selectedYear={selectedYear}
        metrics={metrics}
        getSexLabel={getSexLabel}
        onSelectedYearChange={setSelectedYear}
      />
    );
  }

  if (activeSubTab === "Consultas") {
    return (
      <ConsultationsTab
        specialty={specialty}
        selectedYear={selectedYear}
        metrics={metrics}
        onSelectedYearChange={setSelectedYear}
      />
    );
  }

  if (activeSubTab === "ICPC-2") {
    return (
      <ICPC2Tab
        specialty={specialty}
        selectedYear={selectedYear}
        metrics={metrics}
        onSelectedYearChange={setSelectedYear}
      />
    );
  }

  return null;
}
