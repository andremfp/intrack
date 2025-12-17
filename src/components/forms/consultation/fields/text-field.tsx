import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import type { SpecialtyField } from "@/constants";

interface BaseFieldProps {
  field: SpecialtyField;
  value: string | string[];
  errorMessage?: string;
  onUpdate: (value: string | string[]) => void;
  isRequired?: boolean;
}

export function TextField({
  field,
  value,
  errorMessage,
  onUpdate,
  isRequired,
}: BaseFieldProps) {
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  const stringValue = typeof value === "string" ? value : "";
  const required = isRequired ?? field.requiredWhen === "always";

  if (field.key === "date") {
    return (
      <div>
        <DatePicker
          id={fieldId}
          label={field.label}
          value={stringValue}
          onChange={(date: string) => onUpdate(date)}
          placeholder="dd/mm/aaaa"
          required={required}
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
    <div>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={fieldId}
          type="text"
          value={stringValue}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder={field.placeholder}
          required={required}
          aria-invalid={isInvalid || undefined}
          aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
          className={isInvalid ? "border-destructive" : ""}
        />
        {"units" in field && (
          <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 min-w-[3rem] text-left">
            {field.units}
          </span>
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
