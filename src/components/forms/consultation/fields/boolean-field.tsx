import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SpecialtyField } from "@/constants";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface BooleanFieldProps {
  field: SpecialtyField;
  value: string | string[];
  errorMessage?: string;
  onUpdate: (value: string | string[]) => void;
  isRequired?: boolean;
}

export function BooleanField({
  field,
  value,
  errorMessage,
  onUpdate,
  isRequired,
}: BooleanFieldProps) {
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  // For optional fields, allow empty string to represent null/not selected
  const stringValue = typeof value === "string" ? value.trim() : "";
  const required = isRequired ?? field.requiredWhen === "always";
  const placeholder = `Selecionar ${field.label}`;
  // Explicitly convert empty string to undefined for Select component to show placeholder
  const selectValue = stringValue === "" ? undefined : stringValue;
  const hasValue = Boolean(stringValue);
  const showClearButton = !required && hasValue;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <Select
          key={selectValue === undefined ? "cleared" : "set"}
          value={selectValue}
          onValueChange={(val) => {
            // Ensure we update with the selected value
            onUpdate(val);
          }}
          required={required}
        >
          <SelectTrigger
            id={fieldId}
            aria-invalid={isInvalid || undefined}
            aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
            className={showClearButton ? "w-full pr-10" : "w-full"}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Sim</SelectItem>
            <SelectItem value="false">Não</SelectItem>
          </SelectContent>
        </Select>
        {showClearButton && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 z-10 hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Limpar ${field.label}`}
            onMouseDown={(e) => {
              // Prevent the select from opening when clicking the clear button
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <IconX className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      {isInvalid && (
        <p id={`${fieldId}-error`} className="text-xs text-destructive mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
