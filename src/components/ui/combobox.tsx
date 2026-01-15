"use client";

import * as React from "react";
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
import { SCROLLBAR_CLASSES } from "@/constants";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onSelect: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  // Optional "all" option
  showAllOption?: boolean;
  allOptionLabel?: string;
  allOptionValue?: string; // Special value for "all" option (default: "__all__")
}

export function Combobox({
  options,
  value,
  onSelect,
  placeholder,
  searchPlaceholder,
  emptyMessage = "Nenhum resultado encontrado.",
  className,
  buttonClassName,
  disabled = false,
  showAllOption = false,
  allOptionLabel = "Todos",
  allOptionValue = "__all__",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const currentValue = value || "";

  const selectedOption = options.find((opt) => opt.value === currentValue);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !currentValue && "text-muted-foreground",
            buttonClassName
          )}
        >
          {selectedOption?.label || placeholder || allOptionLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[var(--radix-popover-trigger-width)] p-0", className)}
        align="start"
      >
        <Command
          filter={(itemValue, search) => {
            // Always show "all" option if enabled
            if (showAllOption && itemValue === allOptionValue) return 1;

            const option = options.find((opt) => opt.value === itemValue);
            if (!option) return 0;

            const searchLower = search.toLowerCase();
            const labelLower = option.label.toLowerCase();

            return labelLower.includes(searchLower) ? 1 : 0;
          }}
        >
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-9"
          />
          <CommandList className={SCROLLBAR_CLASSES}>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {showAllOption && (
                <CommandItem
                  value={allOptionValue}
                  onSelect={() => {
                    onSelect(undefined);
                    setOpen(false);
                  }}
                >
                  {allOptionLabel}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      !currentValue ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              )}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(selectedValue) => {
                    onSelect(
                      selectedValue === currentValue ? undefined : selectedValue
                    );
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentValue === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}