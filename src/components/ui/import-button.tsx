import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ImportButtonProps extends ButtonProps {
  label?: string;
}

export function ImportButton({
  label = "Importar",
  className,
  ...props
}: ImportButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={`h-8 flex-shrink-0 ${className ?? ""}`}
      {...props}
    >
      <Upload className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

