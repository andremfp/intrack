import type { SpecialtyField } from "@/constants";
import { BooleanCell } from "./boolean-cell";
import { SelectCell } from "./select-cell";
import { TextListCell } from "./text-list-cell";
import { CodeSearchCell } from "./code-search-cell";
import { TextCell } from "./text-cell";

interface SpecialtyFieldCellProps {
  value: unknown;
  field: SpecialtyField;
}

export function SpecialtyFieldCell({ value, field }: SpecialtyFieldCellProps) {
  if (value === null || value === undefined) {
    return <span>-</span>;
  }

  switch (field.type) {
    case "boolean":
      return <BooleanCell value={value as boolean} />;
    case "select":
    case "combobox":
      // Convert SpecialtyFieldOption[] to { value: string; label: string }[]
      const selectOptions = field.options
        ?.map((opt) => {
          if ("value" in opt && opt.value) {
            return { value: opt.value, label: opt.label };
          }
          if ("code" in opt && opt.code) {
            return { value: opt.code, label: opt.description };
          }
          return { value: "", label: "" };
        })
        .filter((opt) => opt.value !== "") as
        | { value: string; label: string }[]
        | undefined;
      return <SelectCell value={String(value)} options={selectOptions} />;
    case "text-list":
      return <TextListCell value={value} />;
    case "code-search":
      return <CodeSearchCell value={value} field={field} />;
    case "text":
      return <TextCell value={String(value)} />;
    default:
      return <span>{String(value)}</span>;
  }
}
