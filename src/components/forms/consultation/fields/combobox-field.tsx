import * as React from "react";
import { Label } from "@/components/ui/label";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import type { SpecialtyField } from "@/constants";

interface ComboboxFieldProps {
  field: SpecialtyField;
  value: string | string[];
  errorMessage?: string;
  onUpdate: (value: string | string[]) => void;
  isRequired?: boolean; // Optional override for required status
}

export function ComboboxField({
  field,
  value,
  errorMessage,
  onUpdate,
  isRequired,
}: ComboboxFieldProps) {
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  const stringValue = typeof value === "string" ? value : "";
  const required =
    isRequired !== undefined ? isRequired : field.requiredWhen === "always";

  // Normalize options from SpecialtyFieldOption[] to ComboboxOption[]
  const options: ComboboxOption[] = React.useMemo(() => {
    return (
      field.options
        ?.filter(
          (option): option is { value: string; label: string } =>
            "value" in option &&
            option.value !== undefined &&
            "label" in option &&
            option.label !== undefined
        )
        .map((option) => ({
          value: option.value,
          label: option.label,
        })) || []
    );
  }, [field.options]);

  const handleSelect = React.useCallback(
    (selectedValue: string | undefined) => {
      // Convert undefined to empty string for form fields (to clear selection)
      onUpdate(selectedValue === undefined ? "" : selectedValue);
    },
    [onUpdate]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Combobox
        options={options}
        value={stringValue}
        onSelect={handleSelect}
        placeholder={field.placeholder || `Selecionar ${field.label}`}
        searchPlaceholder={
          field.placeholder || `Pesquisar ${field.label.toLowerCase()}...`
        }
        buttonClassName={isInvalid ? "border-destructive" : undefined}
        disabled={false}
      />
      {isInvalid && (
        <p id={`${fieldId}-error`} className="text-xs text-destructive mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
