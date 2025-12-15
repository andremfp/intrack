import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const CLEAR_VALUE = "__intrack_clear__";
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  const stringValue = typeof value === "string" ? value : "";
  const required = isRequired !== undefined ? isRequired : field.required;
  const normalizedValue = stringValue.trim();

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        value={normalizedValue || undefined}
        onValueChange={(val) => {
          if (val === CLEAR_VALUE) {
            onUpdate("");
            return;
          }
          // Defensive toggle (Radix Select may not emit the same value twice,
          // but if it does, allow it to clear like our combobox field does).
          if (val === normalizedValue && !required) {
            onUpdate("");
            return;
          }
          onUpdate(val);
        }}
        required={required}
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
          {!required && (
            <>
              <SelectItem value={CLEAR_VALUE}>Limpar</SelectItem>
              <SelectSeparator />
            </>
          )}
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
