"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[60px] sm:w-[80px] text-xs sm:text-sm">
                      Total
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm">Código</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.code}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {item.count}
                      </TableCell>
                      <TableCell className="font-mono text-xs sm:text-sm">
                        {item.code}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
