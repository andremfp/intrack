"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface BreakdownChartProps {
  title: string;
  data: Array<{ label: string; type: string; value: number }>;
}

export function BreakdownChart({ title, data }: BreakdownChartProps) {
  const chartConfig = {
    value: {
      label: "Total",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  // Filter out data with empty names
  const validData = data.filter(
    (item) =>
      item.label &&
      item.label.trim() !== "" &&
      item.type &&
      item.type.trim() !== ""
  );
  const chartData = validData.map((item) => ({ ...item }));
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        {validData.length > 0 ? (
          <CardDescription>
            Total de {totalValue.toLocaleString("pt-PT")} registos
          </CardDescription>
        ) : (
          <CardDescription>Sem dados disponíveis</CardDescription>
        )}
      </CardHeader>
      {validData.length > 0 ? (
        <>
          <CardContent className="px-3 sm:px-6">
            <ChartContainer
              config={chartConfig}
              className="h-[220px] sm:h-[260px] w-full"
            >
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="type"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
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
                <Bar dataKey="value" fill="var(--color-value)" radius={8}>
                  <LabelList
                    dataKey="value"
                    position="top"
                    className="hidden sm:block fill-foreground text-xs font-light"
                    formatter={(value: number) =>
                      Number(value ?? 0).toLocaleString("pt-PT")
                    }
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </>
      ) : (
        <CardContent className="px-3 sm:px-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Sem dados disponíveis
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Os dados serão exibidos após adicionares consultas
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
