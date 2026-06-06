import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { toast } from "sonner";
import { ErrorBoundary, RootErrorFallback } from "@/components/error-boundary";
import "./index.css";

// Route components are lazy-loaded so each page is emitted as its own chunk
// and only fetched when the user navigates to that route.
const LandingPage = lazy(() => import("@/app/landing/page"));
const Login = lazy(() => import("@/app/login/page"));
const Register = lazy(() => import("@/app/register/page"));
const Dashboard = lazy(() => import("@/app/dashboard/page"));
const ForgotPassword = lazy(() => import("@/app/forgot-password/page"));
const ResetPassword = lazy(() => import("@/app/reset-password/page"));
const Privacy = lazy(() => import("@/app/privacy/page"));
const Terms = lazy(() => import("@/app/terms/page"));

function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message.toLowerCase().includes("fetch");
}

function isPGRSTError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    (error as { code: string }).code.startsWith("PGRST")
  );
}

// Create a client with memory-only caching and event-based freshness
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (isNetworkError(error) || isPGRSTError(error)) {
        toast.error("Serviço temporariamente indisponível", {
          description:
            "Não foi possível contactar o servidor. Verifique a sua ligação à internet.",
          duration: Infinity,
          closeButton: true,
          id: "service-unavailable",
        });
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Data never becomes stale automatically
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 2, // Retry failed requests twice
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Suspense is required by React.lazy — shows a minimal fallback while the route chunk loads */}
        <ErrorBoundary fallback={RootErrorFallback}>
          <Suspense fallback={<div>A carregar...</div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
      {/* Rendered in development only. The @tanstack/devtools-vite plugin
          strips this element and its imports from production builds, so no
          manual env guard is needed (and one would break the plugin's
          AST removal, leaving an empty `&& ()` expression). */}
      <TanStackDevtools
        plugins={[
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel />,
            defaultOpen: true,
          },
        ]}
      />
    </QueryClientProvider>
  </StrictMode>
);
