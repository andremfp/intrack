import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { AppError } from "@/errors";

interface DataErrorDisplayProps {
  error: AppError | Error;
  onRetry: () => void;
  title?: string;
  retryLabel?: string;
}

/**
 * Reusable error display component for data loading failures and React errors.
 * Shows when data fails to load and there's no cached data to display.
 * Can handle both AppError (with userMessage) and standard Error objects.
 */
export function DataErrorDisplay({
  error,
  onRetry,
  title = "Erro ao carregar dados",
  retryLabel = "Tentar novamente",
}: DataErrorDisplayProps) {
  // Extract user-friendly message from either AppError or Error
  const errorMessage =
    error instanceof Error && "userMessage" in error
      ? (error as AppError).userMessage
      : error.message;

  return (
    <div className="flex flex-1 min-h-full items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4 max-w-md px-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {retryLabel}
        </Button>
      </div>
    </div>
  );
}
