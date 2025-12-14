import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { SpecialtyField } from "@/constants";

interface NumberFieldProps {
  field: SpecialtyField;
  value: string | string[];
  errorMessage?: string;
  onUpdate: (value: string | string[]) => void;
}

export function NumberField({
  field,
  value,
  errorMessage,
  onUpdate,
}: NumberFieldProps) {
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  const stringValue = typeof value === "string" ? value : "";

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={fieldId}
          type="number"
          value={stringValue}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          min="0"
          max={field.key === "age" ? "150" : "999999999"}
          className={`flex-1 min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            isInvalid ? "border-destructive" : ""
          }`}
          aria-invalid={isInvalid || undefined}
          aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
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
