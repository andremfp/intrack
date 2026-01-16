import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SpecialtyField } from "@/constants";

interface MultiSelectCellProps {
  value: unknown;
  field: SpecialtyField;
}

export function MultiSelectCell({ value, field }: MultiSelectCellProps) {
  const values = Array.isArray(value)
    ? value.map((v) => String(v).trim()).filter(Boolean)
    : [];

  if (values.length === 0) return <span>-</span>;

  // Map values to labels using field options
  const items = values.map((val) => {
    const option = field.options?.find((opt) => opt.value === val);
    return option?.label ?? val;
  });

  // Truncate each item to 20 characters for display
  const truncateText = (text: string) =>
    text.length <= 20 ? text : `${text.slice(0, 20)}...`;

  // Show max 2 items, then "+X" for the rest
  const maxVisible = 2;
  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="max-w-[200px] space-y-0.5 cursor-help">
            {visibleItems.map((item, idx) => (
              <li key={idx} className="list-disc list-inside text-xs">
                {truncateText(item)}
              </li>
            ))}
            {remainingCount > 0 && (
              <div className="flex items-start gap-1 text-xs">
                <span className="leading-tight font-semibold text-muted-foreground">
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[300px]">
          <div className="space-y-0.5 px-2">
            {items.map((item, idx) => (
              <li key={idx} className="text-xs whitespace-normal break-words">
                {item}
              </li>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}