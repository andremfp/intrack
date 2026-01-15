"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTimeSeriesData } from "@/hooks/metrics/use-timeseries-data";
import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationsFilters } from "@/lib/api/consultations";

interface TimeSeriesChartProps {
  userId: string;
  specialty: Specialty | null;
  filters: ConsultationsFilters;
  implicitFilters?: Partial<ConsultationsFilters>;
  excludeType?: string;
}

export function TimeSeriesChart({
  userId,
  specialty,
  filters,
  implicitFilters = {},
  excludeType,
}: TimeSeriesChartProps) {
  // Measure card width to adapt chart based on available space
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [compactMode, setCompactMode] = useState(false);

  // Use date range from main filters - no independent date selection
  // If no date range is set, show all available data
  const dateFrom = filters.dateFrom;
  const dateTo = filters.dateTo;

  // Fetch timeseries data using filters' date range
  // Query is enabled even without date range - will show all data
  const { data, isLoading, error } = useTimeSeriesData({
    userId,
    specialty,
    filters,
    implicitFilters,
    excludeType,
    enabled: true, // Always enabled - date range is optional
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    let raf = 0;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width || 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setContainerWidth(width));
    });
    observer.observe(element);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  // Hysteresis thresholds to prevent layout thrashing
  const COMPACT_ENTER = 600;
  const COMPACT_EXIT = 600;

  useEffect(() => {
    setCompactMode((prev) => {
      if (prev) {
        return containerWidth < COMPACT_EXIT;
      }
      return containerWidth < COMPACT_ENTER;
    });
  }, [containerWidth]);

  const chartConfig = {
    count: {
      label: "Consultas",
      color: "var(--color-primary)",
    },
  } satisfies ChartConfig;

  // Process and format data for the chart
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      date: item.date,
      count: item.count,
    }));
  }, [data]);

  // Fill in missing dates with count: 0
  const completeData = useMemo(() => {
    if (!formattedData || formattedData.length === 0) return [];

    // Determine date range
    const dates = formattedData.map((d) => new Date(d.date));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Use filter date range if available, otherwise use data range
    const startDate = dateFrom
      ? new Date(dateFrom)
      : new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    const endDate = dateTo
      ? new Date(dateTo)
      : new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());

    // Create a map of existing data
    const dataMap = new Map<string, number>();
    formattedData.forEach((item) => {
      dataMap.set(item.date, item.count);
    });

    // Generate all dates in range and fill missing ones with 0
    const complete: Array<{ date: string; count: number }> = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      complete.push({
        date: dateStr,
        count: dataMap.get(dateStr) ?? 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return complete;
  }, [formattedData, dateFrom, dateTo]);

  // Calculate time range for smart label formatting
  const timeRange = useMemo(() => {
    if (!completeData || completeData.length === 0) return null;

    const dates = completeData.map((d) => new Date(d.date));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    const diffTime = maxDate.getTime() - minDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { minDate, maxDate, diffDays };
  }, [completeData]);

  // Compute a "nice" Y-axis max
  const maxValue = completeData.reduce((m, d) => Math.max(m, d.count), 0);
  const getNiceMax = (max: number) => {
    if (max <= 0) return 0;
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const normalized = max / magnitude;
    let nice;
    if (normalized <= 1.5) nice = 1 * magnitude;
    else if (normalized <= 3) nice = 2 * magnitude;
    else if (normalized <= 7) nice = 5 * magnitude;
    else nice = 10 * magnitude;
    return nice;
  };
  const niceMax = getNiceMax(maxValue);
  const mobileTicks = [0, Math.round(niceMax / 2), niceMax];

  // Smart x-axis label formatting based on time range and screen size
  const formatXAxisLabel = (value: string) => {
    if (!timeRange) return value;

    const date = new Date(value);
    const { diffDays } = timeRange;

    // On compact mode, always use compact numeric formats
    if (compactMode) {
      // For very short ranges (≤7 days), show day/month
      if (diffDays <= 7) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `${day}/${month}`;
      }

      // For short ranges (≤30 days), show day/month
      if (diffDays <= 30) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `${day}/${month}`;
      }

      // For medium ranges (≤90 days), show month/day
      if (diffDays <= 90) {
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${month}/${day}`;
      }

      // For longer ranges, always use MM/YY format
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);
      return `${month}/${year}`;
    }

    // Normal mode - use more descriptive formats
    // For very short ranges (≤7 days), show day and month
    if (diffDays <= 7) {
      return date.toLocaleDateString("pt-PT", {
        day: "numeric",
        month: "short",
      });
    }

    // For short ranges (≤30 days), show day/month
    if (diffDays <= 30) {
      return date.toLocaleDateString("pt-PT", {
        day: "numeric",
        month: "numeric",
      });
    }

    // For medium ranges (≤90 days), show month/day
    if (diffDays <= 90) {
      return date.toLocaleDateString("pt-PT", {
        month: "short",
        day: "numeric",
      });
    }

    // For longer ranges (≤365 days), show month/year
    if (diffDays <= 365) {
      return date.toLocaleDateString("pt-PT", {
        month: "short",
        year: "2-digit",
      });
    }

    // For very long ranges, show month/year
    return date.toLocaleDateString("pt-PT", {
      month: "short",
      year: "numeric",
    });
  };

  // Calculate x-axis tick interval based on time range and container width
  const xAxisInterval = useMemo(() => {
    if (!timeRange || !containerWidth) return "preserveStartEnd";

    const { diffDays } = timeRange;
    const availableWidth = containerWidth - (compactMode ? 40 : 80);
    // Increase minTickWidth on small screens to prevent overlap
    const minTickWidth = compactMode ? 60 : 80;

    // Calculate how many ticks we can fit
    const maxTicks = Math.max(2, Math.floor(availableWidth / minTickWidth));

    if (diffDays <= 7) {
      // Show every day for very short ranges, but skip some on very small screens
      if (compactMode && diffDays > maxTicks) {
        const interval = Math.ceil(diffDays / maxTicks);
        return interval - 1;
      }
      return 0;
    } else if (diffDays <= 30) {
      // Show every few days
      const interval = Math.max(1, Math.ceil(diffDays / maxTicks));
      return interval - 1; // Recharts uses 0-based interval
    } else if (diffDays <= 90) {
      // Show weekly or bi-weekly
      const interval = Math.max(1, Math.ceil(diffDays / maxTicks / 7));
      return interval * 7 - 1;
    } else if (diffDays <= 365) {
      // Show monthly or bi-monthly
      const interval = Math.max(1, Math.ceil(diffDays / maxTicks / 30));
      return interval * 30 - 1;
    } else {
      // Show every few months (more aggressive on small screens)
      const monthsPerTick = compactMode ? 3 : 2;
      const interval = Math.max(
        1,
        Math.ceil(diffDays / maxTicks / (30 * monthsPerTick))
      );
      return interval * 30 * monthsPerTick - 1;
    }
  }, [timeRange, containerWidth, compactMode]);

  const shouldStretchHeight = containerWidth >= 600;

  return (
    <Card
      className={`border shadow-sm pt-0 pr-6 flex flex-col ${
        shouldStretchHeight ? "sm:h-full" : ""
      }`}
    >
      <CardHeader className="flex items-center gap-1 space-y-0 py-4 sm:flex-row flex-shrink-0">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base sm:text-lg font-semibold">
            Consultas por Período
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent
        className={`px-4 sm:px-6 sm:min-h-0 ${
          shouldStretchHeight ? "sm:flex-1" : ""
        }`}
      >
        <div
          ref={containerRef}
          className={`w-full ${shouldStretchHeight ? "h-full" : ""}`}
        >
          {isLoading && !data ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-center px-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2"></div>
              <p className="text-sm text-muted-foreground">
                A carregar dados...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-center px-4">
              <p className="text-sm text-destructive">Erro ao carregar dados</p>
              <p className="text-xs text-muted-foreground mt-1">
                {error.message}
              </p>
            </div>
          ) : completeData.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className={
                shouldStretchHeight
                  ? "w-full h-[220px] aspect-auto sm:h-full sm:aspect-video"
                  : "w-full h-[220px] aspect-auto"
              }
            >
              <AreaChart
                data={completeData}
                margin={{
                  left: compactMode ? 8 : 2,
                  right: compactMode ? 0 : 22,
                  top: 0,
                  bottom: compactMode ? 0 : 8,
                }}
              >
                <defs>
                  <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-count)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-count)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="lineGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid
                  vertical={false}
                  horizontal={!compactMode}
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={compactMode ? 4 : 10}
                  minTickGap={compactMode ? 40 : 50}
                  interval={xAxisInterval}
                  tick={{
                    fontSize: compactMode ? 9 : 12,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  tickFormatter={formatXAxisLabel}
                />
                <YAxis
                  hide={false}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={compactMode ? 8 : 12}
                  width={compactMode ? 32 : 55}
                  tick={{
                    fontSize: compactMode ? 10 : 12,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  domain={[0, niceMax]}
                  ticks={compactMode ? mobileTicks : undefined}
                  allowDecimals={false}
                  tickFormatter={(value) =>
                    typeof value === "number"
                      ? value.toLocaleString("pt-PT")
                      : String(value)
                  }
                />
                <ChartTooltip
                  cursor={{
                    stroke: "var(--color-count)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                    opacity: 0.3,
                  }}
                  content={
                    <ChartTooltipContent
                      className="rounded-lg border bg-background shadow-lg"
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("pt-PT", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        });
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="count"
                  type="linear"
                  fill="url(#fillCount)"
                  stroke="var(--color-count)"
                  strokeWidth={1.5}
                  isAnimationActive={!compactMode}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[220px] text-center px-4">
              <p className="text-sm text-muted-foreground">
                Sem dados disponíveis
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                {dateFrom && dateTo
                  ? "Não existem consultas neste período"
                  : "Não existem consultas com os filtros selecionados"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
