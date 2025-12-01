export type ExportCell = string | number | boolean | null | undefined;

export type ExportRow = ExportCell[];

export interface ExportTable {
  headers: (string | number)[];
  rows: ExportRow[];
  /**
   * Optional metadata rows that will be placed BEFORE the header row.
   * Each row is an array of cells, typically 1–2 columns wide.
   */
  metadataRows?: ExportRow[];
}

export interface ExportSheet extends ExportTable {
  sheetName: string;
}

export type ConsultationExportCell = string | number | null;

export interface ConsultationExportTable {
  headers: string[];
  rows: ConsultationExportCell[][];
}


