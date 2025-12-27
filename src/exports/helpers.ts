import { COMMON_CONSULTATION_FIELDS, MGF_FIELDS, MGF_CONSULTATION_TYPE_SECTIONS, TAB_CONSTANTS, type SpecialtyField } from "@/constants";
import type { ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type {
  ConsultationMGF,
  ConsultationMetrics,
} from "@/lib/api/consultations";
import type {
  ExportCell,
  ExportRow,
  ExportTable,
  ExportSheet,
  ConsultationExportCell,
  ConsultationExportTable,
} from "./types";
import type {
  MGFReportData,
  MGFReportSummary,
  WeekSample,
  UnitSampleBreakdown,
  UrgencySelection,
  InternshipsSample,
  ProblemCount,
} from "@/reports/report-types";

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

export async function downloadReportPdfReact(options: {
  filename: string;
  pdfDocument: ReactElement<DocumentProps>;
}): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const { filename, pdfDocument } = options;
  const [{ pdf }] = await Promise.all([import("@react-pdf/renderer")]);
  const blob = await pdf(pdfDocument).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", ensureFileExtension(filename, ".pdf"));
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

function getTypeSpecificValue(
  consultation: ConsultationMGF,
  type: string,
  sectionKey: string,
  fieldKey: string
): unknown {
  if (!consultation.details || typeof consultation.details !== "object") {
    return null;
  }
  const details = consultation.details as Record<string, unknown>;
  const typeKey = type.toLowerCase();
  const typeData = details[typeKey] as
    | Record<string, Record<string, unknown>>
    | undefined;
  if (!typeData) return null;
  const sectionData = typeData[sectionKey] as Record<string, unknown> | undefined;
  if (!sectionData) return null;
  return sectionData[fieldKey] ?? null;
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

  return String(value);
}

function formatIcpcCodes(value: unknown): ConsultationExportCell {
  return formatTextList(value);
}

interface ExportColumnConfig {
  key: string;
  header: string;
  source: "column" | "details" | "type_specific";
  fieldKey?: string;
  typeKey?: string; // For type-specific fields: the consultation type (e.g., "dm", "hta", "sm")
  sectionKey?: string; // For type-specific fields: the section key (e.g., "exams", "history")
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
    key: "favorite",
    header: "Favorito",
    source: "column",
    formatter: (value) => formatBoolean(value),
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
    key: "family_type",
    header: "Tipologia de Família",
    source: "details",
    formatter: (value) =>
      formatWithOptions(mgfFieldByKey.get("family_type"), value),
  },
  {
    key: "school_level",
    header: "Escolaridade",
    source: "details",
    formatter: (value) =>
      formatWithOptions(mgfFieldByKey.get("school_level"), value),
  },
  {
    key: "professional_area",
    header: "Sector de Actividade",
    source: "details",
    formatter: (value) =>
      formatWithOptions(mgfFieldByKey.get("professional_area"), value),
  },
  {
    key: "profession",
    header: "Profissão",
    source: "details",
    formatter: (value) =>
      formatWithOptions(mgfFieldByKey.get("profession"), value),
  },
  {
    key: "vaccination_plan",
    header: "PNV Cumprido",
    source: "details",
    formatter: (value) => formatBoolean(value),
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
    key: "chronic_diseases",
    header: "Doenças Crónicas",
    source: "details",
    formatter: (value) => formatTextList(value),
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
  // Type-specific fields: DM (Diabetes)
  {
    key: "dm_exams_creatinina",
    header: "DM - Creatinina (mg/dL)",
    source: "type_specific",
    typeKey: "dm",
    sectionKey: "exams",
    fieldKey: "creatinina",
    formatter: (value) =>
      typeof value === "number" ? value : value ? Number(value) || String(value) : null,
  },
  {
    key: "dm_exams_score2",
    header: "DM - Score2",
    source: "type_specific",
    typeKey: "dm",
    sectionKey: "exams",
    fieldKey: "score2",
    formatter: (value) => (value ? String(value) : null),
  },
  {
    key: "dm_exams_albuminuria",
    header: "DM - Albuminuria (mg/g)",
    source: "type_specific",
    typeKey: "dm",
    sectionKey: "exams",
    fieldKey: "albuminuria",
    formatter: (value) =>
      typeof value === "number" ? value : value ? Number(value) || String(value) : null,
  },
  {
    key: "dm_exams_ldl",
    header: "DM - LDL (mg/dL)",
    source: "type_specific",
    typeKey: "dm",
    sectionKey: "exams",
    fieldKey: "ldl",
    formatter: (value) =>
      typeof value === "number" ? value : value ? Number(value) || String(value) : null,
  },
  {
    key: "dm_exams_hba1c",
    header: "DM - HbA1C (%)",
    source: "type_specific",
    typeKey: "dm",
    sectionKey: "exams",
    fieldKey: "hba1c",
    formatter: (value) =>
      typeof value === "number" ? value : value ? Number(value) || String(value) : null,
  },
  {
    key: "dm_exams_tfg",
    header: "DM - TFG (mL/min)",
    source: "type_specific",
    typeKey: "dm",
    sectionKey: "exams",
    fieldKey: "tfg",
    formatter: (value) =>
      typeof value === "number" ? value : value ? Number(value) || String(value) : null,
  },
  {
    key: "dm_history_medicamentos",
    header: "DM - Medicamentos",
    source: "type_specific",
    typeKey: "dm",
    sectionKey: "history",
    fieldKey: "medicamentos",
    formatter: (value) => formatTextList(value),
  },
  {
    key: "dm_history_complicacoes",
    header: "DM - Complicações",
    source: "type_specific",
    typeKey: "dm",
    sectionKey: "history",
    fieldKey: "complicacoes",
    formatter: (value) => formatTextList(value),
  },
  // Type-specific fields: HTA (Hipertensão Arterial)
  {
    key: "hta_exams_creatinina",
    header: "HTA - Creatinina (mg/dL)",
    source: "type_specific",
    typeKey: "hta",
    sectionKey: "exams",
    fieldKey: "creatinina",
    formatter: (value) =>
      typeof value === "number" ? value : value ? Number(value) || String(value) : null,
  },
  {
    key: "hta_exams_score2",
    header: "HTA - Score2",
    source: "type_specific",
    typeKey: "hta",
    sectionKey: "exams",
    fieldKey: "score2",
    formatter: (value) => (value ? String(value) : null),
  },
  {
    key: "hta_exams_albuminuria",
    header: "HTA - Albuminuria (mg/g)",
    source: "type_specific",
    typeKey: "hta",
    sectionKey: "exams",
    fieldKey: "albuminuria",
    formatter: (value) =>
      typeof value === "number" ? value : value ? Number(value) || String(value) : null,
  },
  {
    key: "hta_exams_ldl",
    header: "HTA - LDL (mg/dL)",
    source: "type_specific",
    typeKey: "hta",
    sectionKey: "exams",
    fieldKey: "ldl",
    formatter: (value) =>
      typeof value === "number" ? value : value ? Number(value) || String(value) : null,
  },
  {
    key: "hta_exams_tfg",
    header: "HTA - TFG (mL/min)",
    source: "type_specific",
    typeKey: "hta",
    sectionKey: "exams",
    fieldKey: "tfg",
    formatter: (value) =>
      typeof value === "number" ? value : value ? Number(value) || String(value) : null,
  },
  {
    key: "hta_history_medicamentos",
    header: "HTA - Medicamentos",
    source: "type_specific",
    typeKey: "hta",
    sectionKey: "history",
    fieldKey: "medicamentos",
    formatter: (value) => formatTextList(value),
  },
  {
    key: "hta_history_complicacoes",
    header: "HTA - Complicações",
    source: "type_specific",
    typeKey: "hta",
    sectionKey: "history",
    fieldKey: "complicacoes",
    formatter: (value) => formatTextList(value),
  },
  // Type-specific fields: SM (Saúde Materna)
  {
    key: "sm_history_trimestre",
    header: "SM - Trimestre",
    source: "type_specific",
    typeKey: "sm",
    sectionKey: "history",
    fieldKey: "trimestre",
    formatter: (value) => {
      const field = MGF_CONSULTATION_TYPE_SECTIONS.sm?.[0]?.fields?.find(
        (f) => f.key === "trimestre"
      );
      return formatWithOptions(field, value);
    },
  },
  {
    key: "sm_history_plano_vigilancia",
    header: "SM - Plano de Vigilância",
    source: "type_specific",
    typeKey: "sm",
    sectionKey: "history",
    fieldKey: "plano-vigilancia",
    formatter: (value) => formatTextList(value),
  },
  {
    key: "sm_history_complicacoes",
    header: "SM - Complicações",
    source: "type_specific",
    typeKey: "sm",
    sectionKey: "history",
    fieldKey: "complicacoes",
    formatter: (value) => formatTextList(value),
  },
];

export function mapConsultationsToExportTable(
  consultations: ConsultationMGF[]
): ConsultationExportTable {
  const headers = EXPORT_COLUMNS.map((col) => col.header);

  const rows = consultations.map<ConsultationExportCell[]>((consultation) => {
    return EXPORT_COLUMNS.map((col) => {
      const fieldKey = col.fieldKey ?? col.key;
      let rawValue: unknown;

      if (col.source === "column") {
        rawValue = (consultation as Record<string, unknown>)[fieldKey];
      } else if (col.source === "type_specific") {
        // Get consultation type from the consultation
        const consultationType = consultation.type as string | undefined;
        if (
          consultationType &&
          col.typeKey &&
          col.sectionKey &&
          consultationType.toLowerCase() === col.typeKey
        ) {
          rawValue = getTypeSpecificValue(
            consultation,
            consultationType,
            col.sectionKey,
            fieldKey
          );
        } else {
          rawValue = null;
        }
      } else {
        // source === "details"
        rawValue = getDetailsValue(consultation, fieldKey);
      }

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

  if (activeTab === TAB_CONSTANTS.METRICS_SUB_TABS.GENERAL) {
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
  } else if (activeTab === TAB_CONSTANTS.METRICS_SUB_TABS.CONSULTATIONS) {
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

    // Caracterização do Utente
    // Tipologia de Família
    if (metrics.byFamilyType.length > 0) {
      pushWithMetadata({
        sheetName: "Tipologia de Família",
        headers: ["Categoria", "Consultas"],
        rows: metrics.byFamilyType.map((item) => [
          formatWithOptions(mgfFieldByKey.get("family_type"), item.familyType),
          item.count,
        ]),
      });
    }

    // Escolaridade
    if (metrics.bySchoolLevel.length > 0) {
      pushWithMetadata({
        sheetName: "Escolaridade",
        headers: ["Categoria", "Consultas"],
        rows: metrics.bySchoolLevel.map((item) => [
          formatWithOptions(mgfFieldByKey.get("school_level"), item.schoolLevel),
          item.count,
        ]),
      });
    }

    // História Clínica
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

    // PNV Cumprido
    if (metrics.byVaccinationPlan.length > 0) {
      pushWithMetadata({
        sheetName: "PNV Cumprido",
        headers: ["Categoria", "Consultas"],
        rows: metrics.byVaccinationPlan.map((item) => [
          formatBoolean(item.vaccinationPlan),
          item.count,
        ]),
      });
    }

    // Contracetivos
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

    // Diagnósticos
    // Diagnóstico (ICPC-2)
    if (metrics.byDiagnosis.length > 0) {
      pushWithMetadata({
        sheetName: "Diagnóstico (ICPC-2)",
        headers: ["Código", "Consultas"],
        rows: metrics.byDiagnosis
          .filter((item) => item.count > 0)
          .map((item) => [item.code, item.count]),
      });
    }

    // Problemas (ICPC-2)
    if (metrics.byProblems.length > 0) {
      pushWithMetadata({
        sheetName: "Problemas (ICPC-2)",
        headers: ["Código", "Consultas"],
        rows: metrics.byProblems
          .filter((item) => item.count > 0)
          .map((item) => [item.code, item.count]),
      });
    }

    // Novo Diagnóstico (ICPC-2)
    if (metrics.byNewDiagnosis.length > 0) {
      pushWithMetadata({
        sheetName: "Novo Diagnóstico (ICPC-2)",
        headers: ["Código", "Consultas"],
        rows: metrics.byNewDiagnosis
          .filter((item) => item.count > 0)
          .map((item) => [item.code, item.count]),
      });
    }
  }

  return sheets;
}


interface ReportExportTableParams {
  reportData: MGFReportData;
  metadataRows: ExportCell[][];
  reportLabel: string;
}

interface ReportExportSheetsParams {
  reportData: MGFReportData;
  metadataRows: ExportCell[][];
  reportLabel: string;
}

const WEEK_HEADERS = [
  "Semana",
  "Período",
  "Consultas",
  "Dias únicos",
] satisfies (string | number)[];

const URGENCY_HEADERS = [
  "Seleção",
  "Internship",
  "Detalhe",
  "Valor",
] satisfies (string | number)[];
const URGENCY_AUTONOMY_HEADERS = [
  "Seleção",
  "Internship",
  "Contexto",
  "Autonomia",
  "Consultas",
] satisfies (string | number)[];

const FORMATION_HEADERS = [
  "Formação",
  "Detalhe",
  "Valor",
  "Extra",
] satisfies (string | number)[];

export function buildReportExportMetadataRows(params: {
  specialtyCode?: string | null;
  reportLabel: string;
  reportKey: string;
}): ExportCell[][] {
  const { specialtyCode, reportLabel, reportKey } = params;
  const now = new Date();
  const exportDate = now.toLocaleString("pt-PT");
  return [
    ["Exportado em", exportDate],
    ["Especialidade", specialtyCode ? specialtyCode.toUpperCase() : "N/A"],
    ["Relatório", reportLabel],
    ["Chave do relatório", reportKey],
  ];
}

export function buildReportExportTable(params: ReportExportTableParams): ExportTable {
  const { reportData, metadataRows, reportLabel } = params;
  const rows: ExportRow[] = [];

  rows.push(["Informação", "Relatório", reportLabel]);

  if (reportData.summary) {
    addReportSummaryRows(rows, reportData.summary);
  }

  if (reportData.unitSampleBreakdown) {
    addUnitSampleRows(rows, reportData.unitSampleBreakdown);
  }

  addWeekRows(rows, "Semanas selecionadas", reportData.sampleWeeks);
  addWeekRows(rows, "Semanas ano 2", reportData.firstHalfWeeks);
  addWeekRows(rows, "Semanas ano 3", reportData.secondHalfWeeks);

  addUrgencyRows(rows, reportData.urgencySelection);
  addUrgencyAutonomyBreakdownRows(rows, reportData.urgencySelection);
  addInternshipRows(rows, reportData.internshipsSamples);
  addTopProblemsRows(rows, reportData.topProblems);

  return {
    metadataRows,
    headers: ["Seção", "Detalhe", "Valor"],
    rows,
  };
}

export function buildReportExportSheets(params: ReportExportSheetsParams): ExportSheet[] {
  const { reportData, metadataRows } = params;
  const sheets: ExportSheet[] = [];

  const pushSheet = (sheet: Omit<ExportSheet, "metadataRows">) => {
    if (sheet.rows.length === 0) return;
    if (sheets.length === 0) {
      sheets.push({ ...sheet, metadataRows });
    } else {
      sheets.push(sheet);
    }
  };

  if (reportData.summary) {
    const summaryRows: ExportCell[][] = [];
    summaryRows.push(["Total de consultas", reportData.summary.totalConsultations]);
    summaryRows.push([
      "Consultas presenciais",
      reportData.summary.presentialCounts.presential,
    ]);
    summaryRows.push([
      "Consultas não presenciais",
      reportData.summary.presentialCounts.remote,
    ]);
    Object.entries(reportData.summary.typeCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([type, count]) => {
        summaryRows.push([`Tipo: ${type}`, count]);
      });
    Object.entries(reportData.summary.autonomyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([autonomy, count]) => {
        summaryRows.push([`Autonomia: ${autonomy}`, count]);
      });
    pushSheet({
      sheetName: "Resumo",
      headers: ["Métrica", "Valor"],
      rows: summaryRows,
    });
  }

  if (reportData.unitSampleBreakdown) {
    pushSheet({
      sheetName: "Unidade",
      headers: ["Autonomia", "Presencial", "Não presencial", "Total"],
      rows: Object.entries(reportData.unitSampleBreakdown.autonomy)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([autonomy, entry]) => {
          const presentialTrue = entry.presential.get(true)?.consultations ?? 0;
          const presentialFalse = entry.presential.get(false)?.consultations ?? 0;
          return [autonomy, presentialTrue, presentialFalse, entry.consultations];
        }),
    });

    const detailRows: ExportCell[][] = [];
    Object.entries(reportData.unitSampleBreakdown.autonomy)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([autonomy, entry]) => {
        entry.presential.forEach((detail, key) => {
          Object.entries(detail.typeCounts ?? {})
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([type, count]) => {
              detailRows.push([
                autonomy,
                key ? "Presencial" : "Não presencial",
                type,
                count,
              ]);
            });
        });
      });

    pushSheet({
      sheetName: "Unidade (Detalhe)",
      headers: ["Autonomia", "Presencialidade", "Tipologia", "Consultas"],
      rows: detailRows,
    });
  }

  addWeekSheet(reportData.sampleWeeks, "Semanas selecionadas", pushSheet);
  addWeekSheet(reportData.firstHalfWeeks, "Semanas ano 2", pushSheet);
  addWeekSheet(reportData.secondHalfWeeks, "Semanas ano 3", pushSheet);

  if (reportData.urgencySelection && reportData.urgencySelection.length > 0) {
    const rows: ExportCell[][] = [];
    reportData.urgencySelection.forEach((selection) => {
      rows.push([
        selection.label,
        selection.internship,
        "Total consultas",
        selection.totalConsultations,
      ]);
      selection.days.forEach((day) => {
        rows.push([
          selection.label,
          selection.internship,
          day.date,
          day.consultations,
        ]);
      });
    });
    pushSheet({
      sheetName: "Urgência",
      headers: URGENCY_HEADERS,
      rows,
    });

    const autonomyRows: ExportCell[][] = [];
    reportData.urgencySelection.forEach((selection) => {
      Object.entries(selection.autonomyTotals)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([autonomy, count]) => {
          autonomyRows.push([
            selection.label,
            selection.internship,
            "Total",
            autonomy,
            count,
          ]);
        });

      selection.days.forEach((day) => {
        Object.entries(day.autonomyCounts)
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([autonomy, count]) => {
            autonomyRows.push([
              selection.label,
              selection.internship,
              `Dia ${day.date}`,
              autonomy,
              count,
            ]);
          });
      });
    });

    if (autonomyRows.length > 0) {
      pushSheet({
        sheetName: "Urgência (Autonomias)",
        headers: URGENCY_AUTONOMY_HEADERS,
        rows: autonomyRows,
      });
    }
  }

  if (reportData.internshipsSamples && reportData.internshipsSamples.length > 0) {
    const rows: ExportCell[][] = [];
    reportData.internshipsSamples.forEach((sample) => {
      const totalConsultations = sample.weeks.reduce(
        (sum, week) => sum + week.consultations,
        0
      );
      rows.push([sample.label, "Total de semanas", sample.weeks.length, ""]);
      rows.push([sample.label, "Consultas totais", totalConsultations, ""]);
      sample.weeks.forEach((week) => {
        rows.push([
          sample.label,
          `Semana ${week.weekKey}`,
          `${week.startDate} → ${week.endDate}`,
          week.consultations,
        ]);
      });
      Object.entries(sample.autonomyCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([autonomy, count]) => {
          rows.push([sample.label, `Autonomia ${autonomy}`, count, ""]);
        });
    });
    pushSheet({
      sheetName: "Formações complementares",
      headers: FORMATION_HEADERS,
      rows,
    });
  }

  if (reportData.topProblems && reportData.topProblems.length > 0) {
    pushSheet({
      sheetName: "Top problemas",
      headers: ["Código", "Consultas"],
      rows: reportData.topProblems.map((problem) => [
        problem.code,
        problem.count,
      ]),
    });
  }

  return sheets;
}

