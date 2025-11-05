"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface RadialStackedChartData {
  [key: string]: number;
}

interface RadialStackedChartProps<T extends RadialStackedChartData> {
  title: string;
  data: T;
  config: ChartConfig;
  centerValue: string;
  centerLabel: string;
  innerRadius?: number;
  outerRadius?: number;
  maxRadius?: number;
}

export function RadialStackedChart<T extends RadialStackedChartData>({
  title,
  data,
  config,
  centerValue,
  centerLabel,
  innerRadius = 80,
  outerRadius = 130,
  maxRadius = 250,
}: RadialStackedChartProps<T>) {
  // Transform data array to object format needed by RadialBarChart
  const chartDataKeys = Object.keys(config);
  const chartData = [
    Object.fromEntries(chartDataKeys.map((key) => [key, data[key] || 0])),
  ];

  return (
    <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0 px-3 sm:px-6">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square w-full"
          style={{ maxWidth: `${maxRadius}px` }}
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 8}
                          className="fill-foreground text-lg font-bold"
                        >
                          {centerValue}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground text-xs"
                        >
                          {centerLabel}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            {chartDataKeys.map((key) => (
              <RadialBar
                key={key}
                dataKey={key}
                stackId="a"
                cornerRadius={5}
                fill={`var(--color-${key})`}
                className="stroke-transparent stroke-2"
              />
            ))}
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
