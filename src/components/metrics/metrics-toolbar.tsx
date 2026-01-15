import { ConsultationFilters } from "@/components/filters/consultation-filters";
import type { FilterUIConfig } from "@/components/filters/types";
import { ExportMenu } from "@/components/ui/export-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconRefresh } from "@tabler/icons-react";
import { X } from "lucide-react";
import type { ConsultationsFilters } from "@/lib/api/consultations";
import { useMemo } from "react";
import {
  buildFilterBadgeConfigs,
  generatePrettyFilterLabel,
  hasValue,
} from "@/components/filters/helpers";
import type { FiltersRecord } from "@/components/filters/helpers";

interface MetricsToolbarProps {
  filterConfig: FilterUIConfig;
  hasActiveFilters?: boolean;
  totalConsultations: number;
  onExportExcel?: () => void;
  isExportingExcel?: boolean;
  isExportDisabled?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  setFilter?: <K extends keyof ConsultationsFilters>(
    key: K,
    value: ConsultationsFilters[K]
  ) => void;
  filters?: ConsultationsFilters;
}

/**
 * Helper function to format a date as YYYY-MM-DD (local date format, not UTC)
 * This avoids timezone issues when comparing dates
 */
function formatDateForFilter(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Helper function to get date range for quick filters
 */
function getDateRange(
  days: number | null
): { dateFrom: string; dateTo: string } | null {
  if (days === null) {
    return null; // "All time" - clear date filters
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  const dateFrom = new Date(today);
  dateFrom.setDate(dateFrom.getDate() - days);
  dateFrom.setHours(0, 0, 0, 0); // Start of day

  return {
    dateFrom: formatDateForFilter(dateFrom),
    dateTo: formatDateForFilter(today),
  };
}

/**
 * Shared toolbar for metrics tabs.
 * Renders filter badges/button and places the export button after the filter button.
 */
export function MetricsToolbar({
  filterConfig,
  hasActiveFilters = false,
  totalConsultations,
  onExportExcel,
  isExportingExcel = false,
  isExportDisabled = false,
  onRefresh,
  isRefreshing = false,
  setFilter,
  filters,
}: MetricsToolbarProps) {
  const isLoading = !hasActiveFilters && totalConsultations === 0;

  // Determine which quick date range button is active
  const activeDateRange = useMemo(() => {
    if (!filters?.dateFrom || !filters?.dateTo) return null;

    // Get today's date as YYYY-MM-DD string (local time, not UTC)
    const today = new Date();
    const todayStr = formatDateForFilter(today);

    // Check if the end date is today (compare as strings to avoid timezone issues)
    // Allow 1 day difference for edge cases (e.g., if date was set at midnight in different timezone)
    const toDate = new Date(filters.dateTo + "T00:00:00");
    const todayDate = new Date(todayStr + "T00:00:00");
    const daysFromToday = Math.round(
      (todayDate.getTime() - toDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // End date should be today or within 1 day
    if (Math.abs(daysFromToday) > 1) return "custom";

    // Calculate days difference between from and to dates
    const fromDate = new Date(filters.dateFrom + "T00:00:00");
    const daysDiff = Math.round(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if the range matches one of our presets (with some tolerance for exact matches)
    if (daysDiff >= 6 && daysDiff <= 7) return 7;
    if (daysDiff >= 29 && daysDiff <= 30) return 30;
    if (daysDiff >= 89 && daysDiff <= 90) return 90;
    if (daysDiff >= 364 && daysDiff <= 366) return 365;

    return "custom";
  }, [filters?.dateFrom, filters?.dateTo]);

  const handleQuickDateRange = (days: number | null) => {
    if (!setFilter) return;

    const range = getDateRange(days);
    if (range) {
      setFilter("dateFrom", range.dateFrom);
      setFilter("dateTo", range.dateTo);
    } else {
      // Clear date filters for "All time"
      setFilter("dateFrom", undefined);
      setFilter("dateTo", undefined);
    }
  };

  // Build active filter badges for display
  const getFilterLabel = useMemo(
    () =>
      (key: string): string => {
        if (!filters) return "";
        return generatePrettyFilterLabel(
          key,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (filters as any)[key],
          filterConfig.specialty,
          filters
        );
      },
    [filters, filterConfig.specialty]
  );

  const hasActiveFiltersForBadges = useMemo(
    () => (filters ? Object.values(filters).some((v) => hasValue(v)) : false),
    [filters]
  );

  const allFilterBadges = useMemo(
    () =>
      hasActiveFiltersForBadges && filters
        ? buildFilterBadgeConfigs({
            values: filters as FiltersRecord,
            getLabel: getFilterLabel,
          })
        : [],
    [hasActiveFiltersForBadges, filters, getFilterLabel]
  );

  // Maximum number of visible badges before showing "+X" badge
  // On medium screens, show 3; on larger screens, show 4
  const MAX_VISIBLE_BADGES = 3;

  const visibleBadges = useMemo(
    () => allFilterBadges.slice(0, MAX_VISIBLE_BADGES),
    [allFilterBadges]
  );

  const collapsedBadges = useMemo(
    () => allFilterBadges.slice(MAX_VISIBLE_BADGES),
    [allFilterBadges]
  );

  const hasCollapsedFilters = collapsedBadges.length > 0;

  // Helper function to remove a filter
  const removeFilter = (removeKey: string) => {
    if (removeKey === "ageMin" || removeKey === "ageMax") {
      filterConfig.filterSetters.ageMin?.(undefined);
      filterConfig.filterSetters.ageMax?.(undefined);
    } else if (removeKey === "dateFrom" || removeKey === "dateTo") {
      filterConfig.filterSetters.dateFrom?.(undefined);
      filterConfig.filterSetters.dateTo?.(undefined);
    } else {
      filterConfig.filterSetters[removeKey]?.(undefined);
    }
  };

  // Render a single filter badge
  const renderFilterBadge = ({
    id,
    label,
    removeKey,
  }: {
    id: string;
    label: string;
    removeKey: string;
  }) => (
    <Badge
      key={id}
      variant="secondary"
      className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
    >
      <span>{label}</span>
      <button
        onClick={() => removeFilter(removeKey)}
        className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </Badge>
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Active filters displayed on the left - hidden on small screens */}
      {filterConfig.badgeLocation === "outside" &&
        hasActiveFiltersForBadges && (
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {visibleBadges.map(renderFilterBadge)}
              {hasCollapsedFilters && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="text-xs pr-2 gap-1 group hover:bg-secondary/80 cursor-pointer"
                    >
                      <span>+{collapsedBadges.length}</span>
                    </Badge>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto max-w-sm p-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {collapsedBadges.map(renderFilterBadge)}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                Object.keys(filterConfig.filterSetters).forEach((key) => {
                  filterConfig.filterSetters[key]?.(undefined);
                });
              }}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="h-3 w-3" />
              Limpar
            </Button>
          </div>
        )}

      <div className="flex-1 min-w-0"></div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Quick date range buttons */}
        {setFilter && (
          <div className="flex items-center gap-1 border rounded-md p-1 shrink-0">
            <Button
              variant={activeDateRange === 7 ? "default" : "ghost"}
              size="sm"
              onClick={() => handleQuickDateRange(7)}
              className="h-7 px-2 text-xs"
              title="Últimos 7 dias"
            >
              7d
            </Button>
            <Button
              variant={activeDateRange === 30 ? "default" : "ghost"}
              size="sm"
              onClick={() => handleQuickDateRange(30)}
              className="h-7 px-2 text-xs"
              title="Últimos 30 dias"
            >
              30d
            </Button>
            <Button
              variant={activeDateRange === 90 ? "default" : "ghost"}
              size="sm"
              onClick={() => handleQuickDateRange(90)}
              className="h-7 px-2 text-xs"
              title="Últimos 90 dias"
            >
              90d
            </Button>
            <Button
              variant={activeDateRange === 365 ? "default" : "ghost"}
              size="sm"
              onClick={() => handleQuickDateRange(365)}
              className="h-7 px-2 text-xs"
              title="Último ano"
            >
              1 Ano
            </Button>
            <Button
              variant={activeDateRange === null ? "default" : "ghost"}
              size="sm"
              onClick={() => handleQuickDateRange(null)}
              className="h-7 px-2 text-xs"
              title="Todo o período"
            >
              Tudo
            </Button>
          </div>
        )}

        <div className="shrink-0">
          <ConsultationFilters
            config={{
              ...filterConfig,
              badgeLocation: "inside", // Hide active filters here since we render them separately
            }}
            isLoading={isLoading}
          />
        </div>
      </div>

      {onExportExcel && (
        <ExportMenu
          onExportExcel={onExportExcel}
          isExportingExcel={isExportingExcel}
          isLoading={isLoading}
          disabled={isExportDisabled}
        />
      )}
      {onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onRefresh();
          }}
          disabled={isRefreshing || isLoading}
          className="h-8"
          title="Atualizar métricas"
        >
          <IconRefresh
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      )}
    </div>
  );
}
