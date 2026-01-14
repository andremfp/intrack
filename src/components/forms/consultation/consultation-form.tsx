import type { SpecialtyField } from "@/constants";
import { TextField } from "./fields/text-field";
import { NumberField } from "./fields/number-field";
import { BooleanField } from "./fields/boolean-field";
import { SelectField } from "./fields/select-field";
import { ComboboxField } from "./fields/combobox-field";
import { TextListField } from "./fields/text-list-field";
import {
  CodeSearchField,
  type CodeSearchItem,
} from "./fields/code-search-field";
import { MultiSelectField } from "./fields/multi-select-field";

interface ConsultationFieldProps {
  field: SpecialtyField;
  value: string | string[];
  errorMessage?: string;
  onUpdate: (value: string | string[]) => void;
  isRequired?: boolean; // Optional override for required status
}

export function ConsultationField({
  field,
  value,
  errorMessage,
  onUpdate,
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
    case "code-search": {
      if (!field.options) {
        return null;
      }

      // Determine selection mode: multiple = true for ICPC2 codes, false/undefined for professions
      const isMultiple = field.multiple ?? false;

      // Convert options to CodeSearchItem format
      const items: CodeSearchItem[] = field.options
        .filter(
          (opt): opt is { code: string; description: string } =>
            "code" in opt && "description" in opt
        )
        .map((opt) => ({
          code: opt.code,
          description: opt.description,
        }));

      if (isMultiple) {
        // ICPC2 codes field - multiple selection
        return (
          <CodeSearchField
            {...commonProps}
            items={items}
            mode="multiple"
            emptyMessage="Nenhum código encontrado"
            codeMinWidth="2.5rem"
            formatValue={(item) => `${item.code} - ${item.description}`}
            parseValue={(value) => {
              const match = value.match(/^([A-Z]\d{2})/);
              return match ? match[1] : value;
            }}
            value={Array.isArray(value) ? value : []}
            onUpdate={(v) => onUpdate(Array.isArray(v) ? v : [])}
          />
        );
      } else {
        // Profession field - single selection
        // Ensure value is a string for single selection
        const stringValue =
          typeof value === "string"
            ? value
            : Array.isArray(value) && value.length > 0
            ? value[0]
            : "";
        return (
          <CodeSearchField
            {...commonProps}
            items={items}
            mode="single"
            emptyMessage="Nenhuma profissão encontrada"
            codeMinWidth="4rem"
            value={stringValue}
            onUpdate={(v) => onUpdate(typeof v === "string" ? v : "")}
          />
        );
      }
    }
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
  className,
  isRequired,
}: ConsultationFieldWithLayoutProps) {
  const requiresFullSpan =
    field.type === "text-list" ||
    [
      "diagnosis",
      "problems",
      "referrence",
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
        isRequired={isRequired}
      />
    </div>
  );
}
