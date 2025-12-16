import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { SpecialtyField } from "@/constants";

interface TextareaFieldProps {
  field: SpecialtyField;
  value: string | string[];
  errorMessage?: string;
  onUpdate: (value: string | string[]) => void;
  isRequired?: boolean;
}

export function TextareaField({
  field,
  value,
  errorMessage,
  onUpdate,
  isRequired,
}: TextareaFieldProps) {
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  const stringValue = typeof value === "string" ? value : "";
  const required = isRequired ?? field.requiredWhen === "always";

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={fieldId}
        value={stringValue}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={field.placeholder}
        required={required}
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
