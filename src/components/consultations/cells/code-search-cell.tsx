import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SpecialtyField } from "@/constants";

interface CodeSearchCellProps {
  value: unknown;
  field: SpecialtyField;
}

export function CodeSearchCell({ value, field }: CodeSearchCellProps) {
  const isMultiple = field.multiple ?? false;

  // Handle single selection (profession)
  if (!isMultiple) {
    const code = typeof value === "string" ? value : "";
    if (!code) return <span>-</span>;

    // Find the profession in options
    const profession = field.options?.find(
      (opt) => "code" in opt && opt.code === code
    );

    if (
      !profession ||
      !("code" in profession) ||
      !("description" in profession)
    ) {
      return (
        <Badge variant="outline" className="text-xs font-mono">
          {code}
        </Badge>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="text-xs font-mono font-semibold cursor-help"
            >
              {profession.code}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[300px]">
            <p className="text-sm whitespace-normal break-words">
              <span className="font-mono font-semibold">{profession.code}</span>
              <span className="text-muted-foreground"> - </span>
              <span>{profession.description}</span>
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Handle multiple selection (ICPC2 codes)
  const codeEntries = Array.isArray(value)
    ? value.map((v) => String(v).trim()).filter(Boolean)
    : [];

  if (codeEntries.length === 0) return <span>-</span>;

  // Parse entries to extract codes and descriptions
  const parsedCodes = codeEntries.map((entry) => {
    // Parse "CODE - Description" format
    const match = entry.match(/^([A-Z]\d{2})\s*-\s*(.+)$/);
    if (match) {
      return { code: match[1], description: match[2] };
    }
    // Fallback for old format (just code) - try to find description in options
    const codeOption = field.options?.find(
      (opt) => "code" in opt && opt.code === entry
    );
    if (codeOption && "code" in codeOption && "description" in codeOption) {
      return {
        code: codeOption.code,
        description: codeOption.description,
      };
    }
    // Final fallback - just the code
    return { code: entry, description: undefined };
  });

  // Show max 2 codes, then "+X" for the rest
  const maxVisible = 2;
  const visibleCodes = parsedCodes.slice(0, maxVisible);
  const remainingCount = parsedCodes.length - maxVisible;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              {visibleCodes.map((item, idx) => (
                <li key={idx} className="font-mono font-semibold">
                  {item.code}
                </li>
              ))}
              {remainingCount > 0 && (
                <li className="font-semibold text-muted-foreground">
                  +{remainingCount}
                </li>
              )}
            </ul>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[300px]">
          <div className="space-y-1">
            {parsedCodes.map((item, idx) => (
              <p key={idx} className="text-sm whitespace-normal break-words">
                <span className="font-mono font-semibold">{item.code}</span>
                {item.description && (
                  <>
                    <span className="text-muted-foreground"> - </span>
                    <span>{item.description}</span>
                  </>
                )}
              </p>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
