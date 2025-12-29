import { writeFile } from "node:fs/promises";

import { pdf } from "@react-pdf/renderer";

import { buildPdfDocument } from "@/components/reports/mgf/pdf";
import type { MGFReportData } from "@/reports/report-types";

const dummyReport: MGFReportData = {
  summary: {
    totalConsultations: 42,
    typeCounts: {
      "Saúde do Adulto": 20,
      "Saúde Infantil": 12,
      "Saúde Materna": 10,
    },
    autonomyCounts: {
      A: 8,
      B: 14,
      C: 20,
    },
    presentialCounts: {
      presential: 30,
      remote: 12,
    },
  },
  sampleWeeks: [
    {
      weekKey: "2025-W01",
      startDate: "2025-01-01",
      endDate: "2025-01-07",
      consultations: 10,
      uniqueDays: 5,
    },
  ],
};

async function main() {
  const doc = buildPdfDocument({
    data: dummyReport,
    specialtyCode: "MGF",
    definition: {
      label: "Dummy report",
      description: "Minimal stub report to validate PDF rendering.",
      sections: [
        { key: "summary", title: "Resumo", description: "Resumo" },
      ],
    },
    generatedAt: new Date("2025-12-27T00:00:00.000Z"),
  });

  const instance = pdf(doc);
  const buffer = await instance.toBuffer();
  await writeFile("tmp/dummy-report.pdf", buffer);

  console.log("Wrote tmp/dummy-report.pdf");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});



