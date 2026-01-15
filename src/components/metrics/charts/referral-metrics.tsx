"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ICPC2CodeTable } from "./icpc2-code-table";
import type { ConsultationMetrics } from "@/lib/api/consultations";

interface ReferralMetricsProps {
  data: ConsultationMetrics["byReferral"];
}

export function ReferralMetrics({ data }: ReferralMetricsProps) {
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let raf = 0;
    const observer = new ResizeObserver((entries) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const width = entries[0]?.contentRect.width || 0;
        setContainerWidth(width);
      });
    });

    observer.observe(element);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  const validData = data.filter((item) => item.count > 0);
  const totalValue = validData.reduce((sum, item) => sum + item.count, 0);

  const chartData = validData.map((item) => ({
    referral: item.referral,
    label: item.label,
    value: item.count,
  }));

  const handleBarClick = (referral: string) => {
    setSelectedReferral((prev) => (prev === referral ? null : referral));
  };

  const selectedReferralData = validData.find(
    (item) => item.referral === selectedReferral
  );

  const chartConfig = {
    value: {
      label: "Total",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  if (validData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">Sem dados disponíveis</p>
        <p className="text-xs text-muted-foreground mt-1">
          As referenciações serão exibidas após adicionar consultas
        </p>
      </div>
    );
  }

  // Calculate responsive values based on container width
  // Defaults to medium size if containerWidth is 0 (SSR/initial render)
  const getResponsiveValue = <T,>(small: T, medium: T, large: T): T => {
    if (containerWidth === 0) return medium; // SSR/default
    if (containerWidth < 640) return small;
    if (containerWidth < 1024) return medium;
    return large;
  };

  const barHeight = getResponsiveValue(24, 28, 30);
  const chartHeight = Math.max(validData.length * barHeight, 180);
  const yAxisWidth = getResponsiveValue(50, 90, 120);
  const leftMargin = getResponsiveValue(50, 90, 120);
  const rightMargin = getResponsiveValue(5, 10, 15);
  const fontSize = getResponsiveValue(9, 10, 11);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Total de {totalValue.toLocaleString("pt-PT")} referenciações
        </p>
      </div>
      <div ref={containerRef} className="w-full">
        <ChartContainer
          config={chartConfig}
          className="w-full"
          style={{ height: `${chartHeight}px` }}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: leftMargin,
              right: rightMargin,
              top: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize,
                fill: "hsl(var(--muted-foreground))",
              }}
              tickFormatter={(value) => value.toLocaleString("pt-PT")}
            />
            <YAxis
              type="category"
              dataKey="referral"
              tickLine={false}
              axisLine={false}
              width={yAxisWidth}
              tick={{
                fontSize,
                fill: "hsl(var(--muted-foreground))",
              }}
              tickFormatter={(value) => {
                const item = chartData.find((d) => d.referral === value);
                return item?.label ?? value;
              }}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              content={
                <ChartTooltipContent
                  className="max-w-[20rem]"
                  hideLabel
                  formatter={(value, _name, item) => {
                    const count = Number(value ?? 0);
                    const percentage =
                      totalValue > 0 ? (count / totalValue) * 100 : 0;

                    return (
                      <div className="flex items-center justify-between gap-3 leading-snug">
                        <span className="text-muted-foreground break-words flex-1">
                          {item?.payload?.label ?? item?.name}
                        </span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {count.toLocaleString("pt-PT")}
                          <span className="text-muted-foreground font-normal ml-1">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={[0, 8, 8, 0]}
              style={{ cursor: "pointer" }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    selectedReferral === entry.referral
                      ? "var(--chart-2)"
                      : "var(--color-value)"
                  }
                  style={{ cursor: "pointer" }}
                  onClick={() => handleBarClick(entry.referral)}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                className="fill-foreground text-xs font-light hidden sm:block"
                formatter={(value: number) =>
                  Number(value ?? 0).toLocaleString("pt-PT")
                }
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {selectedReferralData && selectedReferralData.motives.length > 0 && (
        <Collapsible
          open={true}
          onOpenChange={(open) => {
            if (!open) setSelectedReferral(null);
          }}
        >
          <CollapsibleContent>
            <div className="pt-2 border-t">
              <ICPC2CodeTable
                title={`Motivos da referenciação - ${selectedReferralData.label}`}
                data={selectedReferralData.motives.filter((m) => m.count > 0)}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
