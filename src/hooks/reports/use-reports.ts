import { useState, useCallback, useEffect } from "react";
import type { AppError } from "@/errors";
import { getReportData } from "@/lib/api/reports";
import type { MGFReportData } from "@/reports/report-types";
import type { MGFReportKey } from "@/reports/mgf/mgf-reports";

export function useReportsData({
  userId,
  specialtyCode,
  reportKey,
}: {
  userId: string;
  specialtyCode: string;
  reportKey: MGFReportKey;
}) {
  const [data, setData] = useState<MGFReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const loadReport = useCallback(async () => {
    if (!userId || !reportKey || !specialtyCode) return;

    setIsLoading(true);
    setError(null);

    const result = await getReportData({
      userId,
      specialtyCode,
      reportKey,
    });

    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error);
      setData(null);
    }

    setIsLoading(false);
  }, [reportKey, specialtyCode, userId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return {
    data,
    isLoading,
    error,
    refresh: loadReport,
  };
}
