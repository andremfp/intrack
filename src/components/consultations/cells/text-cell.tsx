import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TextCellProps {
  value: string;
}

export function TextCell({ value }: TextCellProps) {
  const displayValue = value || "-";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="max-w-[200px] truncate block">{displayValue}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px]">
          <p className="text-sm whitespace-normal break-words leading-relaxed">
            {displayValue}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

