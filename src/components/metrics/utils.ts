import { MGF_FIELDS } from "@/constants";

// Helper to get label from field options
export function getFieldLabel(fieldKey: string, value: string): string {
  const field = MGF_FIELDS.find((f) => f.key === fieldKey);
  if (field && field.options) {
    const option = field.options.find((opt) => opt.value === value);
    if (option) return option.label;
  }
  return value;
}

// Helper to map sex codes to labels
export function getSexLabel(sex: string): string {
  const sexLabels: Record<string, string> = {
    m: "Masculino",
    f: "Feminino",
    other: "Outro",
  };
  return sexLabels[sex] || sex;
}
