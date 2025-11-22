"use client";

import { useEffect, useState, useMemo } from "react";

import {
  getConsultationMetrics,
  getDistinctInternships,
  getDistinctLocations,
  type ConsultationMetrics,
  type MetricsFilters,
} from "@/lib/api/consultations";
import type { Specialty } from "@/lib/api/specialties";
import { errorToast } from "@/utils/error-toast";
import { getSexLabel } from "./utils";
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
  // Helper to get localStorage key for this tab's filters
  const filtersKey = useMemo(
    () => `metrics-filters-${activeSubTab}`,
    [activeSubTab]
  );

  // Load persisted filters from localStorage for this tab
  // Memoize the default filters object to avoid recreating it
  const defaultFilters = useMemo(
    () => ({
      year: undefined,
      location: undefined,
      internship: undefined,
      sex: undefined,
      autonomy: undefined,
      ageMin: undefined,
      ageMax: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      type: undefined,
      presential: undefined,
      smoker: undefined,
    }),
    []
  );

  // Load persisted filters directly from cache (no callback wrapper)
  const loadPersistedFilters = useMemo(() => {
    try {
      const cached = localStorage.getItem(filtersKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          year: parsed.year,
          location: parsed.location,
          internship: parsed.internship,
          sex: parsed.sex,
          autonomy: parsed.autonomy,
          ageMin: parsed.ageMin,
          ageMax: parsed.ageMax,
          dateFrom: parsed.dateFrom,
          dateTo: parsed.dateTo,
          type: parsed.type,
          presential: parsed.presential,
          smoker: parsed.smoker,
        };
      }
    } catch {
      // Ignore errors
    }
    return defaultFilters;
  }, [filtersKey, defaultFilters]);

  // Load persisted filters when tab changes
  const persistedFilters = loadPersistedFilters;

  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    persistedFilters.year
  );
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
    persistedFilters.location
  );
  const [selectedInternship, setSelectedInternship] = useState<
    string | undefined
  >(persistedFilters.internship);
  const [selectedSex, setSelectedSex] = useState<string | undefined>(
    persistedFilters.sex
  );
  const [selectedAutonomy, setSelectedAutonomy] = useState<string | undefined>(
    persistedFilters.autonomy
  );
  const [selectedAgeMin, setSelectedAgeMin] = useState<number | undefined>(
    persistedFilters.ageMin
  );
  const [selectedAgeMax, setSelectedAgeMax] = useState<number | undefined>(
    persistedFilters.ageMax
  );
  const [selectedDateFrom, setSelectedDateFrom] = useState<string | undefined>(
    persistedFilters.dateFrom
  );
  const [selectedDateTo, setSelectedDateTo] = useState<string | undefined>(
    persistedFilters.dateTo
  );
  const [selectedType, setSelectedType] = useState<string | undefined>(
    persistedFilters.type
  );
  const [selectedPresential, setSelectedPresential] = useState<
    boolean | undefined
  >(persistedFilters.presential);
  const [selectedSmoker, setSelectedSmoker] = useState<boolean | undefined>(
    persistedFilters.smoker
  );

  // Update filters when tab changes
  useEffect(() => {
    setSelectedYear(persistedFilters.year);
    setSelectedLocation(persistedFilters.location);
    setSelectedInternship(persistedFilters.internship);
    setSelectedSex(persistedFilters.sex);
    setSelectedAutonomy(persistedFilters.autonomy);
    setSelectedAgeMin(persistedFilters.ageMin);
    setSelectedAgeMax(persistedFilters.ageMax);
    setSelectedDateFrom(persistedFilters.dateFrom);
    setSelectedDateTo(persistedFilters.dateTo);
    setSelectedType(persistedFilters.type);
    setSelectedPresential(persistedFilters.presential);
    setSelectedSmoker(persistedFilters.smoker);
  }, [persistedFilters]);

  // Persist filters to localStorage when they change
  useEffect(() => {
    try {
      const filtersToSave = {
        year: selectedYear,
        location: selectedLocation,
        internship: selectedInternship,
        sex: selectedSex,
        autonomy: selectedAutonomy,
        ageMin: selectedAgeMin,
        ageMax: selectedAgeMax,
        dateFrom: selectedDateFrom,
        dateTo: selectedDateTo,
        type: selectedType,
        presential: selectedPresential,
        smoker: selectedSmoker,
      };
      localStorage.setItem(filtersKey, JSON.stringify(filtersToSave));
    } catch (error) {
      console.error("Error saving metrics filters to cache:", error);
    }
  }, [
    filtersKey,
    selectedYear,
    selectedLocation,
    selectedInternship,
    selectedSex,
    selectedAutonomy,
    selectedAgeMin,
    selectedAgeMax,
    selectedDateFrom,
    selectedDateTo,
    selectedType,
    selectedPresential,
    selectedSmoker,
  ]);
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
        errorToast.fromApiError(result.error, "Erro ao carregar locais");
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
        errorToast.fromApiError(result.error, "Erro ao carregar estágios");
      }
    };

    loadInternships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, selectedYear, selectedLocation]);

  // Load metrics function
  const loadMetrics = async (filtersOverride?: Record<string, unknown>) => {
    setIsLoading(true);
    const filters: MetricsFilters = {
      specialtyYear:
        (filtersOverride?.year as number | undefined) ?? selectedYear,
      location:
        (filtersOverride?.location as string | undefined) ?? selectedLocation,
      internship:
        (filtersOverride?.internship as string | undefined) ??
        selectedInternship,
      sex: (filtersOverride?.sex as string | undefined) ?? selectedSex,
      autonomy:
        (filtersOverride?.autonomy as string | undefined) ?? selectedAutonomy,
      ageMin: (filtersOverride?.ageMin as number | undefined) ?? selectedAgeMin,
      ageMax: (filtersOverride?.ageMax as number | undefined) ?? selectedAgeMax,
      type: (filtersOverride?.type as string | undefined) ?? selectedType,
      presential:
        (filtersOverride?.presential as boolean | undefined) ??
        selectedPresential,
      smoker:
        (filtersOverride?.smoker as boolean | undefined) ?? selectedSmoker,
      dateFrom:
        (filtersOverride?.dateFrom as string | undefined) ?? selectedDateFrom,
      dateTo: (filtersOverride?.dateTo as string | undefined) ?? selectedDateTo,
    };
    const result = await getConsultationMetrics(userId, filters);

    if (result.success) {
      setMetrics(result.data);
    } else {
      errorToast.fromApiError(result.error, "Erro ao carregar métricas");
    }

    setIsLoading(false);
  };

  // Load metrics on initial mount or when userId/specialty changes
  useEffect(() => {
    loadMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, specialty?.id]);

  // Handle apply filters
  const handleApplyFilters = async (newFilters?: Record<string, unknown>) => {
    await loadMetrics(newFilters);
  };

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
        selectedType={selectedType}
        selectedPresential={selectedPresential}
        selectedSmoker={selectedSmoker}
        selectedSex={selectedSex}
        selectedAutonomy={selectedAutonomy}
        selectedAgeMin={selectedAgeMin}
        selectedAgeMax={selectedAgeMax}
        selectedDateFrom={selectedDateFrom}
        selectedDateTo={selectedDateTo}
        locations={locations}
        internships={internships}
        metrics={metrics}
        getSexLabel={getSexLabel}
        onSelectedYearChange={setSelectedYear}
        onSelectedLocationChange={setSelectedLocation}
        onSelectedTypeChange={setSelectedType}
        onSelectedPresentialChange={setSelectedPresential}
        onSelectedSmokerChange={setSelectedSmoker}
        onSelectedSexChange={setSelectedSex}
        onSelectedAutonomyChange={setSelectedAutonomy}
        onSelectedAgeMinChange={setSelectedAgeMin}
        onSelectedAgeMaxChange={setSelectedAgeMax}
        onSelectedDateFromChange={setSelectedDateFrom}
        onSelectedDateToChange={setSelectedDateTo}
        onApplyFilters={handleApplyFilters}
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
        selectedType={selectedType}
        selectedPresential={selectedPresential}
        selectedSmoker={selectedSmoker}
        selectedSex={selectedSex}
        selectedAutonomy={selectedAutonomy}
        selectedAgeMin={selectedAgeMin}
        selectedAgeMax={selectedAgeMax}
        selectedDateFrom={selectedDateFrom}
        selectedDateTo={selectedDateTo}
        locations={locations}
        internships={internships}
        metrics={metrics}
        onSelectedYearChange={setSelectedYear}
        onSelectedLocationChange={setSelectedLocation}
        onSelectedInternshipChange={setSelectedInternship}
        onSelectedTypeChange={setSelectedType}
        onSelectedPresentialChange={setSelectedPresential}
        onSelectedSmokerChange={setSelectedSmoker}
        onSelectedSexChange={setSelectedSex}
        onSelectedAutonomyChange={setSelectedAutonomy}
        onSelectedAgeMinChange={setSelectedAgeMin}
        onSelectedAgeMaxChange={setSelectedAgeMax}
        onSelectedDateFromChange={setSelectedDateFrom}
        onSelectedDateToChange={setSelectedDateTo}
        onApplyFilters={handleApplyFilters}
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
        selectedType={selectedType}
        selectedPresential={selectedPresential}
        selectedSmoker={selectedSmoker}
        selectedSex={selectedSex}
        selectedAutonomy={selectedAutonomy}
        selectedAgeMin={selectedAgeMin}
        selectedAgeMax={selectedAgeMax}
        selectedDateFrom={selectedDateFrom}
        selectedDateTo={selectedDateTo}
        locations={locations}
        internships={internships}
        metrics={metrics}
        onSelectedYearChange={setSelectedYear}
        onSelectedLocationChange={setSelectedLocation}
        onSelectedInternshipChange={setSelectedInternship}
        onSelectedTypeChange={setSelectedType}
        onSelectedPresentialChange={setSelectedPresential}
        onSelectedSmokerChange={setSelectedSmoker}
        onSelectedSexChange={setSelectedSex}
        onSelectedAutonomyChange={setSelectedAutonomy}
        onSelectedAgeMinChange={setSelectedAgeMin}
        onSelectedAgeMaxChange={setSelectedAgeMax}
        onSelectedDateFromChange={setSelectedDateFrom}
        onSelectedDateToChange={setSelectedDateTo}
        onApplyFilters={handleApplyFilters}
      />
    );
  }

  return null;
}
