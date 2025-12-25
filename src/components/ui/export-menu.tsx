import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Printer,
} from "lucide-react";

interface ExportMenuProps {
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  isExportingCsv?: boolean;
  isExportingExcel?: boolean;
  isPrinting?: boolean;
  isLoading?: boolean;
  className?: string;
  buttonLabel?: string;
}

export function ExportMenu({
  onExportCsv,
  onExportExcel,
  onExportPdf,
  isExportingCsv = false,
  isExportingExcel = false,
  isPrinting = false,
  isLoading = false,
  className,
  buttonLabel = "Exportar",
}: ExportMenuProps) {
  const [open, setOpen] = React.useState(false);
  const isExporting = isExportingCsv || isExportingExcel || isPrinting;

  const handleCsv = () => {
    onExportCsv?.();
    setOpen(false);
  };

  const handleExcel = () => {
    onExportExcel?.();
    setOpen(false);
  };

  const handlePdf = () => {
    onExportPdf?.();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || isExporting}
          className={`h-8 ${className ?? ""}`}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">A exportar...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{buttonLabel}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="end">
        <div className="space-y-1">
          {onExportCsv && (
            <button
              type="button"
              onClick={handleCsv}
              disabled={isExportingCsv || isLoading}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExportingCsv ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />A exportar CSV...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Exportar CSV
                </>
              )}
            </button>
          )}
          {onExportExcel && (
            <button
              type="button"
              onClick={handleExcel}
              disabled={isExportingExcel || isLoading}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExportingExcel ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />A exportar
                  Excel...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4" />
                  Exportar Excel
                </>
              )}
            </button>
          )}
          {onExportPdf && (
            <button
              type="button"
              onClick={handlePdf}
              disabled={isPrinting || isLoading}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparar impressão...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  Exportar PDF
                </>
              )}
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
