import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconSortAscending, IconSortDescending } from "@tabler/icons-react";

/**
 * UI component for consultation sorting controls.
 * Note: This is different from consultations-sorting.ts which contains sorting utility functions.
 */

// Sorting configuration
export interface SortingConfig {
  field: string;
  order: "asc" | "desc";
  fieldLabels: Record<string, string>;
  onSortingChange: (sorting: SortingConfig) => void;
}

interface ConsultationSortingProps {
  sorting: SortingConfig;
  isLoading?: boolean;
}

export function ConsultationSorting({
  sorting,
  isLoading = false,
}: ConsultationSortingProps) {
  // Get sorting label for display
  const getSortingLabel = () => {
    const { field, order, fieldLabels } = sorting;
    const orderLabel = order === "asc" ? "↑" : "↓";
    return `${fieldLabels[field] || field} ${orderLabel}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          {sorting.order === "asc" ? (
            <IconSortAscending className="h-4 w-4" />
          ) : (
            <IconSortDescending className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{getSortingLabel()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Ordenação</h4>

          {/* Sort field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Ordenar por
            </label>
            <Select
              value={sorting.field}
              onValueChange={(value) =>
                sorting.onSortingChange({
                  ...sorting,
                  field: value,
                })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sorting.fieldLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort order */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Ordem
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={sorting.order === "asc" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  sorting.onSortingChange({
                    ...sorting,
                    order: "asc",
                  })
                }
                className="h-8 gap-1.5 px-2"
              >
                <IconSortAscending className="h-4 w-4" />
                <span className="text-xs">Crescente</span>
              </Button>
              <Button
                variant={sorting.order === "desc" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  sorting.onSortingChange({
                    ...sorting,
                    order: "desc",
                  })
                }
                className="h-8 gap-1.5 px-2"
              >
                <IconSortDescending className="h-4 w-4" />
                <span className="text-xs">Decrescente</span>
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
