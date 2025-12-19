import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconX } from "@tabler/icons-react";
import type { SpecialtyField } from "@/constants";

interface SelectFieldProps {
  field: SpecialtyField;
  value: string | string[];
  errorMessage?: string;
  onUpdate: (value: string | string[]) => void;
  isRequired?: boolean; // Optional override for required status
}

export function SelectField({
  field,
  value,
  errorMessage,
  onUpdate,
  isRequired,
}: SelectFieldProps) {
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  const stringValue = typeof value === "string" ? value.trim() : "";
  const required =
    isRequired !== undefined ? isRequired : field.requiredWhen === "always";
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
          onValueChange={(val) => onUpdate(val)}
          required={required}
        >
          <SelectTrigger
            id={fieldId}
            aria-invalid={isInvalid || undefined}
            aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
            className={showClearButton ? "w-full pr-10" : "w-full"}
          >
            <SelectValue
              placeholder={field.placeholder || `Selecionar ${field.label}`}
            />
          </SelectTrigger>
          <SelectContent>
            {field.options
              ?.slice()
              .sort((a, b) => a.label.localeCompare(b.label))
              .map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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
