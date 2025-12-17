import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ICPC2CodesCellProps {
  value: unknown;
}

export function ICPC2CodesCell({ value }: ICPC2CodesCellProps) {
  const codeEntries = Array.isArray(value)
    ? value.map((v) => String(v).trim()).filter(Boolean)
    : [];

  if (codeEntries.length === 0) return <span>-</span>;

  return (
    <div className="max-w-[200px] space-y-1">
      {codeEntries.map((entry, idx) => {
        const match = entry.match(/^([A-Z]\d{2})\s*-\s*(.+)$/);
        if (match) {
          const code = match[1];
          const description = match[2];
          return (
            <TooltipProvider key={idx}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-start gap-1 text-xs cursor-help">
                    <Badge
                      variant="outline"
                      className="font-mono font-semibold shrink-0 text-[10px] px-1 py-0"
                    >
                      {code}
                    </Badge>
                    <span className="text-muted-foreground line-clamp-1 text-[10px] leading-tight">
                      {description}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px]">
                  <p className="text-sm">
                    <span className="font-mono font-semibold">{code}</span>
                    <span className="text-muted-foreground"> - </span>
                    <span>{description}</span>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        // Fallback for old format (just code)
        return (
          <Badge key={idx} variant="outline" className="text-xs font-mono">
            {entry}
          </Badge>
        );
      })}
    </div>
  );
}
