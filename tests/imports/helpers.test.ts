import { describe, expect, it } from "vitest";

import {
  excelSerialToDate,
  getFieldByKey,
  isRowEmpty,
  parseCsvLine,
} from "@/imports/helpers";
import { EXCEL_EPOCH, MS_PER_DAY } from "@/imports/constants";

// ---------------------------------------------------------------------------
// parseCsvLine
// ---------------------------------------------------------------------------

describe("parseCsvLine", () => {
  it("splits plain comma-separated values", () => {
    expect(parseCsvLine("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("trims whitespace from each token", () => {
    expect(parseCsvLine(" a , b , c ")).toEqual(["a", "b", "c"]);
  });

  it("treats a quoted field containing a comma as a single value", () => {
    expect(parseCsvLine('"hello, world",b')).toEqual(["hello, world", "b"]);
  });

  it("unescapes doubled double-quotes inside a quoted field", () => {
    expect(parseCsvLine('"say ""hi"""')).toEqual(['say "hi"']);
  });

  it("handles a field that is just two escaped quotes", () => {
    expect(parseCsvLine('""')).toEqual([""]);
  });

  it("produces an empty trailing token for a trailing comma", () => {
    expect(parseCsvLine("a,b,")).toEqual(["a", "b", ""]);
  });

  it("returns a single empty-string element for an empty input", () => {
    expect(parseCsvLine("")).toEqual([""]);
  });

  it("handles multiple quoted fields in one line", () => {
    expect(parseCsvLine('"one, two","three, four",five')).toEqual([
      "one, two",
      "three, four",
      "five",
    ]);
  });
});

// ---------------------------------------------------------------------------
// isRowEmpty
// ---------------------------------------------------------------------------

describe("isRowEmpty", () => {
  it("returns true when all values are empty strings", () => {
    expect(isRowEmpty({ a: "", b: "" })).toBe(true);
  });

  it("returns true when all values are null", () => {
    expect(isRowEmpty({ a: null, b: null })).toBe(true);
  });

  it("returns true when values are a mix of null and empty strings", () => {
    expect(isRowEmpty({ a: null, b: "" })).toBe(true);
  });

  it("returns true when string values are whitespace-only", () => {
    expect(isRowEmpty({ a: "   ", b: "\t" })).toBe(true);
  });

  it("returns false when at least one value is non-empty", () => {
    expect(isRowEmpty({ a: "", b: "data" })).toBe(false);
  });

  it("returns false for a number value (non-string non-null)", () => {
    expect(isRowEmpty({ a: 0 })).toBe(false);
  });

  it("returns true for an empty row object", () => {
    expect(isRowEmpty({})).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// excelSerialToDate
// ---------------------------------------------------------------------------

describe("excelSerialToDate", () => {
  it("returns a Date instance", () => {
    expect(excelSerialToDate(1)).toBeInstanceOf(Date);
  });

  it("matches the expected date for a known serial using the same formula", () => {
    const serial = 45658; // a modern plausible serial
    const expected = new Date(EXCEL_EPOCH.getTime() + serial * MS_PER_DAY);
    const result = excelSerialToDate(serial);
    expect(result.getTime()).toBe(expected.getTime());
  });

  it("produces a later date for a higher serial", () => {
    const earlier = excelSerialToDate(100);
    const later = excelSerialToDate(200);
    expect(later.getTime()).toBeGreaterThan(earlier.getTime());
  });
});

// ---------------------------------------------------------------------------
// getFieldByKey
// ---------------------------------------------------------------------------

describe("getFieldByKey", () => {
  it("returns a field definition for a common field key", () => {
    const field = getFieldByKey("date");
    expect(field).toBeDefined();
    expect(field!.key).toBe("date");
  });

  it("returns a field definition for an MGF-specific field key", () => {
    const field = getFieldByKey("internship");
    expect(field).toBeDefined();
    expect(field!.key).toBe("internship");
  });

  it("returns undefined for an unknown key", () => {
    expect(getFieldByKey("nonexistent_field")).toBeUndefined();
  });
});
