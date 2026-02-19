import { renderHook, act } from "@testing-library/react";
import { useConsultationsSorting } from "@/hooks/consultations/use-consultations-sorting";

describe("useConsultationsSorting", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default sorting { field: 'date', order: 'desc' } when nothing is stored", () => {
    const { result } = renderHook(() =>
      useConsultationsSorting({ specialtyYear: undefined })
    );
    expect(result.current.sorting).toEqual({ field: "date", order: "desc" });
  });

  it("uses 'consultations-sorting-default' as key when specialtyYear is undefined", () => {
    renderHook(() => useConsultationsSorting({ specialtyYear: undefined }));
    // The key is derived at render time; after mount the default state is persisted
    expect(localStorage.getItem("consultations-sorting-default")).not.toBeNull();
  });

  it("uses 'consultations-sorting-1' as key when specialtyYear is 1", () => {
    renderHook(() => useConsultationsSorting({ specialtyYear: 1 }));
    expect(localStorage.getItem("consultations-sorting-1")).not.toBeNull();
  });

  it("setSorting updates state and persists to storage", () => {
    const { result } = renderHook(() =>
      useConsultationsSorting({ specialtyYear: 2 })
    );

    act(() => {
      result.current.setSorting({ field: "process_number", order: "asc" });
    });

    expect(result.current.sorting).toEqual({ field: "process_number", order: "asc" });
    const stored = JSON.parse(localStorage.getItem("consultations-sorting-2") ?? "{}");
    expect(stored).toEqual({ field: "process_number", order: "asc" });
  });
});
