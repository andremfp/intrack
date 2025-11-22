import { Badge } from "@/components/ui/badge";

interface BooleanCellProps {
  value: boolean;
}

export function BooleanCell({ value }: BooleanCellProps) {
  return (
    <Badge variant={value ? "default" : "secondary"} className="text-xs">
      {value ? "Sim" : "Não"}
    </Badge>
  );
}

