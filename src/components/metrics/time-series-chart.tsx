"use client";

import { useState, useEffect, useRef } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface TimeSeriesChartProps {
  data: Array<{ month: string; count: number }>;
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  // Measure card width to adapt chart based on available space
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [compactMode, setCompactMode] = useState(false);

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
  // Time-series chart is full width, so needs higher threshold than donut charts (which are 50% width)
  const COMPACT_ENTER = 600; // switch to compact mode when narrower than this (2x donut threshold)
  const COMPACT_EXIT = 600; // switch back to full mode when wider than this

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

  const formattedData = data.map((item) => ({
    month: item.month,
    count: item.count,
  }));

  // Compute a "nice" Y-axis max and sparse ticks for mobile (0, mid, max)
  const maxValue = formattedData.reduce((m, d) => Math.max(m, d.count), 0);
  const getNiceMax = (max: number) => {
    if (max <= 0) return 1;
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

  const formatXAxisLabel = (value: string) => {
    const [year, month] = value.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthStr = date.toLocaleDateString("pt-PT", { month: "short" });
    const yearStr = date.toLocaleDateString("pt-PT", { year: "2-digit" });
    return `${monthStr} ${yearStr}`;
  };

  // Don't stretch to full height when donuts are in compact mode
  // Since donuts use COMPACT_ENTER = 280 (and they're in 2-column grid),
  // when their total space is ~560, each is ~280. So if our container width
  // is less than ~560, the viewport is small enough that donuts are in compact mode
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
            Consultas por Mês
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
          {formattedData.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className={
                // Compact the chart on small screens: remove default aspect ratio
                // and give it a shorter fixed height. Keep aspect-video on ≥sm when we should stretch
                shouldStretchHeight
                  ? "w-full h-[220px] aspect-auto sm:h-full sm:aspect-video"
                  : "w-full h-[220px] aspect-auto"
              }
            >
              <AreaChart
                data={formattedData}
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
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={compactMode ? 4 : 10}
                  minTickGap={compactMode ? 28 : 40}
                  interval={compactMode ? "preserveStartEnd" : 0}
                  tick={{
                    fontSize: compactMode ? 10 : 12,
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
                  domain={compactMode ? [0, niceMax] : ["auto", "auto"]}
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
                        const [year, month] = value.split("-");
                        const date = new Date(
                          parseInt(year),
                          parseInt(month) - 1
                        );
                        return date.toLocaleDateString("pt-PT", {
                          month: "long",
                          year: "numeric",
                        });
                      }}
                      indicator="dot"
                    />
                  }
                />
                {/* Single area with both fill and stroked line to avoid duplicate tooltip entries */}
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
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <p className="text-sm text-muted-foreground">
                Sem dados disponíveis
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                O gráfico será exibido após adicionares consultas
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
