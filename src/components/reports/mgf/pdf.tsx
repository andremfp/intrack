/* eslint-disable react-refresh/only-export-components */
import React from "react";
import type { ReactElement } from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Needed when executing this module in Node (e.g. CLI PDF generation), since some
// tooling compiles JSX to React.createElement().
void React;
import type {
  InternshipsSample,
  MGFReportData,
  WeekSample,
} from "@/reports/report-types";

const INTRACK_LOGO_SRC =
  typeof window === "undefined"
    ? new URL("../../../../public/intrack-icon-light.png", import.meta.url).href
    : "/intrack-icon-light.png";

// Explicit page box dimensions (points) to guarantee full A4 pages even when
// content is short and wrapping is disabled.
const A4 = { width: 595.28, height: 841.89 } as const;

type ReportDefinitionLike = {
  label: string;
  description: string;
  sections: Array<{
    key: string;
    title: string;
    description: string;
    sampleDescription?: string;
  }>;
};

export interface MGFReportPdfBuildOptions {
  data?: unknown;
  specialtyCode: string;
  definition: ReportDefinitionLike;
  generatedAt?: Date;
}

function isMGFReportData(value: unknown): value is MGFReportData {
  if (!value || typeof value !== "object") return false;
  return "summary" in value;
}

function fmtDatePt(date: Date): string {
  try {
    return date.toLocaleDateString("pt-PT");
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function asText(value: unknown): string {
  if (value === null || value === undefined) return "-";
  return String(value);
}

const styles = StyleSheet.create({
  page: {
    width: A4.width,
    height: A4.height,
    paddingTop: 64,
    paddingBottom: 44,
    paddingHorizontal: 36,
    fontSize: 10,
    color: "#111827",
    fontFamily: "Helvetica",
    lineHeight: 1.35,
    backgroundColor: "#FFFFFF",
  },
  header: {
    position: "absolute",
    top: 18,
    left: 36,
    right: 36,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIcon: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 36,
    right: 36,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    backgroundColor: "#FFFFFF",
    zIndex: 50,
  },
  footerLeft: { flexGrow: 1 },
  footerRight: { width: 140, textAlign: "right" },
  appName: { fontSize: 12, fontWeight: 700 },
  muted: { color: "#6B7280" },
  headerRight: { textAlign: "right" },
  h1: { fontSize: 12, fontWeight: 700 },
  small: { fontSize: 9 },
  sectionTitleWrap: { marginTop: 14 },
  sectionTitle: { fontSize: 11, fontWeight: 700 },
  rule: { marginTop: 6, height: 1, backgroundColor: "#E5E7EB" },
  paragraph: { marginTop: 6 },
  block: { marginTop: 10 },
  panel: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 8,
  },
  kvRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 2,
  },
  kvLabel: { flexGrow: 1, color: "#374151" },
  kvValue: { fontWeight: 700, textAlign: "right" },
  subheading: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#6B7280",
    marginBottom: 4,
  },
  indent: { paddingLeft: 10, marginTop: 4 },
});

function Header(props: {
  appName: string;
  reportTitle: string;
  specialtyCode: string;
  generatedAtLabel: string;
}) {
  return (
    <View style={styles.header} fixed>
      <View style={styles.headerBrand}>
        <Image src={INTRACK_LOGO_SRC} style={styles.logoIcon} />
        <View>
          <Text style={styles.appName}>{props.appName}</Text>
          <Text style={[styles.small, styles.muted]}>
            Relatório • {props.reportTitle}
          </Text>
        </View>
      </View>
      <View>
        <Text style={[styles.small, styles.muted, styles.headerRight]}>
          {props.specialtyCode}
        </Text>
        <Text style={[styles.small, styles.muted, styles.headerRight]}>
          Gerado em {props.generatedAtLabel}
        </Text>
      </View>
    </View>
  );
}

function Footer(props: { pageNumber: number; totalPages: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={[styles.small, styles.muted, styles.footerLeft]}>
        Intrack • Relatórios
      </Text>
      <Text style={[styles.small, styles.muted, styles.footerRight]}>
        Página {props.pageNumber} / {props.totalPages}
      </Text>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionTitleWrap} wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.rule} />
    </View>
  );
}