function addReportSummaryRows(rows: ExportRow[], summary: MGFReportSummary) {
  rows.push(["Resumo", "Total de consultas", summary.totalConsultations]);
  rows.push([
    "Resumo",
    "Consultas presenciais",
    summary.presentialCounts.presential,
  ]);
  rows.push([
    "Resumo",
    "Consultas não presenciais",
    summary.presentialCounts.remote,
  ]);
  Object.entries(summary.typeCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([type, count]) => {
      rows.push(["Resumo", `Tipo: ${type}`, count]);
    });
  Object.entries(summary.autonomyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([autonomy, count]) => {
      rows.push(["Resumo", `Autonomia: ${autonomy}`, count]);
    });
}

function addUnitSampleRows(rows: ExportRow[], breakdown: UnitSampleBreakdown) {
  rows.push(["Unidade", "Consultas totais", breakdown.totalConsultations]);
  Object.entries(breakdown.autonomy)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([autonomy, entry]) => {
      rows.push([
        "Unidade",
        `Autonomia ${autonomy} - Consultas`,
        entry.consultations,
      ]);
      entry.presential.forEach((detail, key) => {
        rows.push([
          "Unidade",
          `Autonomia ${autonomy} - ${key ? "Presencial" : "Não presencial"}`,
          detail.consultations,
        ]);

        Object.entries(detail.typeCounts ?? {})
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([type, count]) => {
            rows.push([
              "Unidade",
              `Autonomia ${autonomy} - ${key ? "Presencial" : "Não presencial"} - Tipo: ${type}`,
              count,
            ]);
          });
      });
    });
}

