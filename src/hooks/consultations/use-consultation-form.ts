import { useState, useMemo } from "react";
import type { ConsultationMGF } from "@/lib/api/consultations";
import { getSpecialtyFields, type SpecialtyField } from "@/constants";
import { resolveTypeSections } from "@/components/forms/consultation/helpers";
import type { FormValues, FieldError } from "./types";
import { initializeFormValues } from "./helpers";



/**
 * Hook for managing consultation form state and field organization.
 * 
 * Handles:
 * - Initializing form values from database (or defaults for new consultation)
 * - Organizing fields into groups for UI rendering
 * - Managing field updates and validation errors
 * - Dynamically showing/hiding type-specific sections
 * 
 * @param specialtyCode - Code of the specialty (e.g., "mgf") or null
 * @param editingConsultation - Existing consultation from database (null for new consultation)
 */
export function useConsultationForm(
  specialtyCode: string | null,
  editingConsultation?: ConsultationMGF | null
) {
  // Get all specialty-specific field definitions
  const specialtyFields = useMemo(
    () => (specialtyCode ? getSpecialtyFields(specialtyCode) : []),
    [specialtyCode]
  );

  // Initialize form values from database (or use defaults for new consultation)
  const initialFormValues = useMemo(
    () => initializeFormValues(specialtyFields, editingConsultation),
    [specialtyFields, editingConsultation]
  );

  // Form state: current values and validation errors
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [fieldError, setFieldError] = useState<FieldError | null>(null);

  /**
   * Updates a single field value and clears any error for that field.
   */
  const updateField = (key: string, value: string | string[]) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    // Clear error if this field had one
    if (fieldError?.key === key) {
      setFieldError(null);
    }
  };

  /**
   * Sets a validation error for a field and scrolls to it.
   */
  const showFieldError = (key: string, message: string) => {
    setFieldError({ key, message });
    // Scroll to the field after React renders
    requestAnimationFrame(() => {
      const fieldElement = document.getElementById(key);
      if (fieldElement instanceof HTMLElement) {
        fieldElement.focus();
        fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  };

  // Get the currently selected consultation type (e.g., "DM", "SA", "SIJ")
  const selectedConsultationType =
    typeof formValues.type === "string" ? formValues.type : undefined;

  // Get sections that should be shown for the selected type
  // Example: If type is "DM", returns [{ key: "exams", fields: [...] }]
  const sectionsForSelectedType = useMemo(
    () => resolveTypeSections(selectedConsultationType),
    [selectedConsultationType]
  );

  // Organize specialty fields into sections for UI rendering
  const fieldsBySection = useMemo(() => {
    const sections: Record<string, SpecialtyField[]> = {};
    
    specialtyFields.forEach((field) => {
      const sectionKey = field.section || "other";
      if (!sections[sectionKey]) {
        sections[sectionKey] = [];
      }
      sections[sectionKey].push(field);
    });
    
    return sections;
  }, [specialtyFields]);

  // Get section order (maintain logical order)
  const sectionOrder = useMemo(() => {
    const order = [
      "consultation_info",
      "type_specific", // Type-specific sections appear right after consultation_info
      "clinical_history",
      "diagnosis",
      "referral",
      "family_planning",
      "procedures",
    ];
    
    // Get all section keys from fields, maintaining order
    const allSections = new Set<string>();
    specialtyFields.forEach((field) => {
      if (field.section) {
        allSections.add(field.section);
      }
    });
    
    // Add type_specific if there are type-specific sections
    if (sectionsForSelectedType.length > 0) {
      allSections.add("type_specific");
    }
    
    // Return ordered sections, then any others
    const ordered = order.filter((s) => allSections.has(s));
    const others = Array.from(allSections).filter((s) => !order.includes(s));
    
    return [...ordered, ...others];
  }, [specialtyFields, sectionsForSelectedType]);

  // Organize type-specific sections by their section property
  const typeSpecificSectionsBySection = useMemo(() => {
    const sections: Record<string, typeof sectionsForSelectedType> = {};
    
    sectionsForSelectedType.forEach((section) => {
      const sectionKey = section.section || "type_specific";
      if (!sections[sectionKey]) {
        sections[sectionKey] = [];
      }
      sections[sectionKey].push(section);
    });
    
    return sections;
  }, [sectionsForSelectedType]);

  return {
    formValues,
    fieldError,
    updateField,
    showFieldError,
    setFieldError,
    sectionsForSelectedType,
    fieldsBySection,
    sectionOrder,
    typeSpecificSectionsBySection,
    specialtyFields,
  };
}