function KeyValueTable(props: {
  rows: Array<{ label: string; value: unknown }>;
}) {
  return (
    <View>
      {props.rows.map((row) => (
        <View key={row.label} style={styles.kvRow}>
          <Text style={styles.kvLabel}>{row.label}</Text>
          <Text style={styles.kvValue}>{asText(row.value)}</Text>
        </View>
      ))}
    </View>
  );
}

function WeekList({ weeks }: { weeks: WeekSample[] }) {
  return (
    <View>
      {weeks.map((week) => (
        <View key={week.weekKey} style={styles.kvRow}>
          <Text style={styles.kvLabel}>
            {week.startDate} → {week.endDate}
          </Text>
          <Text style={styles.kvValue}>
            {week.consultations}{" "}
            {week.consultations === 1 ? "consulta" : "consultas"}
          </Text>
        </View>
      ))}
    </View>
  );
}

function getPresentialEntries(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presential: any
): Array<
  [boolean, { consultations: number; typeCounts: Record<string, number> }]
> {
  if (!presential) return [];
  if (typeof presential?.entries === "function") {
    return Array.from(presential.entries()) as Array<
      [boolean, { consultations: number; typeCounts: Record<string, number> }]
    >;
  }
  if (typeof presential === "object") {
    return Object.entries(presential).map(([k, v]) => [
      k === "true",
      v as { consultations: number; typeCounts: Record<string, number> },
    ]);
  }
  return [];
}

function InternshipBlock({ sample }: { sample: InternshipsSample }) {
  const total = sample.weeks.reduce((sum, w) => sum + w.consultations, 0);
  const autonomyRows = Object.entries(sample.autonomyCounts)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({ label: `Autonomia ${k}`, value: v }));

  return (
    <View style={styles.panel}>
      <View style={styles.kvRow} wrap={false}>
        <Text style={styles.kvValue}>{sample.label}</Text>
        <Text style={[styles.small, styles.muted]}>{total} consultas</Text>
      </View>

      {sample.weeks.length > 0 && (
        <View style={styles.block}>
          <Text style={styles.subheading}>Amostra</Text>
          <WeekList weeks={sample.weeks} />
        </View>
      )}

      {autonomyRows.length > 0 && (
        <View style={styles.block}>
          <Text style={styles.subheading}>Autonomia</Text>
          <KeyValueTable rows={autonomyRows} />
        </View>
      )}
    </View>
  );
}

export function buildPdfDocument(
  options: MGFReportPdfBuildOptions
): ReactElement {
  const report = isMGFReportData(options.data) ? options.data : null;
  const generatedAtLabel = fmtDatePt(options.generatedAt ?? new Date());

  if (!report) {
    return (
      <Document title={`Intrack - ${options.definition.label}`}>
        <Page size="A4" style={styles.page}>
          <Header
            appName="Intrack"
            reportTitle={options.definition.label}
            specialtyCode={options.specialtyCode}
            generatedAtLabel={generatedAtLabel}
          />
          <View style={styles.block}>
            <Text style={styles.h1}>Sem dados para exportar.</Text>
          </View>
          <Footer pageNumber={1} totalPages={1} />
        </Page>
      </Document>
    );
  }

  const pageBodies: ReactElement[] = buildReportPageBodies({
    report,
    specialtyCode: options.specialtyCode,
    definition: options.definition,
  });
  const totalPages = Math.max(1, pageBodies.length);

  return (
    <Document title={`Intrack - ${options.definition.label}`}>
      {pageBodies.map((body, idx) => (
        <Page key={`p-${idx + 1}`} size="A4" style={styles.page}>
          <Header
            appName="Intrack"
            reportTitle={options.definition.label}
            specialtyCode={options.specialtyCode}
            generatedAtLabel={generatedAtLabel}
          />
          <View wrap={false}>{body}</View>
          <Footer pageNumber={idx + 1} totalPages={totalPages} />
        </Page>
      ))}
    </Document>
  );
}

