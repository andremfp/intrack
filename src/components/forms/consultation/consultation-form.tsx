import type { SpecialtyField } from "@/constants";
import { TextField } from "./fields/text-field";
import { NumberField } from "./fields/number-field";
import { TextareaField } from "./fields/textarea-field";
import { BooleanField } from "./fields/boolean-field";
import { SelectField } from "./fields/select-field";
import { TextListField } from "./fields/text-list-field";
import { ICPC2CodesField } from "./fields/icpc2-codes-field";
import type { ICPC2Code } from "@/constants";

interface ConsultationFieldProps {
  field: SpecialtyField;
  value: string | string[];
  errorMessage?: string;
  onUpdate: (value: string | string[]) => void;
  icpc2Codes?: ICPC2Code[];
}

export function ConsultationField({
  field,
  value,
  errorMessage,
  onUpdate,
  icpc2Codes = [],
}: ConsultationFieldProps) {
  const commonProps = {
    field,
    value,
    errorMessage,
    onUpdate,
  };

  switch (field.type) {
    case "text":
      return <TextField {...commonProps} />;
    case "number":
      return <NumberField {...commonProps} />;
    case "textarea":
      return <TextareaField {...commonProps} />;
    case "boolean":
      return <BooleanField {...commonProps} />;
    case "select":
      return <SelectField {...commonProps} />;
    case "text-list":
      return <TextListField {...commonProps} />;
    case "icpc2-codes":
      return <ICPC2CodesField {...commonProps} icpc2Codes={icpc2Codes} />;
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
}: ConsultationFieldWithLayoutProps) {
  const requiresFullSpan =
    field.type === "textarea" ||
    field.type === "text-list" ||
    ["diagnosis", "problems", "new_diagnosis", "notes"].includes(field.key);

  const wrapperClassName = [className, requiresFullSpan && "sm:col-span-2"]
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
      />
    </div>
  );
}
