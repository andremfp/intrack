"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StackedBarCardProps<T extends { count: number }> {
  title: string;
  data: T[];
  getKey: (item: T) => string;
  getLabel: (key: string) => string;
  getColor?: (key: string, index: number) => string;
  formatLegendLabel?: (key: string) => string;
}

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const smokerColorMap: Record<string, string> = {
  true: "var(--smoker-true)",
  false: "var(--smoker-false)",
};

export function StackedBarCard<T extends { count: number }>({
  title,
  data,
  getKey,
  getLabel,
  getColor,
  formatLegendLabel,
}: StackedBarCardProps<T>) {
  const validData = data.filter((item) => item.count > 0);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  if (validData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-semibold">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">
              Sem dados disponíveis
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const normalized = validData.map((item, index) => {
    const key = getKey(item);
    return {
      key,
      label: getLabel(key),
      count: item.count,
      color:
        getColor?.(key, index) ??
        smokerColorMap[key] ??
        chartColors[index % chartColors.length],
    };
  });

  const total = normalized.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg font-semibold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-2 min-w-0">
          <div className="h-2.5 w-full max-w-[240px] rounded-full overflow-hidden bg-muted">
            <div className="flex h-full w-full">
              {normalized.map((item) => {
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                const percentageLabel =
                  total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
                const isDimmed = hoveredKey !== null && hoveredKey !== item.key;
                const isHovered = hoveredKey === item.key;
                const tooltipText = `${
                  item.label
                }: ${item.count.toLocaleString()} (${percentageLabel}%)`;

                return (
                  <Tooltip key={item.key}>
                    <TooltipTrigger asChild>
                      <div
                        className="h-full cursor-pointer transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                          opacity: isDimmed ? 0.35 : 1,
                          filter: isHovered ? "brightness(1.06)" : "none",
                        }}
                        onMouseEnter={() => setHoveredKey(item.key)}
                        onMouseLeave={() => setHoveredKey(null)}
                        aria-label={tooltipText}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-background text-foreground border shadow-lg">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: item.color }}
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
            className="mt-1 flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-xs"
            onMouseLeave={() => setHoveredKey(null)}
          >
            {normalized.map((item) => {
              const legendLabel = formatLegendLabel?.(item.key) ?? item.label;
              const percentageLabel =
                total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
              const isDimmed = hoveredKey !== null && hoveredKey !== item.key;
              const isHovered = hoveredKey === item.key;
              const tooltipText = `${
                item.label
              }: ${item.count.toLocaleString()} (${percentageLabel}%)`;

              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onMouseEnter={() => setHoveredKey(item.key)}
                      onMouseLeave={() => setHoveredKey(null)}
                      style={{ opacity: isDimmed ? 0.4 : 1 }}
                    >
                      <div
                        className="h-2 w-2 shrink-0 rounded-[2px]"
                        style={{
                          backgroundColor: item.color,
                          filter: isHovered ? "brightness(1.06)" : "none",
                        }}
                      />
                      <span className="text-muted-foreground truncate">
                        {legendLabel}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-background text-foreground border shadow-lg">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: item.color }}
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
