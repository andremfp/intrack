import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SpecialtyField } from "@/constants";

interface SelectFieldProps {
  field: SpecialtyField;
  value: string | string[];
  errorMessage?: string;
  onUpdate: (value: string | string[]) => void;
}

export function SelectField({
  field,
  value,
  errorMessage,
  onUpdate,
}: SelectFieldProps) {
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  const stringValue = typeof value === "string" ? value : "";

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        value={stringValue}
        onValueChange={(val) => onUpdate(val)}
        required={field.required}
      >
        <SelectTrigger
          id={fieldId}
          aria-invalid={isInvalid || undefined}
          aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
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
      {isInvalid && (
        <p id={`${fieldId}-error`} className="text-xs text-destructive mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