function addWeekRows(rows: ExportRow[], section: string, weeks?: WeekSample[]) {
  if (!weeks || weeks.length === 0) return;
  weeks.forEach((week) => {
    rows.push([
      section,
      `${week.startDate} → ${week.endDate}`,
      `${week.consultations} consultas (${week.uniqueDays} dias)`,
    ]);
  });
}

function addUrgencyRows(rows: ExportRow[], selections?: UrgencySelection[]) {
  if (!selections || selections.length === 0) return;
  selections.forEach((selection) => {
    rows.push([
      "Urgência",
      `${selection.label} (${selection.internship})`,
      `${selection.totalConsultations} consultas`,
    ]);
    selection.days.forEach((day) => {
      rows.push([
        "Urgência",
        `Dia ${day.date}`,
        `${day.consultations} consultas`,
      ]);
    });
  });
}

function addUrgencyAutonomyBreakdownRows(
  rows: ExportRow[],
  selections?: UrgencySelection[]
) {
  if (!selections || selections.length === 0) return;

  rows.push([]);
  rows.push(["Urgência - Autonomias", "Seleção/Contexto", "Consultas"]);

  selections.forEach((selection) => {
    Object.entries(selection.autonomyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([autonomy, count]) => {
        rows.push([
          "Urgência - Autonomias",
          `${selection.label} (${selection.internship}) - Total - Autonomia ${autonomy}`,
          `${count} consultas`,
        ]);
      });

    selection.days.forEach((day) => {
      Object.entries(day.autonomyCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([autonomy, count]) => {
          rows.push([
            "Urgência - Autonomias",
            `${selection.label} (${selection.internship}) - Dia ${day.date} - Autonomia ${autonomy}`,
            `${count} consultas`,
          ]);
        });
    });
  });
}

