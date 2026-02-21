/**
 * Smoke tests verifying that each route page renders without error when loaded
 * via React.lazy + Suspense.  They mirror exactly what main.tsx will do after
 * the lazy-loading refactor (Step 2) and serve as regression protection: they
 * must pass both before and after that refactor.
 *
 * Also contains smoke tests for DashboardContentRouter tab routing (Step 3),
 * which mirror how dashboard-content-router.tsx will lazy-load its three child
 * dashboards after Step 4.
 */
import { describe, beforeAll, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Suspense, lazy } from "react";
import type { DashboardContentRouterProps } from "@/components/dashboard/types";

// ---------------------------------------------------------------------------
// Shared dependency mocks
// ---------------------------------------------------------------------------

vi.mock("@/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

// Render children directly — avoids localStorage/ThemeContext side-effects
vi.mock("@/components/theme/theme-provider", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// ---------------------------------------------------------------------------
// LandingPage child mocks
// ---------------------------------------------------------------------------

vi.mock("@/components/ui/navbar-landing", () => ({
  NavbarLanding: () => <nav data-testid="navbar-landing" />,
}));

vi.mock("@/components/ui/hero-section", () => ({
  HeroSection: () => <section data-testid="hero-section" />,
}));

vi.mock("@/components/ui/features-section", () => ({
  FeaturesSection: () => <section data-testid="features-section" />,
}));

vi.mock("@/components/ui/footer", () => ({
  Footer: () => <footer data-testid="footer" />,
}));

// ---------------------------------------------------------------------------
// Login / Register shared UI mocks
// ---------------------------------------------------------------------------

vi.mock("@/components/theme/mode-toggle", () => ({
  ModeToggle: () => <button />,
}));

vi.mock("@/components/ui/gradient-background", () => ({
  GradientBackground: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/logo", () => ({
  AppLogo: () => <span />,
}));

vi.mock("@/components/forms/login-form", () => ({
  LoginForm: () => <form data-testid="login-form" />,
}));

vi.mock("@/components/forms/signup-form", () => ({
  SignupForm: () => <form data-testid="signup-form" />,
}));

// ---------------------------------------------------------------------------
// Dashboard page mocks — stubs for Sidebar primitives, hooks, and child panels
// ---------------------------------------------------------------------------

vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/sidebar-context", () => ({
  useSidebar: () => ({ setOpenMobile: vi.fn() }),
}));

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => null,
}));

vi.mock("@/components/sidebar/app-sidebar", () => ({
  AppSidebar: () => <aside data-testid="app-sidebar" />,
}));

vi.mock("@/components/site-header", () => ({
  SiteHeader: () => <header data-testid="site-header" />,
}));

vi.mock("@/components/modals/modal-manager", () => ({
  ModalManager: () => <div data-testid="modal-manager" />,
}));

vi.mock("@/components/dashboard/dashboard-content-router", () => ({
  DashboardContentRouter: () => (
    <div data-testid="dashboard-content-router" />
  ),
}));

// ---------------------------------------------------------------------------
// DashboardContentRouter child mocks — stub the three heavy sub-dashboards so
// that DashboardContentRouter tests do not pull in their real dependencies.
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

// Pass children through so DashboardContentRouter's ErrorBoundary wrappers are transparent.
vi.mock("@/components/error-boundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/hooks/user/use-user-initialization", () => ({
  useUserInitialization: () => ({ isLoading: false, showSpecialtyModal: false }),
}));

vi.mock("@/hooks/user/use-cached-user-profile", () => ({
  useCachedUserProfile: () => [null, vi.fn()],
}));

vi.mock("@/hooks/user/use-cached-user-specialty", () => ({
  useCachedUserSpecialty: () => [null, vi.fn()],
}));

vi.mock("@/hooks/user/use-cached-active-tab", () => ({
  useCachedActiveTab: () => ["", vi.fn()],
}));

vi.mock("@/hooks/modals/use-dashboard-modals", () => ({
  useDashboardModals: () => ({
    showSpecialtyModal: false,
    showProfileModal: false,
    showConsultationModal: false,
    showAboutModal: false,
    editingConsultation: null,
    specialtyYear: null,
    handleSpecialtySelected: vi.fn(),
    handleRowClick: vi.fn(),
    handleAddConsultation: vi.fn(),
    handleConsultationSaved: vi.fn(),
    openProfileModal: vi.fn(),
    openAboutModal: vi.fn(),
    closeModal: vi.fn(),
    // withMobileClose wraps a callback — return the callback unchanged
    withMobileClose: (fn: unknown) => fn,
    refreshConsultationsRef: { current: null },
    refreshMetricsRef: { current: null },
    refreshReportsRef: { current: null },
    updateInitShowSpecialtyModal: vi.fn(),
  }),
}));

