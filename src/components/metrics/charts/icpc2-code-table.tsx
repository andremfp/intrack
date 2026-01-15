"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ICPC2CodeTableProps {
  title: string;
  data: Array<{ code: string; count: number }>;
}

export function ICPC2CodeTable({ title, data }: ICPC2CodeTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {data.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto overflow-x-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-corner]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
              <table className="w-full caption-bottom text-sm">
                <thead className="sticky top-0 z-20 bg-background border-b shadow-sm">
                  <tr className="border-b">
                    <th className="w-[60px] sm:w-[80px] text-xs sm:text-sm bg-background text-left align-middle font-medium h-10 px-2 text-foreground">
                      Total
                    </th>
                    <th className="text-xs sm:text-sm bg-background text-left align-middle font-medium h-10 px-2 text-foreground">
                      Código
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr
                      key={item.code}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="font-medium text-xs sm:text-sm p-2 align-middle">
                        {item.count}
                      </td>
                      <td className="font-mono text-xs sm:text-sm p-2 align-middle">
                        {item.code}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Sem dados disponíveis
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Os códigos serão exibidos após adicionar consultas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
