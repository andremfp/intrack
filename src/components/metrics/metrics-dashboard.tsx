"use client";

import { useEffect, useState } from "react";

import {
  getConsultationMetrics,
  getDistinctInternships,
  getDistinctLocations,
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
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
    undefined
  );
  const [selectedInternship, setSelectedInternship] = useState<
    string | undefined
  >(undefined);
  const [locations, setLocations] = useState<string[]>([]);
  const [internships, setInternships] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<ConsultationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load distinct locations when user or selected year changes
  useEffect(() => {
    const loadLocations = async () => {
      const result = await getDistinctLocations(userId, selectedYear);

      if (result.success) {
        setLocations(result.data);
        // Reset location selection if current selection is no longer available
        if (selectedLocation && !result.data.includes(selectedLocation)) {
          setSelectedLocation(undefined);
        }
      } else {
        toast.error("Erro ao carregar locais", {
          description: result.error.userMessage,
        });
      }
    };

    loadLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, selectedYear]);

  // Load distinct internships when user, selected year, or selected location changes
  useEffect(() => {
    const loadInternships = async () => {
      // If location is 'health_unit', internships don't apply, so clear them
      if (selectedLocation === "health_unit") {
        setInternships([]);
        setSelectedInternship(undefined);
        return;
      }

      const result = await getDistinctInternships(
        userId,
        selectedYear,
        selectedLocation
      );

      if (result.success) {
        setInternships(result.data);
        // Reset internship selection if current selection is no longer available
        if (selectedInternship && !result.data.includes(selectedInternship)) {
          setSelectedInternship(undefined);
        }
      } else {
        toast.error("Erro ao carregar estágios", {
          description: result.error.userMessage,
        });
      }
    };

    loadInternships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, selectedYear, selectedLocation]);

  // Load metrics when user, selected year, selected location, or selected internship changes
  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      const result = await getConsultationMetrics(
        userId,
        selectedYear,
        selectedInternship,
        selectedLocation
      );

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
  }, [userId, selectedYear, selectedLocation, selectedInternship]);

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
        selectedLocation={selectedLocation}
        selectedInternship={selectedInternship}
        locations={locations}
        internships={internships}
        metrics={metrics}
        getSexLabel={getSexLabel}
        onSelectedYearChange={setSelectedYear}
        onSelectedLocationChange={setSelectedLocation}
        onSelectedInternshipChange={setSelectedInternship}
      />
    );
  }

  if (activeSubTab === "Consultas") {
    return (
      <ConsultationsTab
        specialty={specialty}
        selectedYear={selectedYear}
        selectedLocation={selectedLocation}
        selectedInternship={selectedInternship}
        locations={locations}
        internships={internships}
        metrics={metrics}
        onSelectedYearChange={setSelectedYear}
        onSelectedLocationChange={setSelectedLocation}
        onSelectedInternshipChange={setSelectedInternship}
      />
    );
  }

  if (activeSubTab === "ICPC-2") {
    return (
      <ICPC2Tab
        specialty={specialty}
        selectedYear={selectedYear}
        selectedLocation={selectedLocation}
        selectedInternship={selectedInternship}
        locations={locations}
        internships={internships}
        metrics={metrics}
        onSelectedYearChange={setSelectedYear}
        onSelectedLocationChange={setSelectedLocation}
        onSelectedInternshipChange={setSelectedInternship}
      />
    );
  }

  return null;
}
