"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps<T extends { count: number }> {
  title: string;
  data: T[];
  getKey: (item: T) => string;
  getLabel: (key: string) => string;
}

export function MetricCard<T extends { count: number }>({
  title,
  data,
  getKey,
  getLabel,
}: MetricCardProps<T>) {
  const validData = data.filter((item) => item.count > 0);
  const total = validData.reduce((sum, item) => sum + item.count, 0);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg font-semibold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {validData.map((item) => {
            const key = getKey(item);
            const percentage =
              total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{getLabel(key)}</span>
                  <span className="text-sm font-semibold">{item.count}</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
