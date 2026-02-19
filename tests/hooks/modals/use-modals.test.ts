import { renderHook, act } from "@testing-library/react";
import { useModals } from "@/hooks/modals/use-modals";
import type { ConsultationMGF } from "@/lib/api/consultations";

const stubConsultation = { id: "c1" } as ConsultationMGF;

describe("useModals", () => {
  it("all show* booleans are false initially", () => {
    const { result } = renderHook(() => useModals());
    expect(result.current.showConsultationModal).toBe(false);
    expect(result.current.showProfileModal).toBe(false);
    expect(result.current.showSpecialtyModal).toBe(false);
    expect(result.current.showAboutModal).toBe(false);
  });

  it("openConsultationModal() sets showConsultationModal true, others false", () => {
    const { result } = renderHook(() => useModals());
    act(() => { result.current.openConsultationModal(); });

    expect(result.current.showConsultationModal).toBe(true);
    expect(result.current.showProfileModal).toBe(false);
    expect(result.current.showSpecialtyModal).toBe(false);
    expect(result.current.showAboutModal).toBe(false);
  });

  it("openConsultationModal(consultation, year) populates editingConsultation and specialtyYear", () => {
    const { result } = renderHook(() => useModals());
    act(() => { result.current.openConsultationModal(stubConsultation, 2); });

    expect(result.current.editingConsultation).toBe(stubConsultation);
    expect(result.current.specialtyYear).toBe(2);
  });

  it("openProfileModal() sets showProfileModal true", () => {
    const { result } = renderHook(() => useModals());
    act(() => { result.current.openProfileModal(); });
    expect(result.current.showProfileModal).toBe(true);
  });

  it("openSpecialtyModal() sets showSpecialtyModal true", () => {
    const { result } = renderHook(() => useModals());
    act(() => { result.current.openSpecialtyModal(); });
    expect(result.current.showSpecialtyModal).toBe(true);
  });

  it("openAboutModal() sets showAboutModal true", () => {
    const { result } = renderHook(() => useModals());
    act(() => { result.current.openAboutModal(); });
    expect(result.current.showAboutModal).toBe(true);
  });

  it("closeModal() resets all booleans to false and clears editingConsultation", () => {
    const { result } = renderHook(() => useModals());
    act(() => { result.current.openConsultationModal(stubConsultation); });
    act(() => { result.current.closeModal(); });

    expect(result.current.showConsultationModal).toBe(false);
    expect(result.current.showProfileModal).toBe(false);
    expect(result.current.showSpecialtyModal).toBe(false);
    expect(result.current.showAboutModal).toBe(false);
    expect(result.current.editingConsultation).toBeNull();
  });

  it("setEditingConsultation updates editingConsultation without changing modal type", () => {
    const { result } = renderHook(() => useModals());
    act(() => { result.current.openConsultationModal(); });

    const other = { id: "c2" } as ConsultationMGF;
    act(() => { result.current.setEditingConsultation(other); });

    expect(result.current.editingConsultation).toBe(other);
    // Modal type unchanged
    expect(result.current.showConsultationModal).toBe(true);
  });
});
