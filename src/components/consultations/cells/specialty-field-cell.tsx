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
      return <SelectCell value={String(value)} options={field.options} />;
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
