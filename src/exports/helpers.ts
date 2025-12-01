import { COMMON_CONSULTATION_FIELDS, MGF_FIELDS, type SpecialtyField } from "@/constants";
import type {
  ConsultationMGF,
  ConsultationMetrics,
} from "@/lib/api/consultations";
import type {
  ExportCell,
  ExportTable,
  ExportSheet,
  ConsultationExportCell,
  ConsultationExportTable,
} from "./types";

function ensureFileExtension(filename: string, extension: string): string {
  if (!extension.startsWith(".")) {
    extension = `.${extension}`;
  }

  const lower = filename.toLowerCase();
  if (lower.endsWith(extension.toLowerCase())) {
    return filename;
  }

  return `${filename}${extension}`;
}

function escapeCsvValue(value: ExportCell): string {
  if (value === null || value === undefined) return "";

  const raw =
    typeof value === "string" || typeof value === "number" || typeof value === "boolean"
      ? String(value)
      : JSON.stringify(value);

  if (/[",\n\r]/.test(raw)) {
    const escaped = raw.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return raw;
}

export function buildCsvString(table: ExportTable): string {
  const lines: string[] = [];
  const { metadataRows, headers, rows } = table;

  if (metadataRows && metadataRows.length > 0) {
    for (const row of metadataRows) {
      lines.push(row.map(escapeCsvValue).join(","));
    }
    lines.push("");
  }

  lines.push(headers.map(escapeCsvValue).join(","));

  for (const row of rows) {
    lines.push(row.map(escapeCsvValue).join(","));
  }

  return lines.join("\n");
}

export function downloadCsv(table: ExportTable, filename: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const csv = buildCsvString(table);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", ensureFileExtension(filename, ".csv"));
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export async function downloadXlsx(
  sheets: ExportSheet[],
  filename: string
): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  // Guard against empty workbooks which cause xlsx to throw.
  if (!sheets || sheets.length === 0) {
    console.warn("[downloadXlsx] No sheets provided, skipping export", {
      filename,
    });
    return;
  }

  const XLSX = (await import("xlsx")) as unknown as {
    utils: {
      book_new: () => unknown;
      aoa_to_sheet: (data: unknown[][]) => unknown;
      book_append_sheet: (
        workbook: unknown,
        worksheet: unknown,
        sheetName: string
      ) => void;
    };
    write: (
      workbook: unknown,
      options: { bookType: string; type: "array" }
    ) => ArrayBuffer;
  };

  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const { headers, rows, metadataRows } = sheet;
    const aoa: unknown[][] = [];

    if (metadataRows && metadataRows.length > 0) {
      for (const row of metadataRows) {
        aoa.push([...row]);
      }
      aoa.push([]);
    }

    aoa.push([...headers]);

    for (const row of rows) {
      aoa.push([...row]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      sheet.sheetName || "Sheet1"
    );
  }

  const arrayBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", ensureFileExtension(filename, ".xlsx"));
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

const commonFieldByKey = new Map(
  COMMON_CONSULTATION_FIELDS.map((field) => [field.key, field])
);

const mgfFieldByKey = new Map(MGF_FIELDS.map((field) => [field.key, field]));

function getDetailsValue(consultation: ConsultationMGF, key: string): unknown {
  if (!consultation.details || typeof consultation.details !== "object") {
    return null;
  }
  return (consultation.details as Record<string, unknown>)[key] ?? null;
}

function formatBoolean(value: unknown): ConsultationExportCell {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === "true" || value === "false") {
    return value === "true" ? "Sim" : "Não";
  }
  return null;
}

function formatWithOptions(
  field: SpecialtyField | undefined,
  value: unknown
): ConsultationExportCell {
  if (!field) {
    if (value === null || value === undefined) return null;
    return String(value);
  }

  if (value === null || value === undefined || value === "") return null;

  if (!field.options || field.options.length === 0) {
    return String(value);
  }

  const str = String(value);
  const option = field.options.find((opt) => opt.value === str);
  return option ? option.label : str;
}

function formatTextList(value: unknown): ConsultationExportCell {
  if (!value) return null;

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return value.join("; ");
  }

  if (typeof value === "string") {
    if (!value.trim()) return null;
    return value
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .join("; ");
  }

  return String(value);
}

function formatIcpcCodes(value: unknown): ConsultationExportCell {
  return formatTextList(value);
}

interface ExportColumnConfig {
  key: string;
  header: string;
  source: "column" | "details";
  fieldKey?: string;
  formatter?: (
    value: unknown,
    consultation: ConsultationMGF
  ) => ConsultationExportCell;
}

const EXPORT_COLUMNS: ExportColumnConfig[] = [
  {
    key: "id",
    header: "ID Consulta",
    source: "column",
    formatter: (value) => (value ? String(value) : null),
  },
  {
    key: "date",
    header: "Data",
    source: "column",
    formatter: (value) => {
      if (!value) return null;
      try {
        const date = new Date(String(value));
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toISOString().split("T")[0];
      } catch {
        return String(value);
      }
    },
  },
  {
    key: "process_number",
    header: "Número de Processo",
    source: "column",
    formatter: (value) =>
      typeof value === "number"
        ? value
        : value
        ? Number(value) || String(value)
        : null,
  },
  {
    key: "specialty_year",
    header: "Ano de Especialidade",
    source: "column",
    formatter: (value) =>
      typeof value === "number"
        ? value
        : value
        ? Number(value) || String(value)
        : null,
  },
  {
    key: "location",
    header: "Local",
    source: "column",
    formatter: (value) =>
      formatWithOptions(commonFieldByKey.get("location"), value),
  },
  {
    key: "autonomy",
    header: "Autonomia",
    source: "column",
    formatter: (value) =>
      formatWithOptions(commonFieldByKey.get("autonomy"), value),
  },
  {
    key: "sex",
    header: "Sexo",
    source: "column",
    formatter: (value) =>
      formatWithOptions(commonFieldByKey.get("sex"), value),
  },
  {
    key: "age",
    header: "Idade",
    source: "column",
    formatter: (value) =>
      typeof value === "number"
        ? value
        : value
        ? Number(value) || String(value)
        : null,
  },
  {
    key: "age_unit",
    header: "Unidade de Idade",
    source: "column",
    formatter: (value) =>
      formatWithOptions(commonFieldByKey.get("age_unit"), value),
  },
  {
    key: "type",
    header: "Tipologia",
    source: "column",
    formatter: (value) => formatWithOptions(mgfFieldByKey.get("type"), value),
  },
  {
    key: "presential",
    header: "Presencial",
    source: "column",
    formatter: (value) => formatBoolean(value),
  },
  {
    key: "smoker",
    header: "Fumador",
    source: "column",
    formatter: (value) => formatWithOptions(mgfFieldByKey.get("smoker"), value),
  },
  {
    key: "favorite",
    header: "Favorito",
    source: "column",
    formatter: (value) => formatBoolean(value),
  },
  {
    key: "internship",
    header: "Estágio",
    source: "details",
    formatter: (value) =>
      formatWithOptions(mgfFieldByKey.get("internship"), value),
  },
  {
    key: "contraceptive",
    header: "Contraceptivo",
    source: "details",
    formatter: (value) =>
      formatWithOptions(mgfFieldByKey.get("contraceptive"), value),
  },
  {
    key: "new_contraceptive",
    header: "Novo Contraceptivo",
    source: "details",
    formatter: (value) =>
      formatWithOptions(mgfFieldByKey.get("new_contraceptive"), value),
  },
  {
    key: "diagnosis",
    header: "Diagnóstico (ICPC-2)",
    source: "details",
    formatter: (value) => formatIcpcCodes(value),
  },
  {
    key: "problems",
    header: "Problemas (ICPC-2)",
    source: "details",
    formatter: (value) => formatIcpcCodes(value),
  },
  {
    key: "new_diagnosis",
    header: "Novo Diagnóstico (ICPC-2)",
    source: "details",
    formatter: (value) => formatIcpcCodes(value),
  },
  {
    key: "chronic_diseases",
    header: "Doenças Crónicas",
    source: "details",
    formatter: (value) => formatTextList(value),
  },
  {
    key: "procedure",
    header: "Procedimento",
    source: "details",
    formatter: (value) => formatTextList(value),
  },
  {
    key: "notes",
    header: "Notas",
    source: "details",
    formatter: (value) => formatTextList(value),
  },
  {
    key: "referrence",
    header: "Referenciação",
    source: "details",
    formatter: (value) =>
      formatWithOptions(mgfFieldByKey.get("referrence"), value),
  },
  {
    key: "referrence_motive",
    header: "Motivo da Referenciação (ICPC-2)",
    source: "details",
    formatter: (value) => formatIcpcCodes(value),
  },
];

export function mapConsultationsToExportTable(
  consultations: ConsultationMGF[]
): ConsultationExportTable {
  const headers = EXPORT_COLUMNS.map((col) => col.header);

  const rows = consultations.map<ConsultationExportCell[]>((consultation) => {
    return EXPORT_COLUMNS.map((col) => {
      const fieldKey = col.fieldKey ?? col.key;
      const rawValue =
        col.source === "column"
          ? (consultation as Record<string, unknown>)[fieldKey]
          : getDetailsValue(consultation, fieldKey);

      if (col.formatter) {
        return col.formatter(rawValue, consultation);
      }

      if (rawValue === null || rawValue === undefined) return null;
      if (typeof rawValue === "string" || typeof rawValue === "number") {
        return rawValue;
      }

      return String(rawValue);
    });
  });

  return { headers, rows };
}

// -----------------------------------------------------------------------------
// Metrics export mapping
// -----------------------------------------------------------------------------

function formatSexForMetrics(sex: string): string {
  const labels: Record<string, string> = {
    m: "Masculino",
    f: "Feminino",
    other: "Outro",
  };
  return labels[sex] ?? sex;
}

// function formatBooleanCategory(value: string): string {
//   if (value === "true") return "Sim";
//   if (value === "false") return "Não";
//   return value;
// }

function formatPresentialCategory(value: string): string {
  if (value === "true") return "Presencial";
  if (value === "false") return "Remoto";
  return value;
}

export function buildMetricsExportSheets(params: {
  metrics: ConsultationMetrics;
  metadataRows: ExportCell[][];
  activeTab: string;
}): ExportSheet[] {
  console.log("[buildMetricsExportSheets] Building metrics export sheets", params);
  const { metrics, metadataRows, activeTab } = params;

  const sheets: ExportSheet[] = [];

  // Helper: attach metadata rows only to the first sheet so we
  // include filters/specialty info without duplicating it everywhere.
  const pushWithMetadata = (sheet: Omit<ExportSheet, "metadataRows">) => {
    if (sheets.length === 0) {
      sheets.push({
        ...sheet,
        metadataRows,
      });
    } else {
      sheets.push(sheet);
    }
  };

  if (activeTab === "Geral") {
    // Resumo sheet (only for Geral tab)
    const resumoHeaders = ["Métrica", "Valor"];
    const resumoRows: ExportCell[][] = [
      ["Total de consultas", metrics.totalConsultations],
      [
        "Idade média",
        Number.isFinite(metrics.averageAge) ? metrics.averageAge.toFixed(1) : null,
      ],
    ];
    pushWithMetadata({
      sheetName: "Resumo",
      headers: resumoHeaders,
      rows: resumoRows,
    });

    // Consultas por mês
    if (metrics.byMonth.length > 0) {
      pushWithMetadata({
        sheetName: "Consultas por mês",
        headers: ["Mês", "Consultas"],
        rows: metrics.byMonth.map((item) => [item.month, item.count]),
      });
    }

    // Sexo
    if (metrics.bySex.length > 0) {
      pushWithMetadata({
        sheetName: "Sexo",
        headers: ["Sexo", "Consultas"],
        rows: metrics.bySex.map((item) => [
          formatSexForMetrics(String(item.sex)),
          item.count,
        ]),
      });
    }

    // Faixa etária
    if (metrics.byAgeRange.length > 0) {
      pushWithMetadata({
        sheetName: "Faixa etária",
        headers: ["Faixa", "Consultas"],
        rows: metrics.byAgeRange.map((item) => [item.range, item.count]),
      });
    }
  } else if (activeTab === "Consultas") {
    // Tipologia
    if (metrics.byType.length > 0) {
      pushWithMetadata({
        sheetName: "Tipologia",
        headers: ["Valor", "Label", "Consultas"],
        rows: metrics.byType.map((item) => [
          item.type,
          item.label,
          item.count,
        ]),
      });
    }

    // Presencial
    if (metrics.byPresential.length > 0) {
      pushWithMetadata({
        sheetName: "Presencial",
        headers: ["Categoria", "Consultas"],
        rows: metrics.byPresential.map((item) => [
          formatPresentialCategory(String(item.presential)),
          item.count,
        ]),
      });
    }

    // Fumador
    if (metrics.bySmoker.length > 0) {
      pushWithMetadata({
        sheetName: "Fumador",
        headers: ["Categoria", "Consultas"],
        rows: metrics.bySmoker.map((item) => [
          formatWithOptions(mgfFieldByKey.get("smoker"), item.smoker),
          item.count,
        ]),
      });
    }

    // Contraceptivo
    if (metrics.byContraceptive.length > 0) {
      pushWithMetadata({
        sheetName: "Contraceptivo",
        headers: ["Categoria", "Consultas"],
        rows: metrics.byContraceptive.map((item) => [
          formatWithOptions(mgfFieldByKey.get("contraceptive"), item.contraceptive),
          item.count,
        ]),
      });
    }

    // Novo contraceptivo
    if (metrics.byNewContraceptive.length > 0) {
      pushWithMetadata({
        sheetName: "Novo contraceptivo",
        headers: ["Categoria", "Consultas"],
        rows: metrics.byNewContraceptive.map((item) => [
          formatWithOptions(
            mgfFieldByKey.get("new_contraceptive"),
            item.newContraceptive
          ),
          item.count,
        ]),
      });
    }
  } else if (activeTab === "ICPC-2") {
    // ICPC-2 combined sheet
    const icpcRows: ExportCell[][] = [];

    if (metrics.byDiagnosis.length > 0) {
      metrics.byDiagnosis.forEach((item) => {
        icpcRows.push(["Diagnóstico", item.code, item.count]);
      });
    }
    if (metrics.byProblems.length > 0) {
      metrics.byProblems.forEach((item) => {
        icpcRows.push(["Problema", item.code, item.count]);
      });
    }
    if (metrics.byNewDiagnosis.length > 0) {
      metrics.byNewDiagnosis.forEach((item) => {
        icpcRows.push(["Novo diagnóstico", item.code, item.count]);
      });
    }

    if (icpcRows.length > 0) {
      pushWithMetadata({
        sheetName: "ICPC-2",
        headers: ["Tipo", "Código", "Consultas"],
        rows: icpcRows,
      });
    }
  }

  return sheets;
}


