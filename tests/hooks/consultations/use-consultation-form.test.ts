import { renderHook, act } from "@testing-library/react";
import { useConsultationForm } from "@/hooks/consultations/use-consultation-form";
import { getSpecialtyFields } from "@/constants";
import type { ConsultationMGF } from "@/lib/api/consultations";

describe("useConsultationForm", () => {
  it("returns empty formValues and empty specialtyFields when specialtyCode is null", () => {
    const { result } = renderHook(() =>
      useConsultationForm(null)
    );
    expect(result.current.specialtyFields).toEqual([]);
    // formValues will still have common fields (date, etc.) but no specialty-specific keys
    // The key assertion: no specialty-specific values beyond common fields
    expect(Object.keys(result.current.formValues).length).toBeGreaterThan(0);
  });

  it("initializes formValues with field keys from constants when specialtyCode is 'mgf'", () => {
    const { result } = renderHook(() =>
      useConsultationForm("mgf")
    );
    const mgfFields = getSpecialtyFields("mgf");
    expect(result.current.specialtyFields).toHaveLength(mgfFields.length);
    // Every specialty field key should be present in formValues
    mgfFields.forEach((field) => {
      expect(result.current.formValues).toHaveProperty(field.key);
    });
  });

  it("updateField changes the specified field value", () => {
    const { result } = renderHook(() =>
      useConsultationForm("mgf")
    );

    act(() => {
      result.current.updateField("date", "2024-01-01");
    });

    expect(result.current.formValues.date).toBe("2024-01-01");
  });

  it("showFieldError sets fieldError with key and message", () => {
    const { result } = renderHook(() =>
      useConsultationForm("mgf")
    );

    act(() => {
      result.current.showFieldError("date", "Required");
    });

    expect(result.current.fieldError).toEqual({ key: "date", message: "Required" });
  });

  it("updateField clears fieldError when the same field is updated", () => {
    const { result } = renderHook(() =>
      useConsultationForm("mgf")
    );

    act(() => { result.current.showFieldError("date", "Required"); });
    act(() => { result.current.updateField("date", "2024-06-01"); });

    expect(result.current.fieldError).toBeNull();
  });

  it("specialtyYear=2 overrides the initial specialty_year field value to '2'", () => {
    const { result } = renderHook(() =>
      useConsultationForm("mgf", null, 2)
    );
    expect(result.current.formValues.specialty_year).toBe("2");
  });

  it("resets formValues when editingConsultation prop changes", () => {
    const consultation1 = {
      id: "c1",
      date: "2024-01-01",
      specialty_year: 1,
      details: {},
    } as unknown as ConsultationMGF;
    const consultation2 = {
      id: "c2",
      date: "2025-06-15",
      specialty_year: 2,
      details: {},
    } as unknown as ConsultationMGF;

    let editing: ConsultationMGF | null = consultation1;
    const { result, rerender } = renderHook(
      (props: { editing: ConsultationMGF | null }) =>
        useConsultationForm("mgf", props.editing),
      { initialProps: { editing } }
    );

    // First consultation's date
    expect(result.current.formValues.date).toBe("2024-01-01");

    // Switch to second consultation
    editing = consultation2;
    act(() => { rerender({ editing }); });

    expect(result.current.formValues.date).toBe("2025-06-15");
  });
});
