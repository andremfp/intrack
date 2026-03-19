import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReferrenceEntry, SpecialtyField } from "@/constants";

interface ReferrenceListCellProps {
  value: unknown;
  field: SpecialtyField;
}

/** Resolves a specialty value key to its display label using the field's options. */
function resolveLabel(key: string, field: SpecialtyField): string {
  const match = field.options?.find(
    (opt): opt is { value: string; label: string } =>
      "value" in opt && opt.value === key,
  );
  return match ? match.label : key;
}

/**
 * Table cell for "referrence-list" fields.
 * Shows specialty labels as a bullet list (max 2 + "+X more").
 * Tooltip reveals all entries with their associated ICPC-2 codes.
 */
export function ReferrenceListCell({ value, field }: ReferrenceListCellProps) {
  const entries = Array.isArray(value) ? (value as ReferrenceEntry[]) : [];
  if (entries.length === 0) return <span>-</span>;

  const maxVisible = 2;
  const visibleEntries = entries.slice(0, maxVisible);
  const remainingCount = entries.length - maxVisible;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              {visibleEntries.map((entry, idx) => {
                const [specialty] = Object.keys(entry);
                return (
                  <li key={idx} className="font-semibold">
                    {specialty}
                  </li>
                );
              })}
              {remainingCount > 0 && (
                <li className="font-semibold text-muted-foreground">
                  +{remainingCount}
                </li>
              )}
            </ul>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[320px]">
          <div className="space-y-2">
            {entries.map((entry, idx) => {
              const [specialty, codes] = Object.entries(entry)[0] ?? [];
              if (!specialty) return null;
              return (
                <div key={idx}>
                  <p className="text-sm font-semibold">
                    {resolveLabel(specialty, field)}{" "}
                  </p>
                  {Array.isArray(codes) && codes.length > 0 ? (
                    <ul className="mt-0.5 space-y-0.5">
                      {codes.map((code, cIdx) => {
                        // Parse "CODE - Description" format stored per ICPC-2 entry
                        const match = String(code).match(
                          /^([A-Z]\d{2})\s*-\s*(.+)$/,
                        );
                        return (
                          <li
                            key={cIdx}
                            className="text-xs whitespace-normal break-words"
                          >
                            {match ? (
                              <>
                                <span className="font-mono font-semibold">
                                  {match[1]}
                                </span>{" "}
                                - {match[2]}
                              </>
                            ) : (
                              <span className="font-mono">{code}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-xs mt-0.5">Sem motivo</p>
                  )}
                </div>
              );
            })}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