function addInternshipRows(rows: ExportRow[], samples?: InternshipsSample[]) {
  if (!samples || samples.length === 0) return;
  samples.forEach((sample) => {
    const totalConsultations = sample.weeks.reduce(
      (sum, week) => sum + week.consultations,
      0
    );
    rows.push([
      "Formações",
      sample.label,
      `${totalConsultations} consultas (${sample.weeks.length} semanas)`,
    ]);
    Object.entries(sample.autonomyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([autonomy, count]) => {
        rows.push([
          "Formações",
          `Autonomia ${autonomy}`,
          `${count} consultas`,
        ]);
      });
  });
}

function addTopProblemsRows(rows: ExportRow[], problems?: ProblemCount[]) {
  if (!problems || problems.length === 0) return;
  problems.forEach((problem) => {
    rows.push([
      "Problemas",
      problem.code,
      `${problem.count} consultas`,
    ]);
  });
}

function addWeekSheet(
  weeks: WeekSample[] | undefined,
  name: string,
  pushSheet: (sheet: Omit<ExportSheet, "metadataRows">) => void
) {
  if (!weeks || weeks.length === 0) return;
  const rows = weeks.map((week) => [
    week.weekKey,
    `${week.startDate} → ${week.endDate}`,
    week.consultations,
    week.uniqueDays,
  ]);
  pushSheet({
    sheetName: name,
    headers: WEEK_HEADERS,
    rows,
  });
}
