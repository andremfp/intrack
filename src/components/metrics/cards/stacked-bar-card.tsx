"use client";

import type { HTMLAttributes, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
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
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const barContainerRef = useRef<HTMLDivElement | null>(null);
  const legendRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(pointer: coarse)");

    const handleChange = (event: MediaQueryListEvent) => {
      setIsCoarsePointer(event.matches);
    };

    setIsCoarsePointer(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (isCoarsePointer) {
      setHoveredKey(null);
    } else {
      setActiveKey(null);
    }
  }, [isCoarsePointer]);

  useEffect(() => {
    if (!isCoarsePointer || activeKey === null) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (!target) {
        return;
      }

      if (
        (barContainerRef.current && barContainerRef.current.contains(target)) ||
        (legendRef.current && legendRef.current.contains(target))
      ) {
        return;
      }

      setActiveKey(null);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [isCoarsePointer, activeKey]);

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
  const highlightedKey = isCoarsePointer ? activeKey : hoveredKey;

  const handleMobileToggle = (key: string) => {
    if (!isCoarsePointer) {
      return;
    }

    setActiveKey((prev) => (prev === key ? null : key));
  };

  const handleTooltipOpenChange = (key: string, open: boolean) => {
    setHoveredKey(open ? key : null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg font-semibold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-2 min-w-0">
          <div
            ref={barContainerRef}
            className="h-2.5 sm:w-3/4 w-full rounded-full overflow-hidden bg-muted"
          >
            <div className="flex h-full w-full">
              {normalized.map((item) => {
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                const percentageLabel =
                  total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
                const isDimmed =
                  highlightedKey !== null && highlightedKey !== item.key;
                const isHighlighted = highlightedKey === item.key;
                const tooltipText = `${
                  item.label
                }: ${item.count.toLocaleString()} (${percentageLabel}%)`;

                const baseProps = {
                  className: "h-full cursor-pointer transition-all",
                  style: {
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                    opacity: isDimmed ? 0.35 : 1,
                    filter: isHighlighted ? "brightness(1.06)" : "none",
                  },
                  onMouseEnter: () => {
                    if (!isCoarsePointer) {
                      setHoveredKey(item.key);
                    }
                  },
                  onMouseLeave: () => {
                    if (!isCoarsePointer) {
                      setHoveredKey(null);
                    }
                  },
                  onFocus: () => {
                    if (!isCoarsePointer) {
                      setHoveredKey(item.key);
                    }
                  },
                  onBlur: () => {
                    if (!isCoarsePointer) {
                      setHoveredKey(null);
                    }
                  },
                  onClick: () => handleMobileToggle(item.key),
                  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
                    if (
                      isCoarsePointer &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      handleMobileToggle(item.key);
                    }
                  },
                  tabIndex: 0,
                  "aria-label": tooltipText,
                } satisfies HTMLAttributes<HTMLDivElement>;

                const tooltipOpen = isCoarsePointer
                  ? activeKey === item.key
                  : hoveredKey === item.key;

                return (
                  <Tooltip
                    key={item.key}
                    open={tooltipOpen}
                    delayDuration={0}
                    {...(isCoarsePointer
                      ? {}
                      : {
                          onOpenChange: (open: boolean) =>
                            handleTooltipOpenChange(item.key, open),
                        })}
                  >
                    <TooltipTrigger asChild>
                      <div
                        {...baseProps}
                        {...(isCoarsePointer
                          ? { role: "button", "aria-pressed": isHighlighted }
                          : {})}
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
            ref={legendRef}
            className="mt-1 flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-xs"
            onMouseLeave={() => {
              if (!isCoarsePointer) {
                setHoveredKey(null);
              }
            }}
          >
            {normalized.map((item) => {
              const legendLabel = formatLegendLabel?.(item.key) ?? item.label;
              const percentageLabel =
                total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
              const isDimmed =
                highlightedKey !== null && highlightedKey !== item.key;
              const isHighlighted = highlightedKey === item.key;
              const tooltipText = `${
                item.label
              }: ${item.count.toLocaleString()} (${percentageLabel}%)`;
              const legendText = `${legendLabel}: ${item.count.toLocaleString()} (${percentageLabel}%)`;

              const baseProps = {
                className: "flex items-center gap-1 cursor-pointer",
                onMouseEnter: () => {
                  if (!isCoarsePointer) {
                    setHoveredKey(item.key);
                  }
                },
                onMouseLeave: () => {
                  if (!isCoarsePointer) {
                    setHoveredKey(null);
                  }
                },
                onFocus: () => {
                  if (!isCoarsePointer) {
                    setHoveredKey(item.key);
                  }
                },
                onBlur: () => {
                  if (!isCoarsePointer) {
                    setHoveredKey(null);
                  }
                },
                onClick: () => handleMobileToggle(item.key),
                onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
                  if (
                    isCoarsePointer &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    handleMobileToggle(item.key);
                  }
                },
                style: {
                  opacity: isDimmed ? 0.4 : 1,
                },
                tabIndex: 0,
                "aria-label": tooltipText,
              } satisfies HTMLAttributes<HTMLDivElement>;

              if (isCoarsePointer) {
                return (
                  <div
                    key={item.key}
                    {...baseProps}
                    role="button"
                    aria-pressed={isHighlighted}
                  >
                    <div
                      className="h-2 w-2 shrink-0 rounded-[2px]"
                      style={{
                        backgroundColor: item.color,
                        filter: isHighlighted ? "brightness(1.06)" : "none",
                      }}
                    />
                    <span className="text-muted-foreground truncate">
                      {legendText}
                    </span>
                  </div>
                );
              }

              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>
                    <div {...baseProps}>
                      <div
                        className="h-2 w-2 shrink-0 rounded-[2px]"
                        style={{
                          backgroundColor: item.color,
                          filter: isHighlighted ? "brightness(1.06)" : "none",
                        }}
                      />
                      <span className="text-muted-foreground truncate">
                        {legendText}
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
