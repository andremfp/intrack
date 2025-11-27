import { DataErrorDisplay } from "@/components/ui/data-error-display";
import type { AppError } from "@/errors";

interface MetricsErrorDisplayProps {
  error: AppError;
  onRetry: () => void;
}

/**
 * Error display component for metrics loading failures.
 * Shows when metrics fail to load and there's no cached data to display.
 */
export function MetricsErrorDisplay({
  error,
  onRetry,
}: MetricsErrorDisplayProps) {
  return (
    <DataErrorDisplay
      error={error}
      onRetry={onRetry}
      title="Erro ao carregar métricas"
    />
  );
}
