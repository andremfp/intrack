// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import writeXlsxFile, {
  type Cell,
  type SheetData,
} from "write-excel-file/browser";

import { parseXlsxFile } from "@/imports/helpers";

// ---------------------------------------------------------------------------
// Fixtures
//
// We build real .xlsx files in-memory with write-excel-file so these tests
// exercise the actual read-excel-file -> parseXlsxFile path (a write/read
// round-trip), rather than mocking the reader. This is the strongest guard
// against the SheetJS -> read-excel-file behavioural drift the migration risks
// (Date detection, null blanks, array-of-arrays shape, ragged rows).
// ---------------------------------------------------------------------------

// Wrap a plain JS value in the { value, type } cell shape write-excel-file
// expects, so callers can pass readable array-of-arrays fixtures.
function toCell(value: unknown): Cell {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return { value, type: Date };
  if (typeof value === "number") return { value, type: Number };
  if (typeof value === "boolean") return { value, type: Boolean };
  return { value: String(value), type: String };
}

async function makeXlsxFile(
  rows: unknown[][],
  name = "fixture.xlsx",
): Promise<File> {
  const data: SheetData = rows.map((row) => row.map(toCell));
  // write-excel-file requires a format for Date cells; one sheet-wide default
  // keeps the fixtures terse.
  const blob = await writeXlsxFile(data, { dateFormat: "yyyy-mm-dd" }).toBlob();
  return new File([blob], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

describe("parseXlsxFile", () => {
  it("trims headers and drops empty-header columns, mapping data by header index", async () => {
    // Middle column has no header -> dropped; its data must not leak into a row.
    const file = await makeXlsxFile([
      [" Name ", null, "Age"],
      ["Alice", "orphan", 30],
    ]);

    const { headers, rows } = await parseXlsxFile(file);

    expect(headers).toEqual(["Name", "Age"]);
    expect(rows).toEqual([{ Name: "Alice", Age: 30 }]);
  });

  it("returns null for blank cells", async () => {
    const file = await makeXlsxFile([
      ["Name", "Notes"],
      ["Bob", null],
    ]);

    const { rows } = await parseXlsxFile(file);

    expect(rows).toEqual([{ Name: "Bob", Notes: null }]);
  });

  it("normalizes Date cells to YYYY-MM-DD", async () => {
    // 2010-03-01 is outside Portugal DST, so UTC == local midnight here.
    const file = await makeXlsxFile([
      ["Name", "DOB"],
      ["Kate", new Date(Date.UTC(2010, 2, 1))],
    ]);

    const { rows } = await parseXlsxFile(file);

    expect(rows).toEqual([{ Name: "Kate", DOB: "2010-03-01" }]);
  });

  it("skips fully-blank rows", async () => {
    const file = await makeXlsxFile([
      ["Name", "Age"],
      ["Alice", 30],
      [null, null],
      ["Bob", 25],
    ]);

    const { rows } = await parseXlsxFile(file);

    expect(rows).toEqual([
      { Name: "Alice", Age: 30 },
      { Name: "Bob", Age: 25 },
    ]);
  });

  it("aligns ragged rows by header index, filling missing trailing cells with null", async () => {
    const file = await makeXlsxFile([
      ["Name", "Age", "City"],
      ["Alice", 30], // shorter than the header row
    ]);

    const { rows } = await parseXlsxFile(file);

    expect(rows).toEqual([{ Name: "Alice", Age: 30, City: null }]);
  });

  it("returns headers with no rows for a file that has only a header row", async () => {
    const file = await makeXlsxFile([["Name", "Age"]]);

    const { headers, rows } = await parseXlsxFile(file);

    expect(headers).toEqual(["Name", "Age"]);
    expect(rows).toEqual([]);
  });

  it("rejects a file whose sheet has no rows at all", async () => {
    const file = await makeXlsxFile([]);

    await expect(parseXlsxFile(file)).rejects.toThrow(/não contém dados/);
  });

  it("rejects with a processing error for an unreadable file", async () => {
    const garbage = new File([new Uint8Array([1, 2, 3, 4])], "bad.xlsx");

    await expect(parseXlsxFile(garbage)).rejects.toThrow(
      /Erro ao processar ficheiro/,
    );
  });
});
