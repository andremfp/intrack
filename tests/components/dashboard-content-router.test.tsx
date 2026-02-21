import { Suspense } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TAB_CONSTANTS } from "@/constants";
import type { MetricsSubTab } from "@/utils/tab-parsing";
import type { MGFReportKey } from "@/reports/mgf/mgf-reports";
import type { Specialty } from "@/lib/api/specialties";

// ---------------------------------------------------------------------------
// Mock heavy child dashboards — tests focus on routing logic, not child rendering
// ---------------------------------------------------------------------------
vi.mock("@/components/metrics/metrics-dashboard", () => ({
  MetricsDashboard: () => <div data-testid="metrics-dashboard" />,
}));

vi.mock("@/components/consultations/consultations-dashboard", () => ({
  ConsultationsDashboard: () => <div data-testid="consultations-dashboard" />,
}));

vi.mock("@/components/reports/reports-dashboard", () => ({
  ReportsDashboard: () => <div data-testid="reports-dashboard" />,
}));

// ---------------------------------------------------------------------------
// Import subject under test AFTER mocks are established
// ---------------------------------------------------------------------------
import { DashboardContentRouter } from "@/components/dashboard/dashboard-content-router";

function makeSpecialty(code = "mgf"): Specialty {
  return { id: "sp1", code, name: "MGF" } as Specialty;
}

/** Shared base props — override per test as needed */
const baseProps = {
  userId: "u1",
  userSpecialty: null as Specialty | null,
  metricsSubTab: null as MetricsSubTab | null,
  onRowClick: vi.fn(),
  onAddConsultation: vi.fn(),
  onConsultationsRefreshReady: vi.fn(),
};

describe("DashboardContentRouter", () => {
  it("mainTab=Consultas + userId → ConsultationsDashboard rendered", async () => {
    render(
      <Suspense fallback={null}>
        <DashboardContentRouter
          {...baseProps}
          mainTab={TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}
        />
      </Suspense>,
    );
    await waitFor(() =>
      expect(
        screen.getByTestId("consultations-dashboard"),
      ).toBeInTheDocument(),
    );
  });

  it("mainTab=Consultas without userId → ConsultationsDashboard absent", () => {
    render(
      <Suspense fallback={null}>
        <DashboardContentRouter
          {...baseProps}
          mainTab={TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}
          userId=""
        />
      </Suspense>,
    );
    // Condition is false — lazy component never mounts, no suspension occurs.
    expect(
      screen.queryByTestId("consultations-dashboard"),
    ).not.toBeInTheDocument();
  });

  it("mainTab=Métricas + userId + metricsSubTab → MetricsDashboard rendered", async () => {
    render(
      <Suspense fallback={null}>
        <DashboardContentRouter
          {...baseProps}
          mainTab={TAB_CONSTANTS.MAIN_TABS.METRICS}
          metricsSubTab={TAB_CONSTANTS.METRICS_SUB_TABS.GENERAL as MetricsSubTab}
        />
      </Suspense>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("metrics-dashboard")).toBeInTheDocument(),
    );
  });

  it("mainTab=Métricas without metricsSubTab → MetricsDashboard absent", () => {
    render(
      <Suspense fallback={null}>
        <DashboardContentRouter
          {...baseProps}
          mainTab={TAB_CONSTANTS.MAIN_TABS.METRICS}
          metricsSubTab={null}
        />
      </Suspense>,
    );
    // Condition is false — lazy component never mounts, no suspension occurs.
    expect(screen.queryByTestId("metrics-dashboard")).not.toBeInTheDocument();
  });

  it("mainTab=Relatórios + full matching props → ReportsDashboard rendered", async () => {
    const specialty = makeSpecialty("mgf");
    render(
      <Suspense fallback={null}>
        <DashboardContentRouter
          {...baseProps}
          mainTab={TAB_CONSTANTS.MAIN_TABS.REPORTS}
          userSpecialty={specialty}
          activeReportKey={"year1" as MGFReportKey}
          activeReportSpecialtyCode="mgf"
        />
      </Suspense>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("reports-dashboard")).toBeInTheDocument(),
    );
  });

  it("mainTab=Relatórios with specialty code mismatch → ReportsDashboard absent", () => {
    const specialty = makeSpecialty("mgf");
    render(
      <Suspense fallback={null}>
        <DashboardContentRouter
          {...baseProps}
          mainTab={TAB_CONSTANTS.MAIN_TABS.REPORTS}
          userSpecialty={specialty}
          activeReportKey={"year1" as MGFReportKey}
          activeReportSpecialtyCode="other"
        />
      </Suspense>,
    );
    // Condition is false — lazy component never mounts, no suspension occurs.
    expect(screen.queryByTestId("reports-dashboard")).not.toBeInTheDocument();
  });
});
