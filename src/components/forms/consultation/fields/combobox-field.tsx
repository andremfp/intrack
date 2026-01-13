import * as React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/utils/utils";
import type { SpecialtyField } from "@/constants";
import { SCROLLBAR_CLASSES } from "@/constants";

interface ComboboxFieldProps {
  field: SpecialtyField;
  value: string | string[];
  errorMessage?: string;
  onUpdate: (value: string | string[]) => void;
  isRequired?: boolean; // Optional override for required status
}

export function ComboboxField({
  field,
  value,
  errorMessage,
  onUpdate,
  isRequired,
}: ComboboxFieldProps) {
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  const stringValue = typeof value === "string" ? value : "";
  const [open, setOpen] = React.useState(false);
  const required =
    isRequired !== undefined ? isRequired : field.requiredWhen === "always";

  const selectedOption = field.options?.find(
    (option) => option.value === stringValue
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !stringValue && "text-muted-foreground"
            )}
            aria-invalid={isInvalid || undefined}
            aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
          >
            {selectedOption?.label ||
              field.placeholder ||
              `Selecionar ${field.label}`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command
            filter={(value, search) => {
              // Find the option that matches the value
              const option = field.options?.find((opt) => opt.value === value);
              if (!option) return 0;

              // Search by label (description) instead of value
              const searchLower = search.toLowerCase();
              const labelLower = option.label.toLowerCase();

              if (labelLower.includes(searchLower)) {
                return 1;
              }
              return 0;
            }}
          >
            <CommandInput
              placeholder={
                field.placeholder || `Pesquisar ${field.label.toLowerCase()}...`
              }
              className="h-9"
            />
            <CommandList className={SCROLLBAR_CLASSES}>
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup>
                {field.options?.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onUpdate(
                        currentValue === stringValue ? "" : currentValue
                      );
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        stringValue === option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {isInvalid && (
        <p id={`${fieldId}-error`} className="text-xs text-destructive mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
