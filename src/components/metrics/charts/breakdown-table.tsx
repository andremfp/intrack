"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BreakdownTableProps {
  title: string;
  data: Array<{ label: string; count: number }>;
}

export function BreakdownTable({ title, data }: BreakdownTableProps) {
  // Filter out empty labels
  const validData = data.filter(
    (item) => item.label && item.label.trim() !== ""
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {validData.length > 0 ? (
          <div className="space-y-2">
            {validData.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center gap-2"
              >
                <span className="text-xs sm:text-sm text-muted-foreground truncate flex-1">
                  {item.label}
                </span>
                <span className="text-xs sm:text-sm font-medium shrink-0">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Sem dados disponíveis
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Os dados serão exibidos após adicionar consultas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
