import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConsultationMGF } from "@/lib/api/consultations";
import { COMMON_CONSULTATION_FIELDS } from "@/constants";

interface CommonFieldCellProps {
  consultation: ConsultationMGF;
  fieldKey: string;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getCommonSelectLabels = (
  key: string,
  value: string | null | undefined
): { displayLabel: string; fullLabel: string } | null => {
  if (!value) return null;

  const field = COMMON_CONSULTATION_FIELDS.find((f) => f.key === key);
  const option = field?.options?.find((opt) => opt.value === value);
  const fullLabel = option?.label ?? value;

  if (key === "sex") {
    // Keep existing behaviour: single-letter badge except for "Outro"
    const displayLabel = fullLabel.charAt(0).toUpperCase();
    return { displayLabel, fullLabel };
  }

  // Default: display and full labels are the same
  return { displayLabel: fullLabel, fullLabel };
};

export function CommonFieldCell({
  consultation,
  fieldKey,
}: CommonFieldCellProps): React.ReactElement | null {
  switch (fieldKey) {
    case "date":
      return <span>{formatDate(consultation.date)}</span>;
    case "sex": {
      const labels = getCommonSelectLabels("sex", consultation.sex);
      const displayLabel = labels?.displayLabel ?? "-";
      const fullLabel = labels?.fullLabel ?? displayLabel;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs cursor-help">
                {displayLabel}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-sm">{fullLabel}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    case "age": {
      if (consultation.age === null) return <span>-</span>;

      const ageUnitLabels = getCommonSelectLabels(
        "age_unit",
        consultation.age_unit
      );
      const displayText = `${consultation.age} ${
        ageUnitLabels?.displayLabel.charAt(0).toUpperCase() ?? ""
      }`;
      const fullLabel = ageUnitLabels?.fullLabel
        ? `${consultation.age} ${ageUnitLabels.fullLabel}`
        : displayText;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">{displayText}</span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-sm">{fullLabel}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    case "age_unit":
      // Don't display age_unit separately since it's included in age
      return null;
    case "process_number":
      return <span>{consultation.process_number ?? "-"}</span>;
    case "location":
      return (
        <span>
          {getCommonSelectLabels("location", consultation.location)
            ?.displayLabel ?? "-"}
        </span>
      );
    case "autonomy":
      return (
        <span>
          {getCommonSelectLabels("autonomy", consultation.autonomy)
            ?.displayLabel ?? "-"}
        </span>
      );
    default:
      return <span>-</span>;
  }
}
