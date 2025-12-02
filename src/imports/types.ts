import type { ConsultationInsert } from "@/lib/api/consultations";

export interface ImportRow {
  [header: string]: string | number | null;
}

export interface ValidationError {
  rowIndex: number;
  field: string;
  message: string;
}

export interface ImportValidationResult {
  validRows: ConsultationInsert[];
  errors: ValidationError[];
  totalRows: number;
}

export interface ImportPreviewData {
  consultations: Array<{
    data: Partial<ConsultationInsert>;
    errors: ValidationError[];
    rowIndex: number;
  }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

export interface ImportBatchResult {
  created: number;
  errors: Array<{
    index: number;
    error: string;
  }>;
}