vi.mock("@/lib/api/specialties", () => ({
  getSpecialty: vi.fn(),
}));

vi.mock("@/lib/api/users", () => ({
  getCurrentUser: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Lazy component definitions — exactly mirrors what main.tsx will do in Step 2
// ---------------------------------------------------------------------------

const LandingPage = lazy(() => import("@/app/landing/page"));
const Login = lazy(() => import("@/app/login/page"));
const Register = lazy(() => import("@/app/register/page"));
const Dashboard = lazy(() => import("@/app/dashboard/page"));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Lazy-loaded route smoke tests", () => {
  it("LandingPage renders inside Suspense", async () => {
    render(
      <Suspense fallback={<div>A carregar...</div>}>
        <LandingPage />
      </Suspense>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("hero-section")).toBeInTheDocument(),
    );
  });

  it("Login renders inside Suspense", async () => {
    render(
      <Suspense fallback={<div>A carregar...</div>}>
        <Login />
      </Suspense>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("login-form")).toBeInTheDocument(),
    );
  });

  it("Register renders inside Suspense", async () => {
    render(
      <Suspense fallback={<div>A carregar...</div>}>
        <Register />
      </Suspense>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("signup-form")).toBeInTheDocument(),
    );
  });

  it("Dashboard renders inside Suspense", async () => {
    render(
      <Suspense fallback={<div>A carregar...</div>}>
        <Dashboard />
      </Suspense>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("app-sidebar")).toBeInTheDocument(),
    );
  });
});

// ---------------------------------------------------------------------------
// DashboardContentRouter tab smoke tests
//
// These tests render the *real* DashboardContentRouter (bypassing the module-
// level mock above via vi.importActual) with its three heavy child components
// stubbed out.  They assert that the correct child is mounted for each
// mainTab value, and will serve as regression protection through Step 4
// (dashboard tab lazy loading).
// ---------------------------------------------------------------------------

describe("DashboardContentRouter tab smoke tests", () => {
  // Obtain the real implementation, bypassing the module-level mock.
  let DashboardContentRouter: React.ComponentType<DashboardContentRouterProps>;

  beforeAll(async () => {
    const mod = await vi.importActual<
      typeof import("@/components/dashboard/dashboard-content-router")
    >("@/components/dashboard/dashboard-content-router");
    DashboardContentRouter = mod.DashboardContentRouter;
  });

  // Common no-op callbacks reused across all tab tests.
  const noop = vi.fn();

  it("renders MetricsDashboard when mainTab is Métricas", async () => {
    render(
      <Suspense fallback={<div>A carregar...</div>}>
        <DashboardContentRouter
          mainTab="Métricas"
          userId="user-1"
          userSpecialty={null}
          metricsSubTab="Geral"
          onRowClick={noop}
          onAddConsultation={noop}
          onConsultationsRefreshReady={noop}
        />
      </Suspense>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("metrics-dashboard")).toBeInTheDocument(),
    );
  });

  it("renders ConsultationsDashboard when mainTab is Consultas", async () => {
    render(
      <Suspense fallback={<div>A carregar...</div>}>
        <DashboardContentRouter
          mainTab="Consultas"
          userId="user-1"
          userSpecialty={null}
          metricsSubTab={null}
          onRowClick={noop}
          onAddConsultation={noop}
          onConsultationsRefreshReady={noop}
        />
      </Suspense>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("consultations-dashboard")).toBeInTheDocument(),
    );
  });

  it("renders ReportsDashboard when mainTab is Relatórios", async () => {
    // ReportsDashboard requires a matched specialty and report key.
    const specialty = {
      id: "sp-1",
      code: "mgf",
      name: "Medicina Geral e Familiar",
      years: 4,
      created_at: "",
      updated_at: "",
    };

    render(
      <Suspense fallback={<div>A carregar...</div>}>
        <DashboardContentRouter
          mainTab="Relatórios"
          userId="user-1"
          userSpecialty={specialty}
          metricsSubTab={null}
          activeReportKey="year1"
          activeReportSpecialtyCode="mgf"
          onRowClick={noop}
          onAddConsultation={noop}
          onConsultationsRefreshReady={noop}
        />
      </Suspense>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("reports-dashboard")).toBeInTheDocument(),
    );
  });
});
