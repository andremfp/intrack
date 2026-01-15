import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconX, IconCheck, IconSearch } from "@tabler/icons-react";
import type { SpecialtyField } from "@/constants";
import { SCROLLBAR_CLASSES } from "@/constants";

export interface CodeSearchItem {
  code: string;
  description: string;
}

interface CodeSearchFieldProps<T extends CodeSearchItem> {
  field: SpecialtyField;
  value: string | string[];
  errorMessage?: string;
  onUpdate: (value: string | string[]) => void;
  items: T[];
  isRequired?: boolean;
  mode?: "single" | "multiple";
  emptyMessage?: string;
  formatValue?: (item: T) => string;
  parseValue?: (value: string) => string;
  getItemByCode?: (code: string, items: T[]) => T | undefined;
  codeMinWidth?: string; // Custom min-width for code column (e.g., "2.5rem" or "4rem")
}

export function CodeSearchField<T extends CodeSearchItem>({
  field,
  value,
  errorMessage,
  onUpdate,
  items,
  isRequired,
  mode = "single",
  emptyMessage = "Nenhum resultado encontrado",
  formatValue,
  parseValue,
  getItemByCode,
  codeMinWidth = "4rem", // Default to larger width for profession codes
}: CodeSearchFieldProps<T>) {
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  const required = isRequired ?? field.requiredWhen === "always";
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Default implementations
  const defaultFormatValue = (item: T) => `${item.code} - ${item.description}`;
  const defaultParseValue = (value: string) => {
    const match = value.match(/^([A-Z]\d{2})/);
    return match ? match[1] : value;
  };
  const defaultGetItemByCode = (code: string, items: T[]) =>
    items.find((item) => item.code === code);

  const format = formatValue || defaultFormatValue;
  const parse = parseValue || defaultParseValue;
  const getItem = getItemByCode || defaultGetItemByCode;

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const targetNode = event.target as Node | null;
      if (!targetNode) return;

      if (!container.contains(targetNode)) {
        setSearchTerm("");
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);

  // Handle single vs multiple mode
  const isMultiple = mode === "multiple";
  const stringValue = typeof value === "string" ? value : "";
  const arrayValue = Array.isArray(value) ? value : [];

  // Get selected items
  const selectedItems: T[] = isMultiple
    ? arrayValue
        .map((v) => {
          const code = parse(v);
          return getItem(code, items);
        })
        .filter((item): item is T => item !== undefined)
    : stringValue
    ? (() => {
        const code = parse(stringValue);
        const item = getItem(code, items);
        return item ? [item] : [];
      })()
    : [];

  // Get selected codes for checking
  const selectedCodes = isMultiple
    ? arrayValue.map((v) => parse(v))
    : stringValue
    ? [parse(stringValue)]
    : [];

  // Filter items based on search
  const filteredItems = searchTerm
    ? items.filter(
        (item) =>
          item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const displayedItems = filteredItems.slice(0, 10);

  // Handle selection
  const handleSelect = (item: T) => {
    if (isMultiple) {
      const code = item.code;
      const isSelected = selectedCodes.includes(code ?? "");
      let newValues: string[];

      if (isSelected) {
        newValues = arrayValue.filter((v) => parse(v) !== code);
      } else {
        newValues = [...arrayValue, format(item)];
      }

      onUpdate(newValues);
    } else {
      if (stringValue === (item.code ?? "")) {
        onUpdate("");
      } else {
        onUpdate(item.code ?? "");
      }
    }
    setSearchTerm("");
  };

  // Handle clear for single mode
  const handleClear = () => {
    onUpdate("");
    setSearchTerm("");
  };

  // Handle remove for multiple mode
  const handleRemove = (item: T) => {
    if (isMultiple) {
      const code = item.code;
      const newValues = arrayValue.filter((v) => parse(v) !== code);
      onUpdate(newValues);
    }
  };

  return (
    <div ref={containerRef} className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Selected items display */}
      {selectedItems.length > 0 && (
        <div
          className={`flex ${
            isMultiple ? "flex-wrap gap-1.5" : "items-center gap-1.5"
          } p-2 border rounded-md bg-muted/50 min-w-0`}
        >
          {selectedItems.map((item, idx) => {
            if (isMultiple) {
              return (
                <Button
                  key={`${item.code}-${idx}`}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs max-w-full"
                  onClick={() => handleRemove(item)}
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="font-mono font-semibold flex-shrink-0">
                      {item.code}
                    </span>
                    <span className="text-muted-foreground flex-shrink-0">
                      -
                    </span>
                    <span className="max-w-[120px] sm:max-w-[200px] truncate">
                      {item.description}
                    </span>
                    <IconX className="h-3 w-3 ml-1 flex-shrink-0" />
                  </div>
                </Button>
              );
            } else {
              return (
                <Button
                  key={item.code}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs flex-1 justify-start min-w-0"
                  onClick={handleClear}
                >
                  <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
                    <span className="font-mono font-semibold flex-shrink-0">
                      {item.code}
                    </span>
                    <span className="text-muted-foreground flex-shrink-0">
                      -
                    </span>
                    <span className="flex-1 truncate text-left min-w-0">
                      {item.description}
                    </span>
                    <IconX className="h-3 w-3 ml-1 flex-shrink-0" />
                  </div>
                </Button>
              );
            }
          })}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            field.placeholder || `Pesquisar ${field.label.toLowerCase()}...`
          }
          className="pl-9"
        />
      </div>

      {/* Search results */}
      {searchTerm && (
        <div
          className={`border rounded-md max-h-60 overflow-y-auto ${SCROLLBAR_CLASSES}`}
        >
          {displayedItems.length > 0 ? (
            <div className="divide-y">
              {displayedItems.map((item) => {
                const isSelected = selectedCodes.includes(item.code ?? "");
                return (
                  <button
                    key={item.code}
                    type="button"
                    className={`w-full text-left px-2 sm:px-3 py-2 hover:bg-muted/50 transition-colors ${
                      isSelected ? "bg-primary/10" : ""
                    }`}
                    onClick={() => handleSelect(item)}
                  >
                    <div className="flex items-start gap-1.5 sm:gap-2">
                      <code
                        className="font-mono text-xs sm:text-sm font-semibold text-primary flex-shrink-0"
                        style={{ minWidth: codeMinWidth }}
                      >
                        {item.code}
                      </code>
                      <span className="text-xs sm:text-sm flex-1 min-w-0 break-words">
                        {item.description}
                      </span>
                      {isSelected && (
                        <IconCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-2 sm:px-3 py-4 text-xs sm:text-sm text-muted-foreground text-center">
              {emptyMessage}
            </div>
          )}
          {filteredItems.length > 10 && (
            <div className="px-2 sm:px-3 py-2 text-xs text-muted-foreground border-t bg-muted/30 text-center">
              Mostrando 10 de {filteredItems.length} resultados. Refine a
              pesquisa.
            </div>
          )}
        </div>
      )}
      {isInvalid && (
        <p id={`${fieldId}-error`} className="text-xs text-destructive mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
