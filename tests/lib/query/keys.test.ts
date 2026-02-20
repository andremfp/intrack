import { describe, expect, it } from "vitest";

import { consultations, metrics, reports } from "@/lib/query/keys";
import { stableStringify } from "@/lib/query/stable-stringify";

const USER = "user-abc";
const SPECIALTY = "mgf";
const REPORT_KEY = "year1";

describe("consultations keys", () => {
  it("all is a fixed root key", () => {
    expect(consultations.all).toEqual(["consultations"]);
  });

  it("prefix contains root + list + userId + specialtyYear", () => {
    expect(consultations.prefix({ userId: USER, specialtyYear: 1 })).toEqual([
      "consultations",
      "list",
      USER,
      1,
    ]);
  });

  it("list extends prefix with page, pageSize, and stringified filters/sorting", () => {
    const filters = { status: "active" };
    const sorting = { field: "date", order: "desc" as const };
    const key = consultations.list({
      userId: USER,
      specialtyYear: 1,
      page: 2,
      pageSize: 20,
      filters,
      sorting,
    });

    expect(key[0]).toBe("consultations");
    expect(key[1]).toBe("list");
    expect(key[2]).toBe(USER);
    expect(key[3]).toBe(1);
    expect(key[4]).toBe(2);
    expect(key[5]).toBe(20);
    expect(key[6]).toBe(stableStringify(filters));
    expect(key[7]).toBe(stableStringify(sorting));
  });

  it("list produces the same key regardless of filter property order", () => {
    const base = {
      userId: USER,
      specialtyYear: 1,
      page: 1,
      pageSize: 10,
      sorting: { field: "date", order: "asc" as const },
    };
    const key1 = consultations.list({
      ...base,
      filters: { date: "2024-01", status: "active" },
    });
    const key2 = consultations.list({
      ...base,
      filters: { status: "active", date: "2024-01" },
    });

    expect(key1[6]).toBe(key2[6]);
  });
});

describe("metrics keys", () => {
  const filterArgs = {
    userId: USER,
    specialtyCode: SPECIALTY,
    filters: { type: "SA" },
    implicitFilters: { year: 1 },
  };

  it("all is a fixed root key", () => {
    expect(metrics.all).toEqual(["metrics"]);
  });

  it("prefix contains root + summary + userId + specialtyCode", () => {
    expect(metrics.prefix({ userId: USER, specialtyCode: SPECIALTY })).toEqual([
      "metrics",
      "summary",
      USER,
      SPECIALTY,
    ]);
  });

  it("summary extends prefix with stringified filters, implicitFilters, and excludeType", () => {
    const key = metrics.summary({ ...filterArgs, excludeType: "SM" });

    expect(key[0]).toBe("metrics");
    expect(key[1]).toBe("summary");
    expect(key[2]).toBe(USER);
    expect(key[3]).toBe(SPECIALTY);
    expect(key[4]).toBe(stableStringify(filterArgs.filters));
    expect(key[5]).toBe(stableStringify(filterArgs.implicitFilters));
    expect(key[6]).toBe("SM");
  });

  it("summary defaults excludeType to empty string when omitted", () => {
    const key = metrics.summary(filterArgs);
    expect(key[6]).toBe("");
  });

  it("summary produces the same key regardless of filter property order", () => {
    const key1 = metrics.summary({
      ...filterArgs,
      filters: { date: "2024-01", type: "SA" },
    });
    const key2 = metrics.summary({
      ...filterArgs,
      filters: { type: "SA", date: "2024-01" },
    });
    expect(key1[4]).toBe(key2[4]);
  });

  it("timeseries uses timeseries segment instead of summary prefix", () => {
    const key = metrics.timeseries(filterArgs);

    expect(key[0]).toBe("metrics");
    expect(key[1]).toBe("timeseries");
    expect(key[2]).toBe(USER);
    expect(key[3]).toBe(SPECIALTY);
  });

  it("timeseries and summary keys are different for the same inputs", () => {
    const summaryKey = JSON.stringify(metrics.summary(filterArgs));
    const timeseriesKey = JSON.stringify(metrics.timeseries(filterArgs));
    expect(summaryKey).not.toBe(timeseriesKey);
  });

  it("timeseries defaults excludeType to empty string when omitted", () => {
    const key = metrics.timeseries(filterArgs);
    expect(key[6]).toBe("");
  });
});

describe("reports keys", () => {
  it("all is a fixed root key", () => {
    expect(reports.all).toEqual(["reports"]);
  });

  it("prefix contains root + data + userId + specialtyCode", () => {
    expect(reports.prefix({ userId: USER, specialtyCode: SPECIALTY })).toEqual([
      "reports",
      "data",
      USER,
      SPECIALTY,
    ]);
  });

  it("data extends prefix with the reportKey", () => {
    const key = reports.data({
      userId: USER,
      specialtyCode: SPECIALTY,
      reportKey: REPORT_KEY,
    });

    expect(key).toEqual(["reports", "data", USER, SPECIALTY, REPORT_KEY]);
  });

  it("different reportKeys produce different data keys", () => {
    const key1 = JSON.stringify(
      reports.data({ userId: USER, specialtyCode: SPECIALTY, reportKey: "year1" }),
    );
    const key2 = JSON.stringify(
      reports.data({ userId: USER, specialtyCode: SPECIALTY, reportKey: "year4" }),
    );
    expect(key1).not.toBe(key2);
  });
});
