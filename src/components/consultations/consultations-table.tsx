import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { ConsultationMGF } from "@/lib/api/consultations";
import {
  getSpecialtyFields,
  SPECIALTY_CODES,
  COMMON_CONSULTATION_FIELDS,
} from "@/lib/constants";

interface ConsultationsTableProps {
  consultations: ConsultationMGF[];
  specialtyCode?: string;
  onEdit?: (consultation: ConsultationMGF) => void;
  onDelete?: (id: string) => void;
}

export function ConsultationsTable({
  consultations,
  specialtyCode = SPECIALTY_CODES.MGF,
  onEdit,
  onDelete,
}: ConsultationsTableProps) {
  // Get specialty-specific fields
  const specialtyFields = getSpecialtyFields(specialtyCode);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSexLabel = (sex: string | null) => {
    if (!sex) return "-";
    switch (sex) {
      case "m":
        return "M";
      case "f":
        return "F";
      case "other":
        return "Outro";
      default:
        return sex;
    }
  };

  const renderCommonField = (consultation: ConsultationMGF, key: string) => {
    switch (key) {
      case "date":
        return formatDate(consultation.date);
      case "sex":
        return (
          <Badge variant="outline" className="text-xs">
            {getSexLabel(consultation.sex)}
          </Badge>
        );
      case "age":
        return consultation.age ?? "-";
      case "health_number":
        return consultation.health_number ?? "-";
      default:
        return "-";
    }
  };

  const renderCellValue = (value: unknown, type: string) => {
    if (value === null || value === undefined) return "-";

    switch (type) {
      case "boolean":
        return (
          <Badge variant={value ? "default" : "secondary"} className="text-xs">
            {value ? "Sim" : "Não"}
          </Badge>
        );
      case "text-list": {
        // Display semicolon-separated values as a list
        const items = String(value)
          .split(";")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        if (items.length === 0) return "-";

        return (
          <div className="max-w-[200px] space-y-1">
            {items.map((item, idx) => (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-start gap-1 text-xs cursor-help">
                      <span className="font-semibold text-muted-foreground shrink-0 text-[10px]">
                        {idx + 1}.
                      </span>
                      <span className="line-clamp-1 text-[10px] leading-tight">
                        {item}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[300px]">
                    <p className="text-sm">
                      <span className="font-semibold">{idx + 1}.</span> {item}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        );
      }
      case "icpc2-codes": {
        // Display ICPC-2 codes with descriptions
        // Format: "CODE - Description; CODE - Description"
        const codeEntries = String(value)
          .split(";")
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0);

        if (codeEntries.length === 0) return "-";

        return (
          <div className="max-w-[200px] space-y-1">
            {codeEntries.map((entry, idx) => {
              const match = entry.match(/^([A-Z]\d{2})\s*-\s*(.+)$/);
              if (match) {
                const code = match[1];
                const description = match[2];
                return (
                  <TooltipProvider key={idx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-start gap-1 text-xs cursor-help">
                          <Badge
                            variant="outline"
                            className="font-mono font-semibold shrink-0 text-[10px] px-1 py-0"
                          >
                            {code}
                          </Badge>
                          <span className="text-muted-foreground line-clamp-1 text-[10px] leading-tight">
                            {description}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[300px]">
                        <p className="text-sm">
                          <span className="font-mono font-semibold">
                            {code}
                          </span>
                          <span className="text-muted-foreground"> - </span>
                          <span>{description}</span>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              }
              // Fallback for old format (just code)
              return (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs font-mono"
                >
                  {entry}
                </Badge>
              );
            })}
          </div>
        );
      }
      case "textarea":
      case "text":
        return (
          <span className="max-w-[200px] truncate block">
            {String(value) || "-"}
          </span>
        );
      default:
        return String(value);
    }
  };

  if (consultations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-muted-foreground text-center">
          Ainda não tem consultas registadas.
        </p>
        <p className="text-muted-foreground text-sm text-center mt-2">
          Clique em "Quick Create" para adicionar a sua primeira consulta.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Common fields */}
              {COMMON_CONSULTATION_FIELDS.map((field) => (
                <TableHead key={field.key}>{field.label}</TableHead>
              ))}

              {/* Dynamic specialty-specific fields */}
              {specialtyFields.map((field) => (
                <TableHead key={field.key}>{field.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultations.map((consultation) => (
              <TableRow key={consultation.id}>
                {/* Common fields */}
                {COMMON_CONSULTATION_FIELDS.map((field) => (
                  <TableCell
                    key={field.key}
                    className={field.key === "date" ? "font-medium" : ""}
                  >
                    {renderCommonField(consultation, field.key)}
                  </TableCell>
                ))}

                {/* Dynamic specialty-specific fields */}
                {specialtyFields.map((field) => (
                  <TableCell
                    key={field.key}
                    className={
                      field.type === "icpc2-codes" || field.type === "text-list"
                        ? "max-w-[200px] overflow-hidden"
                        : ""
                    }
                  >
                    {renderCellValue(
                      (consultation as Record<string, unknown>)[field.key],
                      field.type
                    )}
                  </TableCell>
                ))}

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(consultation)}
                      >
                        <IconEdit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    )}
                    {onDelete && consultation.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(consultation.id!)}
                      >
                        <IconTrash className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
