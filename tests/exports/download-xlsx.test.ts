// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import readXlsxFile from "read-excel-file/browser";

import { downloadXlsx } from "@/exports/helpers";
import type { ExportSheet } from "@/exports/types";

// ---------------------------------------------------------------------------
// DOM download harness
//
// jsdom implements neither object URLs nor navigation, so we stub
// URL.createObjectURL (capturing the generated Blob for read-back), neutralize
// the anchor click, and keep a handle on the created anchor to inspect its
// download filename.
// ---------------------------------------------------------------------------

let capturedBlob: Blob | null = null;
let lastAnchor: HTMLAnchorElement | null = null;

const realCreateElement = document.createElement.bind(document);
const origCreateObjectURL = URL.createObjectURL;
const origRevokeObjectURL = URL.revokeObjectURL;

beforeEach(() => {
  capturedBlob = null;
  lastAnchor = null;

  URL.createObjectURL = ((blob: Blob) => {
    capturedBlob = blob;
    return "blob:mock";
  }) as typeof URL.createObjectURL;
  URL.revokeObjectURL = (() => {}) as typeof URL.revokeObjectURL;

  vi.spyOn(document, "createElement").mockImplementation(((
    tag: string,
    options?: ElementCreationOptions,
  ) => {
    const el = realCreateElement(tag, options);
    if (tag === "a") lastAnchor = el as HTMLAnchorElement;
    return el;
  }) as typeof document.createElement);

  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

afterEach(() => {
  URL.createObjectURL = origCreateObjectURL;
  URL.revokeObjectURL = origRevokeObjectURL;
  vi.restoreAllMocks();
});

describe("downloadXlsx", () => {
  it("returns early without creating an object URL when there are no sheets", async () => {
    await downloadXlsx([], "report");

    expect(capturedBlob).toBeNull();
    expect(lastAnchor).toBeNull();
  });

  it("appends .xlsx when the filename has no extension", async () => {
    await downloadXlsx(
      [{ sheetName: "S", headers: ["A"], rows: [["1"]] }],
      "report",
    );

    expect(lastAnchor?.getAttribute("download")).toBe("report.xlsx");
  });

  it("does not double-append .xlsx when it is already present", async () => {
    await downloadXlsx(
      [{ sheetName: "S", headers: ["A"], rows: [["1"]] }],
      "report.xlsx",
    );

    expect(lastAnchor?.getAttribute("download")).toBe("report.xlsx");
  });

  it("builds a multi-sheet workbook preserving names, ordering, types, and sanitized strings", async () => {
    const sheets: ExportSheet[] = [
      {
        sheetName: "Resumo",
        metadataRows: [
          ["Exportado", "2024-01-01"],
          ["Especialidade", "MGF"],
        ],
        headers: ["Nome", "Idade"],
        rows: [
          ["Alice", 30],
          // Already sanitized upstream (leading apostrophe) — must round-trip verbatim.
          ["'=cmd|calc", 25],
        ],
      },
      {
        sheetName: "Dados",
        headers: ["X"],
        rows: [["y"]],
      },
    ];

    await downloadXlsx(sheets, "multi");

    expect(capturedBlob).toBeInstanceOf(Blob);

    const parsed = await readXlsxFile(capturedBlob!);
    expect(parsed.map((s) => s.sheet)).toEqual(["Resumo", "Dados"]);

    const resumo = parsed.find((s) => s.sheet === "Resumo")!.data;
    // The reader's representation of the blank separator row is irrelevant;
    // assert the order and content of the meaningful (non-blank) rows.
    const nonBlank = resumo.filter(
      (row) => !row.every((cell) => cell === null || cell === ""),
    );
    expect(nonBlank).toEqual([
      ["Exportado", "2024-01-01"],
      ["Especialidade", "MGF"],
      ["Nome", "Idade"],
      ["Alice", 30],
      ["'=cmd|calc", 25],
    ]);

    const dados = parsed.find((s) => s.sheet === "Dados")!.data;
    expect(dados).toEqual([["X"], ["y"]]);
  });
});
