export interface DailyPoint {
  date: string;
  count: number;
}

/**
 * Fills a sparse daily series so every calendar day in the range has a point,
 * defaulting missing days to `count: 0`.
 *
 * All date math is done in UTC so the calendar day never shifts: the `YYYY-MM-DD`
 * inputs parse to UTC midnight, the lookup keys and the generated keys both come
 * from `toISOString()` (UTC), and iteration uses `setUTCDate`. The previous
 * implementation mixed UTC parsing with a local `new Date(y, m, d)` constructor
 * and local `setDate`, which in non-UTC timezones shifted every day by one and
 * dropped the range's final day (e.g. the latest consultation under "Tudo").
 *
 * @param data     Sparse daily points, already aggregated by day.
 * @param dateFrom Optional inclusive range start (`YYYY-MM-DD`); defaults to the earliest data date.
 * @param dateTo   Optional inclusive range end (`YYYY-MM-DD`); defaults to the latest data date.
 */
/**
 * Resolves the inclusive end date for the daily series.
 *
 * When a filter end (`dateTo`) is set (the 7d/30d/90d presets), it wins. With no
 * explicit end ("Tudo"), the series extends to `today` so its right edge matches
 * the presets — but never before the last data day, so future-dated points are
 * never cut off. All inputs are `YYYY-MM-DD`, comparable lexicographically.
 *
 * @param today        Current calendar day (`YYYY-MM-DD`).
 * @param lastDataDate Latest data day, if any (`YYYY-MM-DD`).
 * @param dateTo       Explicit filter end, if set (`YYYY-MM-DD`).
 */
export function resolveSeriesEnd(
  today: string,
  lastDataDate?: string,
  dateTo?: string
): string {
  if (dateTo) return dateTo;
  if (lastDataDate && lastDataDate > today) return lastDataDate;
  return today;
}

export function fillDailySeries(
  data: DailyPoint[],
  dateFrom?: string,
  dateTo?: string
): DailyPoint[] {
  if (!data || data.length === 0) return [];

  const times = data.map((d) => new Date(d.date).getTime());
  const minDate = new Date(Math.min(...times));
  const maxDate = new Date(Math.max(...times));

  const startDate = dateFrom ? new Date(dateFrom) : new Date(minDate);
  const endDate = dateTo ? new Date(dateTo) : new Date(maxDate);

  // Index the known counts by their (normalized) calendar-day key.
  const countByDate = new Map<string, number>();
  data.forEach((item) => countByDate.set(item.date.split("T")[0], item.count));

  const complete: DailyPoint[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    complete.push({ date: dateStr, count: countByDate.get(dateStr) ?? 0 });
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return complete;
}
