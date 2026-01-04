import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppError } from "@/errors";
import { getReportData } from "@/lib/api/reports";
import type { MGFReportData } from "@/reports/report-types";
import type { MGFReportKey } from "@/reports/mgf/mgf-reports";
import { reports } from "@/lib/query/keys";

// Query function that throws errors instead of returning ApiResponse
async function fetchReportData({
  userId,
  specialtyCode,
  reportKey,
}: {
  userId: string;
  specialtyCode: string;
  reportKey: string;
}): Promise<MGFReportData> {
  const result = await getReportData({
    userId,
    specialtyCode,
    reportKey,
  });

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

export function useReportsData({
  userId,
  specialtyCode,
  reportKey,
}: {
  userId: string;
  specialtyCode: string;
  reportKey: MGFReportKey;
}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: reports.data({ userId, specialtyCode, reportKey }),
    queryFn: () => fetchReportData({ userId, specialtyCode, reportKey }),
    enabled: !!(userId && specialtyCode && reportKey),
  });

  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: reports.data({ userId, specialtyCode, reportKey }),
    });
  };

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as AppError | null,
    refresh,
  };
}
