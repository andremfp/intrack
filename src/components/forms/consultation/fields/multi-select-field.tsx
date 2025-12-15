import { Label } from "@/components/ui/label";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectItem,
} from "@/components/ui/multi-select";
import type { SpecialtyField } from "@/constants";

interface MultiSelectFieldProps {
  field: SpecialtyField;
  value: string[];
  errorMessage?: string;
  onUpdate: (value: string[]) => void;
  isRequired?: boolean; // Optional override for required status
}

export function MultiSelectField({
  field,
  value,
  errorMessage,
  onUpdate,
  isRequired,
}: MultiSelectFieldProps) {
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  const required = isRequired !== undefined ? isRequired : field.required;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <MultiSelect values={value} onValuesChange={onUpdate}>
        <MultiSelectTrigger
          id={fieldId}
          aria-invalid={isInvalid || undefined}
          aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
        >
          <MultiSelectValue
            placeholder={field.placeholder || `Selecionar ${field.label}`}
          />
        </MultiSelectTrigger>
        <MultiSelectContent>
          {field.options
            ?.slice()
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((option) => (
              <MultiSelectItem key={option.value} value={option.value}>
                {option.label}
              </MultiSelectItem>
            ))}
        </MultiSelectContent>
      </MultiSelect>
      {isInvalid && (
        <p id={`${fieldId}-error`} className="text-xs text-destructive mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
