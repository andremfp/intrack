import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconX, IconCheck, IconSearch } from "@tabler/icons-react";
import type { SpecialtyField } from "@/constants";
import type { ICPC2Code } from "@/constants";
import { SCROLLBAR_CLASSES } from "@/constants";

interface ICPC2CodesFieldProps {
  field: SpecialtyField;
  value: string[];
  errorMessage?: string;
  onUpdate: (value: string[]) => void;
  icpc2Codes: ICPC2Code[];
  isRequired?: boolean;
}

export function ICPC2CodesField({
  field,
  value,
  errorMessage,
  onUpdate,
  icpc2Codes,
  isRequired,
}: ICPC2CodesFieldProps) {
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  const required = isRequired ?? field.requiredWhen === "always";
  const [searchTerm, setSearchTerm] = useState("");

  const selectedCodeEntries = (Array.isArray(value) ? value : [])
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const selectedCodes = selectedCodeEntries.map((entry) => {
    const match = entry.match(/^([A-Z]\d{2})/);
    return match ? match[1] : entry;
  });

  const filteredCodes = searchTerm
    ? icpc2Codes.filter(
        (icpc2Code) =>
          icpc2Code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          icpc2Code.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const displayedCodes = filteredCodes.slice(0, 10);

  const toggleCode = (code: string, description: string) => {
    const isSelected = selectedCodes.includes(code);
    let newCodeEntries: string[];

    if (isSelected) {
      newCodeEntries = selectedCodeEntries.filter((entry) => {
        const match = entry.match(/^([A-Z]\d{2})/);
        const entryCode = match ? match[1] : entry;
        return entryCode !== code;
      });
    } else {
      newCodeEntries = [...selectedCodeEntries, `${code} - ${description}`];
    }

    onUpdate(newCodeEntries);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {selectedCodeEntries.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-muted/50">
          {selectedCodeEntries.map((entry, idx) => {
            const match = entry.match(/^([A-Z]\d{2})\s*-\s*(.+)$/);
            const code = match ? match[1] : entry;
            const description = match ? match[2] : "";

            return (
              <Button
                key={`${code}-${idx}`}
                type="button"
                variant="secondary"
                size="sm"
                className="h-auto py-1 px-2 text-xs max-w-full"
                onClick={() => {
                  const codeData = icpc2Codes.find((c) => c.code === code);
                  if (codeData) {
                    toggleCode(code, codeData.description);
                  }
                }}
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-mono font-semibold flex-shrink-0">
                    {code}
                  </span>
                  <span className="text-muted-foreground flex-shrink-0">-</span>
                  <span className="max-w-[120px] sm:max-w-[200px] truncate">
                    {description}
                  </span>
                  <IconX className="h-3 w-3 ml-1 flex-shrink-0" />
                </div>
              </Button>
            );
          })}
        </div>
      )}

      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={field.placeholder}
          className="pl-9"
        />
      </div>

      {searchTerm && (
        <div
          className={`border rounded-md max-h-60 overflow-y-auto ${SCROLLBAR_CLASSES}`}
        >
          {displayedCodes.length > 0 ? (
            <div className="divide-y">
              {displayedCodes.map((icpc2Code) => {
                const isSelected = selectedCodes.includes(icpc2Code.code);
                return (
                  <button
                    key={icpc2Code.code}
                    type="button"
                    className={`w-full text-left px-2 sm:px-3 py-2 hover:bg-muted/50 transition-colors ${
                      isSelected ? "bg-primary/10" : ""
                    }`}
                    onClick={() =>
                      toggleCode(icpc2Code.code, icpc2Code.description)
                    }
                  >
                    <div className="flex items-start gap-1.5 sm:gap-2">
                      <code className="font-mono text-xs sm:text-sm font-semibold text-primary min-w-[2.5rem] sm:min-w-[3rem] flex-shrink-0">
                        {icpc2Code.code}
                      </code>
                      <span className="text-xs sm:text-sm flex-1 min-w-0 break-words">
                        {icpc2Code.description}
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
              Nenhum código encontrado
            </div>
          )}
          {filteredCodes.length > 10 && (
            <div className="px-2 sm:px-3 py-2 text-xs text-muted-foreground border-t bg-muted/30 text-center">
              Mostrando 10 de {filteredCodes.length} resultados. Refine a
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
