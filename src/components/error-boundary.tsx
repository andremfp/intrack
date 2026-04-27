import React from "react";
import { DataErrorDisplay } from "@/components/ui/data-error-display";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error | null;
    resetError: () => void;
  }>;
}

/**
 * Error Boundary component to catch and handle React errors
 * Provides error isolation for different sections of the app
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return (
          <Fallback error={this.state.error} resetError={this.resetError} />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI component
 * Uses the shared DataErrorDisplay for consistency
 */
export function DefaultErrorFallback({
  error,
  resetError,
}: {
  error: Error | null;
  resetError: () => void;
}) {
  if (!error) {
    return (
      <DataErrorDisplay
        error={new Error("Erro desconhecido")}
        onRetry={resetError}
        title="Algo correu mal"
      />
    );
  }

  return (
    <DataErrorDisplay
      error={error}
      onRetry={resetError}
      title="Algo correu mal"
    />
  );
}

/**
 * Full-screen fallback for the top-level error boundary.
 * Shown when a critical error escapes all other error boundaries.
 */
export function RootErrorFallback({
  resetError,
}: {
  error: Error | null;
  resetError: () => void;
}) {
  return (
    <div className="h-screen flex items-center justify-center">
      <DataErrorDisplay
        error={
          new Error(
            "Não foi possível carregar a aplicação. Verifique a sua ligação à internet e tente novamente."
          )
        }
        onRetry={resetError}
        title="Serviço temporariamente indisponível"
        retryLabel="Recarregar"
      />
    </div>
  );
}
