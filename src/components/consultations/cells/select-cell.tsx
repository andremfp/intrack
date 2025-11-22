import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SelectCellProps {
  value: string;
  options?: { value: string; label: string }[];
}

export function SelectCell({ value, options }: SelectCellProps) {
  const option = options?.find((opt) => opt.value === value);

  if (!option) {
    return (
      <Badge variant="outline" className="text-xs">
        {value}
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="text-xs cursor-help font-semibold"
          >
            {value}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-sm">{option.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

