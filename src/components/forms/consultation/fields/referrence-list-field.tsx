import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  IconX,
  IconSearch,
  IconPlus,
  IconPencil,
  IconCheck,
} from "@tabler/icons-react";
import type { SpecialtyField, ReferrenceEntry } from "@/constants";
import { SCROLLBAR_CLASSES } from "@/constants";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import type { CodeSearchItem } from "./code-search-field";

interface ReferrenceListFieldProps {
  field: SpecialtyField;
  value: ReferrenceEntry[];
  onUpdate: (value: ReferrenceEntry[]) => void;
  /** ICPC-2 code items used for the optional motive search */
  icpcItems: CodeSearchItem[];
  errorMessage?: string;
  isRequired?: boolean;
}

export function ReferrenceListField({
  field,
  value,
  onUpdate,
  icpcItems,
  errorMessage,
  isRequired,
}: ReferrenceListFieldProps) {
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  const required =
    isRequired !== undefined ? isRequired : field.requiredWhen === "always";

  const [pendingSpecialty, setPendingSpecialty] = useState("");
  // ICPC-2 codes assembled for the pending entry before confirming
  const [pendingCodes, setPendingCodes] = useState<string[]>([]);
  const [motiveSearchTerm, setMotiveSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  // Specialty keys already in confirmed entries — excluded from the combobox
  const selectedKeys = value.map((entry) => Object.keys(entry)[0]);

  // Build specialty combobox options, filtering out already-selected specialties
  const specialtyOptions: ComboboxOption[] = (
    field.options?.filter(
      (opt): opt is { value: string; label: string } =>
        "value" in opt &&
        typeof opt.value === "string" &&
        !selectedKeys.includes(opt.value),
    ) ?? []
  ).map((opt) => ({ value: opt.value, label: opt.label }));

  // Label lookup for displaying specialty names in the entry list
  const specialtyLabelMap = Object.fromEntries(
    (field.options ?? [])
      .filter((opt): opt is { value: string; label: string } => "value" in opt)
      .map((opt) => [opt.value, opt.label]),
  );

  // Filter ICPC-2 items by the current search term
  const filteredIcpcItems = motiveSearchTerm
    ? icpcItems.filter(
        (item) =>
          item.code.toLowerCase().includes(motiveSearchTerm.toLowerCase()) ||
          item.description
            .toLowerCase()
            .includes(motiveSearchTerm.toLowerCase()),
      )
    : [];
  const displayedIcpcItems = filteredIcpcItems.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(10);
  }, [motiveSearchTerm]);

  // Remove an entire confirmed referrence entry
  const handleRemoveEntry = (key: string) => {
    onUpdate(value.filter((entry) => Object.keys(entry)[0] !== key));
  };

  // Remove a single ICPC-2 code from a confirmed entry
  const handleRemoveCodeFromEntry = (entryKey: string, code: string) => {
    onUpdate(
      value.map((entry) => {
        const [key, codes] = Object.entries(entry)[0] as [string, string[]];
        if (key !== entryKey) return entry;
        return { [key]: codes.filter((c) => c !== code) } as ReferrenceEntry;
      }),
    );
  };

  // Toggle a code in the pending list — selecting adds it, selecting again removes it
  const handleSelectMotive = (item: CodeSearchItem) => {
    const code = `${item.code} - ${item.description}`;
    setPendingCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  // Load a confirmed entry back into the pending form for editing
  const handleEditEntry = (key: string) => {
    const entry = value.find((e) => Object.keys(e)[0] === key);
    if (!entry) return;
    const [specialty, codes] = Object.entries(entry)[0] as [string, string[]];
    onUpdate(value.filter((e) => Object.keys(e)[0] !== key));
    setPendingSpecialty(specialty);
    setPendingCodes(codes);
    setMotiveSearchTerm("");
  };

  const handleRemovePendingCode = (code: string) => {
    setPendingCodes((prev) => prev.filter((c) => c !== code));
  };

  const handleConfirm = () => {
    if (!pendingSpecialty) return;
    onUpdate([...value, { [pendingSpecialty]: pendingCodes }]);
    setPendingSpecialty("");
    setPendingCodes([]);
    setMotiveSearchTerm("");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Confirmed referrence entries */}
      {value.length > 0 && (
        <div className="space-y-1.5">
          {value.map((entry) => {
            const [key, codes] = Object.entries(entry)[0] as [string, string[]];
            const label = specialtyLabelMap[key] ?? key;
            return (
              <div
                key={key}
                className="flex items-start justify-between gap-2 p-2 border rounded-md bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium">{label}</span>
                  {codes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {codes.map((code) => (
                        <Badge
                          key={code}
                          variant="secondary"
                          className="text-xs gap-1 pr-1 font-normal"
                        >
                          {code}
                          <button
                            type="button"
                            onClick={() => handleRemoveCodeFromEntry(key, code)}
                            className="ml-0.5 opacity-60 hover:opacity-100"
                          >
                            <IconX className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {/* Edit entry (loads back into pending form) and remove buttons */}
                <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                  <button
                    type="button"
                    onClick={() => handleEditEntry(key)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <IconPencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveEntry(key)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <IconX className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Specialty picker — always visible, excludes already-selected specialties */}
      <Combobox
        options={specialtyOptions}
        value={pendingSpecialty}
        onSelect={(v) => setPendingSpecialty(v ?? "")}
        placeholder="Selecionar especialidade"
        searchPlaceholder="Pesquisar especialidade..."
        disabled={specialtyOptions.length === 0}
      />

      {/* Pending ICPC-2 code chips — assembled before confirming */}
      {pendingCodes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {pendingCodes.map((code) => (
            <Badge
              key={code}
              variant="secondary"
              className="text-xs gap-1 pr-1 font-normal"
            >
              {code}
              <button
                type="button"
                onClick={() => handleRemovePendingCode(code)}
                className="ml-0.5 opacity-60 hover:opacity-100"
              >
                <IconX className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* ICPC-2 motive search (optional) */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={motiveSearchTerm}
          onChange={(e) => setMotiveSearchTerm(e.target.value)}
          placeholder="Pesquisar motivo ICPC-2 (opcional)..."
          className="pl-9"
        />
      </div>

      {/* ICPC-2 search results */}
      {motiveSearchTerm && (
        <div
          className={`border rounded-md max-h-48 overflow-y-auto ${SCROLLBAR_CLASSES}`}
        >
          {displayedIcpcItems.length > 0 ? (
            <div className="divide-y">
              {displayedIcpcItems.map((item) => {
                const code = `${item.code} - ${item.description}`;
                const isSelected = pendingCodes.includes(code);
                return (
                  <button
                    key={item.code}
                    type="button"
                    className={`w-full text-left px-2 sm:px-3 py-2 transition-colors ${isSelected ? "bg-muted" : "hover:bg-muted/50"}`}
                    onClick={() => handleSelectMotive(item)}
                  >
                    <div className="flex items-start gap-1.5 sm:gap-2">
                      <code className="font-mono text-xs sm:text-sm font-semibold text-primary flex-shrink-0 min-w-[2.5rem]">
                        {item.code}
                      </code>
                      <span className="text-xs sm:text-sm flex-1 min-w-0 break-words">
                        {item.description}
                      </span>
                      {isSelected && (
                        <IconCheck className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-2 sm:px-3 py-4 text-xs sm:text-sm text-muted-foreground text-center">
              Nenhum resultado encontrado
            </div>
          )}
          {filteredIcpcItems.length > 10 && (
            <div className="px-2 sm:px-3 py-2 text-xs text-muted-foreground border-t bg-muted/30 text-center space-y-2">
              <div>
                Mostrando {displayedIcpcItems.length} de{" "}
                {filteredIcpcItems.length} resultados.
              </div>
              {displayedIcpcItems.length < filteredIcpcItems.length && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setVisibleCount((prev) => prev + 10)}
                >
                  Carregar mais
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!pendingSpecialty}
        onClick={handleConfirm}
        className="w-full"
      >
        <IconPlus className="h-4 w-4 mr-1" />
        Adicionar
      </Button>

      {isInvalid && (
        <p id={`${fieldId}-error`} className="text-xs text-destructive mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
