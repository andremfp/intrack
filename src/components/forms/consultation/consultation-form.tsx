import type { SpecialtyField } from "@/constants";
import { TextField } from "./fields/text-field";
import { NumberField } from "./fields/number-field";
import { BooleanField } from "./fields/boolean-field";
import { SelectField } from "./fields/select-field";
import { ComboboxField } from "./fields/combobox-field";
import { TextListField } from "./fields/text-list-field";
import { ICPC2CodesField } from "./fields/icpc2-codes-field";
import type { ICPC2Code } from "@/constants";
import { MultiSelectField } from "./fields/multi-select-field";

interface ConsultationFieldProps {
  field: SpecialtyField;
  value: string | string[];
  errorMessage?: string;
  onUpdate: (value: string | string[]) => void;
  icpc2Codes?: ICPC2Code[];
  isRequired?: boolean; // Optional override for required status
}

export function ConsultationField({
  field,
  value,
  errorMessage,
  onUpdate,
  icpc2Codes = [],
  isRequired,
}: ConsultationFieldProps) {
  const commonProps = {
    field,
    value,
    errorMessage,
    onUpdate,
    isRequired,
  };

  switch (field.type) {
    case "text":
      return <TextField {...commonProps} />;
    case "number":
      return <NumberField {...commonProps} />;
    case "boolean":
      return <BooleanField {...commonProps} />;
    case "select":
      return <SelectField {...commonProps} />;
    case "combobox":
      return <ComboboxField {...commonProps} />;
    case "text-list":
      return <TextListField {...commonProps} />;
    case "icpc2-codes":
      return (
        <ICPC2CodesField
          {...commonProps}
          icpc2Codes={icpc2Codes}
          value={Array.isArray(value) ? value : []}
          onUpdate={(v) => onUpdate(v)}
        />
      );
    case "multi-select":
      return (
        <MultiSelectField
          {...commonProps}
          value={Array.isArray(value) ? value : []}
          onUpdate={(v) => onUpdate(v)}
        />
      );
    default:
      return null;
  }
}

interface ConsultationFieldWithLayoutProps extends ConsultationFieldProps {
  className?: string;
}

export function ConsultationFieldWithLayout({
  field,
  value,
  errorMessage,
  onUpdate,
  icpc2Codes,
  className,
  isRequired,
}: ConsultationFieldWithLayoutProps) {
  const requiresFullSpan =
    field.type === "text-list" ||
    [
      "diagnosis",
      "problems",
      "referrence_motive",
      "new_diagnosis",
      "notes",
    ].includes(field.key);

  const wrapperClassName = [
    className,
    "min-w-0",
    requiresFullSpan && "col-span-full sm:col-span-2",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClassName || undefined}>
      <ConsultationField
        field={field}
        value={value}
        errorMessage={errorMessage}
        onUpdate={onUpdate}
        icpc2Codes={icpc2Codes}
        isRequired={isRequired}
      />
    </div>
  );
}
