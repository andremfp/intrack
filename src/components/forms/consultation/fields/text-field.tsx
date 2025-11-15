import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import type { SpecialtyField } from "@/constants";

interface BaseFieldProps {
  field: SpecialtyField;
  value: string | string[];
  errorMessage?: string;
  onUpdate: (value: string | string[]) => void;
}

export function TextField({
  field,
  value,
  errorMessage,
  onUpdate,
}: BaseFieldProps) {
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  const stringValue = typeof value === "string" ? value : "";

  if (field.key === "date") {
    return (
      <div className="space-y-1.5">
        <DatePicker
          id={fieldId}
          label={field.label}
          value={stringValue}
          onChange={(date: string) => onUpdate(date)}
          placeholder="dd/mm/aaaa"
          required={field.required}
          isInvalid={isInvalid}
          describedBy={isInvalid ? `${fieldId}-error` : undefined}
        />
        {isInvalid && (
          <p id={`${fieldId}-error`} className="text-xs text-destructive mt-1">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={fieldId}
        type="text"
        value={stringValue}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        aria-invalid={isInvalid || undefined}
        aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
        className={isInvalid ? "border-destructive" : ""}
      />
      {isInvalid && (
        <p id={`${fieldId}-error`} className="text-xs text-destructive mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
