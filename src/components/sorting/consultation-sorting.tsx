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
import type { ConsultationSortingProps } from "./types";

/**
 * UI component for consultation sorting controls.
 * Note: This is different from consultations-sorting.ts which contains sorting utility functions.
 */

export function ConsultationSorting({
  sortingConfig,
  isLoading = false,
}: ConsultationSortingProps) {
  // Get sorting label for display
  const getSortingLabel = () => {
    const { field, order, fieldLabels } = sortingConfig;
    const orderLabel = order === "asc" ? "↑" : "↓";
    return `${fieldLabels[field] || field} ${orderLabel}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          {sortingConfig.order === "asc" ? (
            <IconSortAscending className="h-4 w-4" />
          ) : (
            <IconSortDescending className="h-4 w-4" />
          )}
          <span className="hidden lg:inline">{getSortingLabel()}</span>
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
              value={sortingConfig.field}
              onValueChange={(value) =>
                sortingConfig.onSortingChange({
                  ...sortingConfig,
                  field: value,
                })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sortingConfig.fieldLabels).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
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
                variant={sortingConfig.order === "asc" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  sortingConfig.onSortingChange({
                    ...sortingConfig,
                    order: "asc",
                  })
                }
                className="h-8 gap-1.5 px-2"
              >
                <IconSortAscending className="h-4 w-4" />
                <span className="text-xs">Crescente</span>
              </Button>
              <Button
                variant={sortingConfig.order === "desc" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  sortingConfig.onSortingChange({
                    ...sortingConfig,
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
