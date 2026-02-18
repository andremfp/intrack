import { describe, expect, it } from "vitest";

import { buildCsvString } from "@/exports/helpers";
import type { ExportTable } from "@/exports/types";

// Helpers to parse the CSV output back into lines for readable assertions
function lines(csv: string): string[] {
  return csv.split("\n");
}

describe("buildCsvString", () => {
  describe("basic structure", () => {
    it("produces headers-only when rows is empty", () => {
      const table: ExportTable = { headers: ["Name", "Age"], rows: [] };
      expect(buildCsvString(table)).toBe("Name,Age");
    });

    it("produces headers followed by data rows separated by newlines", () => {
      const table: ExportTable = {
        headers: ["Name", "Age"],
        rows: [
          ["Alice", 30],
          ["Bob", 25],
        ],
      };
      expect(buildCsvString(table)).toBe("Name,Age\nAlice,30\nBob,25");
    });

    it("places metadata rows before headers with a blank separator line", () => {
      const table: ExportTable = {
        metadataRows: [["Exported", "2024-01-01"], ["Specialty", "MGF"]],
        headers: ["Name", "Age"],
        rows: [["Alice", 30]],
      };
      const result = lines(buildCsvString(table));
      expect(result[0]).toBe("Exported,2024-01-01");
      expect(result[1]).toBe("Specialty,MGF");
      expect(result[2]).toBe(""); // blank separator
      expect(result[3]).toBe("Name,Age");
      expect(result[4]).toBe("Alice,30");
    });

    it("skips the metadata block when metadataRows is an empty array", () => {
      const table: ExportTable = {
        metadataRows: [],
        headers: ["A"],
        rows: [["1"]],
      };
      const result = buildCsvString(table);
      expect(result).toBe("A\n1");
    });

    it("skips the metadata block when metadataRows is undefined", () => {
      const table: ExportTable = { headers: ["A"], rows: [["1"]] };
      const result = buildCsvString(table);
      expect(result).toBe("A\n1");
    });
  });

  describe("CSV escaping (via cell values)", () => {
    function singleCell(value: ExportTable["rows"][number][number]): string {
      return buildCsvString({ headers: ["h"], rows: [[value]] })
        .split("\n")[1];
    }

    it("returns plain value unchanged when it contains no special characters", () => {
      expect(singleCell("hello")).toBe("hello");
    });

    it("wraps a value containing a comma in double quotes", () => {
      expect(singleCell("hello, world")).toBe('"hello, world"');
    });

    it("wraps a value containing a double-quote and escapes the quote as double-double-quote", () => {
      expect(singleCell('say "hi"')).toBe('"say ""hi"""');
    });

    it("wraps a value containing a newline in double quotes", () => {
      // singleCell splits on \n, so assert on the full CSV output instead
      const csv = buildCsvString({ headers: ["h"], rows: [["line1\nline2"]] });
      expect(csv).toBe('h\n"line1\nline2"');
    });

    it("wraps a value containing a carriage return in double quotes", () => {
      const csv = buildCsvString({ headers: ["h"], rows: [["line1\rline2"]] });
      expect(csv).toBe('h\n"line1\rline2"');
    });

    it("handles a value containing both a comma and a double-quote", () => {
      const result = singleCell('a, "b"');
      expect(result).toBe('"a, ""b"""');
    });

    it("returns empty string for null", () => {
      expect(singleCell(null)).toBe("");
    });

    it("returns empty string for undefined", () => {
      expect(singleCell(undefined)).toBe("");
    });

    it("converts a number to its string representation", () => {
      expect(singleCell(42)).toBe("42");
    });

    it("converts boolean true to 'true'", () => {
      expect(singleCell(true)).toBe("true");
    });

    it("converts boolean false to 'false'", () => {
      expect(singleCell(false)).toBe("false");
    });
  });
});