function paginateByCost<T>(
  items: T[],
  getCost: (item: T) => number,
  maxCost: number
): T[][] {
  const pages: T[][] = [];
  let current: T[] = [];
  let cost = 0;
  for (const item of items) {
    const itemCost = Math.max(1, getCost(item));
    if (current.length > 0 && cost + itemCost > maxCost) {
      pages.push(current);
      current = [];
      cost = 0;
    }
    current.push(item);
    cost += itemCost;
  }
  if (current.length > 0) pages.push(current);
  return pages.length > 0 ? pages : [[]];
}

function buildReportPageBodies(props: {
  report: MGFReportData;
  specialtyCode: string;
  definition: ReportDefinitionLike;
}): ReactElement[] {
  const report = props.report;
  const summary = report.summary;

  const weekGroups: Array<{ label: string; weeks?: WeekSample[] }> = [
    { label: "Amostra selecionada", weeks: report.sampleWeeks },
    { label: "Amostra selecionada (Ano 2)", weeks: report.firstHalfWeeks },
    { label: "Amostra selecionada (Ano 3)", weeks: report.secondHalfWeeks },
  ].filter((g) => g.weeks && g.weeks.length > 0);

  const bodies: ReactElement[] = [];

  // Page 1: intro + summary + week groups
  bodies.push(
    <View key="intro">
      <View style={styles.block}>
        <Text style={styles.h1}>{props.definition.label}</Text>
        <Text style={[styles.paragraph, styles.muted]}>
          {props.definition.description}
        </Text>
        <View style={styles.paragraph}>
          {props.definition.sections.map((s) => (
            <Text key={s.key} style={styles.small}>
              {s.title}: {s.description}
              {s.sampleDescription ? ` (${s.sampleDescription})` : ""}
            </Text>
          ))}
        </View>
      </View>

      <SectionTitle title="Unidade de Saúde" />
      <View style={styles.panel}>
        <Text style={styles.subheading}>Resumo</Text>
        <KeyValueTable
          rows={[
            {
              label: "Consultas contabilizadas",
              value: summary.totalConsultations,
            },
            {
              label: "Consultas presenciais",
              value: summary.presentialCounts.presential,
            },
            {
              label: "Consultas não presenciais",
              value: summary.presentialCounts.remote,
            },
          ]}
        />
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={[styles.panel, { flexGrow: 1 }]}>
          <Text style={styles.subheading}>Tipologia</Text>
          <KeyValueTable
            rows={Object.entries(summary.typeCounts)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, v]) => ({ label: k, value: v }))}
          />
        </View>
        <View style={[styles.panel, { flexGrow: 1 }]}>
          <Text style={styles.subheading}>Autonomia</Text>
          <KeyValueTable
            rows={Object.entries(summary.autonomyCounts)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, v]) => ({ label: k, value: v }))}
          />
        </View>
      </View>

      {weekGroups.length > 0 && (
        <View style={styles.block}>
          <Text style={styles.subheading}>Amostra selecionada</Text>
          {weekGroups.map((g) => (
            <View key={g.label} style={styles.panel}>
              <Text style={styles.kvValue}>{g.label}</Text>
              <View style={{ marginTop: 6 }}>
                <WeekList weeks={g.weeks ?? []} />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // Unit breakdown pages (deterministic chunking; no render props required)
  if (
    report.unitSampleBreakdown &&
    report.unitSampleBreakdown.totalConsultations > 0
  ) {
    const autonomyEntries = Object.entries(
      report.unitSampleBreakdown.autonomy
    ).sort(([a], [b]) => a.localeCompare(b));

    const chunks = paginateByCost(
      autonomyEntries,
      ([, entry]) => {
        const presentials = getPresentialEntries(entry.presential);
        const typeLines = presentials.reduce(
          (sum, [, d]) => sum + Object.keys(d.typeCounts ?? {}).length,
          0
        );
        return 6 + presentials.length * 3 + typeLines; // rough but stable
      },
      48
    );

    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i] ?? [];
      bodies.push(
        <View key={`unit-breakdown-${i}`}>
          <SectionTitle title="Unidade de Saúde (continuação)" />
          <View style={styles.block}>
            <Text style={styles.subheading}>Detalhe da amostra</Text>
            <Text style={[styles.small, styles.muted]}>
              {report.unitSampleBreakdown.totalConsultations} consultas
            </Text>
          </View>

          {chunk.map(([autonomy, entry]) => {
            const presentials = getPresentialEntries(entry.presential).sort(
              ([a], [b]) => Number(b) - Number(a)
            );
            return (
              <View key={autonomy} style={styles.panel}>
                <View style={styles.kvRow}>
                  <Text style={styles.kvValue}>Autonomia {autonomy}</Text>
                  <Text style={[styles.small, styles.muted]}>
                    {entry.consultations} consultas
                  </Text>
                </View>

                {presentials.map(([isPresential, detail]) => {
                  const label = isPresential ? "Presencial" : "Não presencial";
                  const typeRows = Object.entries(detail.typeCounts ?? {})
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([type, count]) => ({ label: type, value: count }));

                  return (
                    <View key={`${autonomy}-${label}`} style={styles.block}>
                      <View style={styles.kvRow}>
                        <Text style={[styles.kvLabel, styles.muted]}>
                          {label}
                        </Text>
                        <Text style={styles.kvValue}>
                          {detail.consultations} consultas
                        </Text>
                      </View>
                      {typeRows.length > 0 && (
                        <View style={styles.indent}>
                          <KeyValueTable rows={typeRows} />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      );
    }
  }

  // Urgency pages
  if (report.urgencySelection && report.urgencySelection.length > 0) {
    const urgencyChunks = paginateByCost(
      report.urgencySelection,
      (sel) =>
        8 + sel.days.length + Object.keys(sel.autonomyTotals ?? {}).length,
      52
    );

    for (let i = 0; i < urgencyChunks.length; i += 1) {
      const chunk = urgencyChunks[i] ?? [];
      bodies.push(
        <View key={`urg-${i}`}>
          <SectionTitle title="Urgência" />
          {chunk.map((sel) => (
            <View key={`${sel.label}-${sel.internship}`} style={styles.panel}>
              <View style={styles.kvRow}>
                <Text style={styles.kvValue}>{sel.label}</Text>
                <Text style={[styles.small, styles.muted]}>
                  {sel.totalConsultations} consultas
                </Text>
              </View>

              <View style={styles.block}>
                <Text style={styles.subheading}>Amostra selecionada</Text>
                {sel.days.map((day) => (
                  <View
                    key={`${sel.label}-${sel.internship}-${day.date}`}
                    style={styles.kvRow}
                  >
                    <Text style={styles.kvLabel}>{day.date}</Text>
                    <Text style={styles.kvValue}>{day.consultations}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.block}>
                <Text style={styles.subheading}>Autonomia (total)</Text>
                <KeyValueTable
                  rows={Object.entries(sel.autonomyTotals)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => ({ label: k, value: v }))}
                />
              </View>
            </View>
          ))}

          {i === urgencyChunks.length - 1 &&
            report.topProblems &&
            report.topProblems.length > 0 && (
              <View style={styles.block}>
                <Text style={styles.subheading}>Problemas mais frequentes</Text>
                <KeyValueTable
                  rows={report.topProblems.map((p) => ({
                    label: p.code,
                    value: p.count,
                  }))}
                />
              </View>
            )}
        </View>
      );
    }
  }

  // Internships pages
  if (report.internshipsSamples && report.internshipsSamples.length > 0) {
    const internshipChunks = paginateByCost(
      report.internshipsSamples,
      (sample) =>
        6 +
        (sample.weeks?.length ?? 0) +
        Object.keys(sample.autonomyCounts ?? {}).length,
      52
    );
    for (let i = 0; i < internshipChunks.length; i += 1) {
      const chunk = internshipChunks[i] ?? [];
      bodies.push(
        <View key={`intern-${i}`}>
          <SectionTitle title="Formações complementares" />
          {chunk.map((sample) => (
            <InternshipBlock key={sample.label} sample={sample} />
          ))}
        </View>
      );
    }
  }

  return bodies;
}
