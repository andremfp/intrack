import { TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type { SpecialtyField } from "@/constants";

interface TableHeaderProps {
  commonFields: SpecialtyField[];
  specialtyFields: SpecialtyField[];
  isDeleteMode: boolean;
  isAllSelected: boolean;
  hasItems: boolean;
  onToggleSelectAll: () => void;
}

export function TableHeader({
  commonFields,
  specialtyFields,
  isDeleteMode,
  isAllSelected,
  hasItems,
  onToggleSelectAll,
}: TableHeaderProps) {
  return (
    <thead className="sticky top-0 bg-background z-10 border-b">
      <tr className="border-b hover:bg-transparent">
        {/* Star / bookmark column */}
        <TableHead className="w-10 bg-background" />

        {/* Checkbox column for delete mode */}
        {isDeleteMode && (
          <TableHead className="w-12 bg-background">
            <Checkbox
              checked={isAllSelected && hasItems}
              onCheckedChange={onToggleSelectAll}
              aria-label="Selecionar todas"
            />
          </TableHead>
        )}

        {/* Common fields */}
        {commonFields
          .filter((field) => field.key !== "age_unit")
          .map((field) => (
            <TableHead key={field.key} className="bg-background">
              {field.label}
            </TableHead>
          ))}

        {/* Dynamic specialty-specific fields */}
        {specialtyFields.map((field) => (
          <TableHead key={field.key} className="bg-background">
            {field.label}
          </TableHead>
        ))}
      </tr>
    </thead>
  );
}
