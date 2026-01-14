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
  const fullValue = value || "-";
  const displayValue =
    fullValue === "-" || fullValue.length <= 10
      ? fullValue
      : `${fullValue.slice(0, 10)}...`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="max-w-[200px] truncate block">{displayValue}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[300px]">
          <p className="text-sm whitespace-normal break-words leading-relaxed">
            {fullValue}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
