"use client";

import { useEffect, useRef, useState } from "react";
import { Label, Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DonutCenterChartProps<T extends { count: number }> {
  title: string;
  data: T[];
  getKey: (item: T) => string;
  getLabel: (key: string) => string;
  centerValue: string | number;
  centerLabel?: string;
}

export function DonutCenterChart<T extends { count: number }>({
  title,
  data,
  getKey,
  getLabel,
  centerValue,
  centerLabel = "Total",
}: DonutCenterChartProps<T>) {
  // Measure available width to adapt chart size and legend density
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [stackLegend, setStackLegend] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const cardElement = element.closest(
      '[data-slot="card"]'
    ) as HTMLDivElement | null;

    const measure = () => {
      const widths = [
        element.clientWidth,
        element.getBoundingClientRect().width,
        element.scrollWidth,
        cardElement?.clientWidth ?? 0,
        cardElement?.getBoundingClientRect().width ?? 0,
      ].filter((value) => typeof value === "number" && value > 0) as number[];

      const measuredWidth = widths.length > 0 ? Math.max(...widths) : 0;
      setContainerWidth(measuredWidth);
    };

    let raf = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    });

    observer.observe(element);
    if (cardElement) {
      observer.observe(cardElement);
    }

    measure();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  // Track viewport width (to align behaviors with Tailwind's xs breakpoint)
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hysteresis thresholds to prevent layout thrashing while resizing
  const STACK_ENTER = 360; // switch to stacked legend when narrower than this
  const STACK_EXIT = 392; // switch back to side legend when wider than this
  const COMPACT_ENTER = 280; // switch to compact stacked bar
  const COMPACT_EXIT = 304; // switch back to donut

  useEffect(() => {
    if (containerWidth === 0) {
      return;
    }
    setStackLegend((prev) => {
      if (prev) {
        return containerWidth < STACK_EXIT;
      }
      return containerWidth < STACK_ENTER;
    });
    setCompactMode((prev) => {
      if (prev) {
        return containerWidth < COMPACT_EXIT;
      }
      return containerWidth < COMPACT_ENTER;
    });
  }, [containerWidth]);

  const validData = data.filter((d) => d.count > 0);
  const keys = validData.map(getKey);

  // Check if this is a sex breakdown chart
  const isSexBreakdown = keys.some(
    (k) => k === "m" || k === "f" || k === "other"
  );

  // Check if this is an age range breakdown chart
  const isAgeRangeBreakdown = keys.some(
    (k) => k === "0-17" || k === "18-44" || k === "45-64" || k === "65+"
  );

  // Build chart data with fill colors bound to config tokens
  // Use primary-based colors for default donut charts
  const chartColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  // Sex-specific color mapping
  const sexColorMap: Record<string, string> = {
    m: "var(--sex-male)",
    f: "var(--sex-female)",
    other: "var(--sex-other)",
  };

  // Age range-specific color mapping
  const ageRangeColorMap: Record<string, string> = {
    "0-17": "var(--age-0-17)",
    "18-44": "var(--age-18-44)",
    "45-64": "var(--age-45-64)",
    "65+": "var(--age-65)",
  };

  const normalized = validData.map((item, index) => {
    const originalKey = keys[index];
    const k = normalizeKey(originalKey);
    return {
      name: k,
      value: item.count,
      fill: `var(--color-${k})`,
      originalKey: originalKey, // Store original key for sex color mapping
    };
  });

  // Determine responsiveness breakpoints based on available width
  // Compact legend: tighter spacing and abbreviated labels
  const compactLegend = containerWidth > 0 && containerWidth < 380;
  const miniLegend = containerWidth > 0 && containerWidth < 320;

  const shortSexLabel = (key: string) => {
    if (key === "f") return "F";
    if (key === "m") return "M";
    if (key === "other") return "O";
    return key;
  };

  const chartConfig = Object.fromEntries(
    normalized.map((n, i) => {
      // Use sex-specific colors if this is a sex breakdown
      // Otherwise, use age range colors if this is an age range breakdown
      // Fall back to default chart colors
      let color = chartColors[i % chartColors.length];
      if (isSexBreakdown && sexColorMap[n.originalKey]) {
        color = sexColorMap[n.originalKey];
      } else if (isAgeRangeBreakdown && ageRangeColorMap[n.originalKey]) {
        color = ageRangeColorMap[n.originalKey];
      }

      return [
        n.name,
        {
          label:
            isSexBreakdown && (compactLegend || miniLegend)
              ? shortSexLabel(n.originalKey)
              : getLabel(n.originalKey),
          color: color,
        },
      ];
    })
  ) as ChartConfig;

  // If container is very narrow, present a compact, clean stacked-bar alternative
  if (validData.length > 0 && compactMode) {
    const total = normalized.reduce((sum, n) => sum + n.value, 0);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-3 px-3">
          <div className="flex flex-col items-center gap-2 min-w-0">
            <div className="text-3xl font-bold leading-none">{centerValue}</div>
            <div className="text-xs text-muted-foreground">{centerLabel}</div>
            <div className="h-2.5 w-full max-w-[240px] rounded-full overflow-hidden bg-muted">
              <div className="flex h-full w-full">
                {normalized.map((item) => {
                  const itemConfig = chartConfig[item.name];
                  const pct = total > 0 ? (item.value / total) * 100 : 0;
                  const percentage =
                    total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                  const label = isAgeRangeBreakdown
                    ? `${getLabel(item.originalKey)} Anos`
                    : getLabel(item.originalKey);
                  const tooltipText = `${label}: ${item.value} (${percentage}%)`;
                  const isDimmed =
                    hoveredName !== null && hoveredName !== item.name;
                  const isHovered = hoveredName === item.name;

                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <div
                          className="h-full cursor-pointer transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: itemConfig?.color || item.fill,
                            opacity: isDimmed ? 0.35 : 1,
                            filter: isHovered ? "brightness(1.06)" : "none",
                          }}
                          onMouseEnter={() => setHoveredName(item.name)}
                          onMouseLeave={() => setHoveredName(null)}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-background text-foreground border shadow-lg">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{
                              backgroundColor: itemConfig?.color || item.fill,
                            }}
                          />
                          <p>{tooltipText}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
            <div
              className={
                isAgeRangeBreakdown && viewportWidth < 640
                  ? "mt-1 w-full max-w-[240px] grid grid-cols-2 place-items-center gap-x-2 gap-y-1 text-[10px]"
                  : "mt-1 flex items-center justify-center gap-2 text-[10px]"
              }
            >
              {normalized.map((item) => {
                const itemConfig = chartConfig[item.name];
                const label = isSexBreakdown
                  ? shortSexLabel(item.originalKey)
                  : isAgeRangeBreakdown
                  ? item.originalKey.replace("-", "–")
                  : getLabel(item.originalKey);
                const fullLabel = isAgeRangeBreakdown
                  ? `${getLabel(item.originalKey)} Anos`
                  : getLabel(item.originalKey);
                const percentage =
                  total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                const tooltipText = `${fullLabel}: ${item.value} (${percentage}%)`;
                const isDimmed =
                  hoveredName !== null && hoveredName !== item.name;
                const isHovered = hoveredName === item.name;

                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <div
                        className="flex items-center gap-1 cursor-pointer"
                        onMouseEnter={() => setHoveredName(item.name)}
                        onMouseLeave={() => setHoveredName(null)}
                        style={{ opacity: isDimmed ? 0.4 : 1 }}
                      >
                        <div
                          className="h-2 w-2 shrink-0 rounded-[2px]"
                          style={{
                            backgroundColor: itemConfig?.color || item.fill,
                            filter: isHovered ? "brightness(1.06)" : "none",
                          }}
                        />
                        <span className="text-muted-foreground">{label}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background text-foreground border shadow-lg">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{
                            backgroundColor: itemConfig?.color || item.fill,
                          }}
                        />
                        <p>{tooltipText}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (validData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Sem dados disponíveis
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compute chart size from available width so the card never overflows
  // The legend typically needs ~50-60% of the width on narrow screens
  const chartSize = Math.round(
    Math.max(
      120,
      Math.min(190, (containerWidth || 360) * (stackLegend ? 0.8 : 0.48))
    )
  );

  // Derive responsive font sizes for center content based on chart size
  const centerNumberFontPx = Math.round(
    Math.max(18, Math.min(34, chartSize * 0.14))
  );
  const centerLabelFontPx = Math.round(
    Math.max(10, Math.min(14, chartSize * 0.065))
  );
  const centerLabelYOffsetPx = Math.round(centerNumberFontPx * 0.9);

  // Determine legend layout class (balanced 2-row grid for age on narrow widths)
  const twoRowGrid = isAgeRangeBreakdown && stackLegend && viewportWidth < 640;
  const legendClass = twoRowGrid
    ? "mt-2 w-full grid grid-cols-2 auto-rows-min place-items-center gap-x-3 gap-y-1"
    : stackLegend
    ? "mt-2 flex flex-wrap items-center justify-center gap-2"
    : miniLegend
    ? "grid grid-cols-2 gap-x-2 gap-y-1"
    : "flex flex-col justify-center gap-2 sm:gap-3";

  // Calculate total once for tooltip calculations
  const totalForTooltip = normalized.reduce((sum, n) => sum + n.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg -mb-6">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className={
            stackLegend
              ? "flex w-full flex-col items-center justify-center gap-2 sm:gap-3 min-w-0"
              : "flex w-full items-center justify-center gap-3 sm:gap-4 min-w-0"
          }
          onMouseLeave={() => setHoveredName(null)}
        >
          <ChartContainer
            config={chartConfig}
            className="flex-shrink-0"
            style={{ width: chartSize, height: chartSize }}
          >
            <PieChart>
              <ChartTooltip
                wrapperStyle={{ zIndex: 1000 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;

                  const item = payload[0];
                  // For PieChart, item.payload contains the original data object from normalized array
                  const payloadData = item.payload as
                    | (typeof normalized)[0]
                    | undefined;
                  const originalKey =
                    payloadData?.originalKey || String(item.name || "");

                  const label = isAgeRangeBreakdown
                    ? `${getLabel(originalKey)} Anos`
                    : getLabel(originalKey);
                  const value = item.value as number;
                  const percentage =
                    totalForTooltip > 0
                      ? ((value / totalForTooltip) * 100).toFixed(1)
                      : "0";
                  const itemConfig =
                    chartConfig[item.name as keyof typeof chartConfig];

                  return (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      label={label}
                      className="rounded-lg border bg-background shadow-lg"
                      indicator="dot"
                      color={itemConfig?.color}
                      formatter={(val) => (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{
                              backgroundColor: itemConfig?.color || "inherit",
                            }}
                          />
                          <span>
                            {val.toLocaleString()} ({percentage}%)
                          </span>
                        </div>
                      )}
                    />
                  );
                }}
              />
              <Pie
                data={normalized}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                strokeWidth={8}
                onMouseLeave={() => setHoveredName(null)}
              >
                {normalized.map((entry) => {
                  const itemConfig = chartConfig[entry.name];
                  const isDimmed =
                    hoveredName !== null && hoveredName !== entry.name;
                  const isHovered = hoveredName === entry.name;
                  return (
                    <Cell
                      key={entry.name}
                      className="transition-all duration-200"
                      onMouseEnter={() => setHoveredName(entry.name)}
                      onMouseLeave={() => setHoveredName(null)}
                      fill={itemConfig?.color || entry.fill}
                      fillOpacity={isDimmed ? 0.25 : 1}
                      style={{
                        filter: isHovered
                          ? "drop-shadow(0 0 6px rgba(0,0,0,0.18))"
                          : "none",
                        cursor: "pointer",
                      }}
                    />
                  );
                })}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground font-bold"
                            style={{ fontSize: `${centerNumberFontPx}px` }}
                          >
                            {centerValue}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + centerLabelYOffsetPx}
                            className="fill-muted-foreground"
                            style={{ fontSize: `${centerLabelFontPx}px` }}
                          >
                            {centerLabel}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className={legendClass} style={{ minWidth: 0 }}>
            {(() => {
              const total = normalized.reduce((sum, n) => sum + n.value, 0);
              return normalized.map((item) => {
                const itemConfig = chartConfig[item.name];
                const percentage =
                  total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                const label = getLabel(item.originalKey);
                const tooltipText = isAgeRangeBreakdown
                  ? `${label} Anos: ${item.value} (${percentage}%)`
                  : `${label}: ${item.value} (${percentage}%)`;
                const isDimmed =
                  hoveredName !== null && hoveredName !== item.name;
                const isHovered = hoveredName === item.name;

                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <div
                        className="flex items-center gap-2 text-[10px] sm:text-xs cursor-pointer"
                        onMouseEnter={() => setHoveredName(item.name)}
                        onMouseLeave={() => setHoveredName(null)}
                        style={{ opacity: isDimmed ? 0.4 : 1 }}
                      >
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{
                            backgroundColor: itemConfig?.color || item.fill,
                            filter: isHovered ? "brightness(1.06)" : "none",
                          }}
                        />
                        <span className="text-muted-foreground truncate">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background text-foreground border shadow-lg">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{
                            backgroundColor: itemConfig?.color || item.fill,
                          }}
                        />
                        <p>{tooltipText}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              });
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function normalizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
}
