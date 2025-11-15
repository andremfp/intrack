import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { SpecialtyField } from "@/constants";

interface TextListFieldProps {
  field: SpecialtyField;
  value: string | string[];
  errorMessage?: string;
  onUpdate: (value: string | string[]) => void;
}

export function TextListField({
  field,
  value,
  errorMessage,
  onUpdate,
}: TextListFieldProps) {
  const fieldId = field.key;
  const isInvalid = Boolean(errorMessage);
  const listValue = (value || [""]) as string[];

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="space-y-2">
        {listValue.map((item, index) => (
          <div key={index} className="flex gap-1.5 sm:gap-2">
            <Input
              value={item}
              onChange={(e) => {
                const newList = [...listValue];
                newList[index] = e.target.value;
                onUpdate(newList);
              }}
              placeholder={field.placeholder}
              className="min-w-0"
            />
            {listValue.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newList = listValue.filter((_, i) => i !== index);
                  onUpdate(newList);
                }}
                className="flex-shrink-0"
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onUpdate([...listValue, ""])}
          className="w-full"
        >
          <IconPlus className="h-4 w-4 mr-2" />
          <span className="hidden xs:inline">Adicionar {field.label}</span>
          <span className="inline xs:hidden">Adicionar</span>
        </Button>
      </div>
      {isInvalid && (
        <p id={`${fieldId}-error`} className="text-xs text-destructive mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
