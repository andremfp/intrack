import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TextListCellProps {
  value: unknown;
}

export function TextListCell({ value }: TextListCellProps) {
  const items = Array.isArray(value)
    ? value.map((v) => String(v).trim()).filter(Boolean)
    : [];

  if (items.length === 0) return <span>-</span>;

  return (
    <div className="max-w-[200px] space-y-1">
      {items.map((item, idx) => (
        <TooltipProvider key={idx}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-start gap-1 text-xs cursor-help">
                <span className="font-semibold text-muted-foreground shrink-0 text-[10px]">
                  {idx + 1}.
                </span>
                <span className="line-clamp-1 text-[10px] leading-tight">
                  {item}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[300px]">
              <p className="text-sm">
                <span className="font-semibold">{idx + 1}.</span> {item}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}
