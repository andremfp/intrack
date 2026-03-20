import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { Specialty } from "@/lib/api/specialties";

// ---------------------------------------------------------------------------
// Mocks — established before the subject is imported
// ---------------------------------------------------------------------------
vi.mock("@/components/ui/sidebar-context", () => ({
  useSidebar: vi.fn().mockReturnValue({ isMobile: false }),
}));

vi.mock("@/hooks/modals/use-modals", () => ({
  useModals: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Import subject after mocks are established
// ---------------------------------------------------------------------------
import { useDashboardModals } from "@/hooks/modals/use-dashboard-modals";
import { useSidebar } from "@/components/ui/sidebar-context";
import { useModals } from "@/hooks/modals/use-modals";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const stubSpecialty = { id: "spec-1" } as Specialty;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("useDashboardModals", () => {
  // Stable modals object created fresh each test so vi.fn() call counts reset cleanly.
  // All method spies are stored on this object for assertion.
  let modals: {
    showSpecialtyModal: boolean;
    showProfileModal: boolean;
    showConsultationModal: boolean;
    showAboutModal: boolean;
    editingConsultation: null;
    specialtyYear: null;
    modalState: object;
    openModal: ReturnType<typeof vi.fn>;
    closeModal: ReturnType<typeof vi.fn>;
    openConsultationModal: ReturnType<typeof vi.fn>;
    openProfileModal: ReturnType<typeof vi.fn>;
    openSpecialtyModal: ReturnType<typeof vi.fn>;
    openAboutModal: ReturnType<typeof vi.fn>;
    setEditingConsultation: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a stable object reference — same object is returned every render
    // to prevent spurious effect re-runs caused by reference inequality.
    modals = {
      showSpecialtyModal: false,
      showProfileModal: false,
      showConsultationModal: false,
      showAboutModal: false,
      editingConsultation: null,
      specialtyYear: null,
      modalState: {},
      openModal: vi.fn(),
      closeModal: vi.fn(),
      openConsultationModal: vi.fn(),
      openProfileModal: vi.fn(),
      openSpecialtyModal: vi.fn(),
      openAboutModal: vi.fn(),
      setEditingConsultation: vi.fn(),
    };

    vi.mocked(useSidebar).mockReturnValue(
      { isMobile: false } as ReturnType<typeof useSidebar>,
    );
    vi.mocked(useModals).mockReturnValue(
      modals as unknown as ReturnType<typeof useModals>,
    );
  });

  // --- Specialty modal effect ---

  it("initShowSpecialtyModal null: no modal action triggered on mount", () => {
    renderHook(() => useDashboardModals(null));

    expect(modals.openSpecialtyModal).not.toHaveBeenCalled();
    expect(modals.closeModal).not.toHaveBeenCalled();
  });

  it("updateInitShowSpecialtyModal(true) with no userSpecialty: openSpecialtyModal called", async () => {
    const { result } = renderHook(() => useDashboardModals(null));

    await act(async () => {
      result.current.updateInitShowSpecialtyModal(true);
    });

    expect(modals.openSpecialtyModal).toHaveBeenCalledTimes(1);
  });

  it("updateInitShowSpecialtyModal(false): openSpecialtyModal not called", async () => {
    const { result } = renderHook(() => useDashboardModals(null));

    await act(async () => {
      result.current.updateInitShowSpecialtyModal(false);
    });

    expect(modals.openSpecialtyModal).not.toHaveBeenCalled();
  });

  it("closeModal called when userSpecialty becomes non-null while specialty modal is showing", async () => {
    // Override showSpecialtyModal=true; spread preserves the same vi.fn() spy references.
    const modalsWithOpen = { ...modals, showSpecialtyModal: true };
    vi.mocked(useModals).mockReturnValue(
      modalsWithOpen as unknown as ReturnType<typeof useModals>,
    );

    type Props = { userSpecialty: Specialty | null };
    const { result, rerender } = renderHook(
      ({ userSpecialty }: Props) => useDashboardModals(userSpecialty),
      { initialProps: { userSpecialty: null as Specialty | null } },
    );

    // Set initShowSpecialtyModal to non-null so the effect can act.
    // With showSpecialtyModal=true, the first branch (!showSpecialtyModal) is false
    // so openSpecialtyModal is NOT called.
    await act(async () => {
      result.current.updateInitShowSpecialtyModal(true);
    });
    expect(modals.openSpecialtyModal).not.toHaveBeenCalled();

    // Provide a specialty — effect re-runs, hits the else-if branch → closeModal
    rerender({ userSpecialty: stubSpecialty });
    await waitFor(() => expect(modals.closeModal).toHaveBeenCalledTimes(1));
  });

  // --- handleSpecialtySelected ---

  it("handleSpecialtySelected: calls closeModal", () => {
    const { result } = renderHook(() => useDashboardModals(null));

    act(() => { result.current.handleSpecialtySelected(); });

    expect(modals.closeModal).toHaveBeenCalledTimes(1);
  });

  // --- handleAddConsultation ---

  it("handleAddConsultation(year): calls openConsultationModal(null, year)", () => {
    const { result } = renderHook(() => useDashboardModals(null));

    act(() => { result.current.handleAddConsultation(2); });

    expect(modals.openConsultationModal).toHaveBeenCalledWith(null, 2);
  });

  // --- withMobileClose ---

  it("withMobileClose on desktop (isMobile=false): callback called, setOpenMobile untouched", () => {
    const callback = vi.fn();
    const setOpenMobile = vi.fn();
    const { result } = renderHook(() => useDashboardModals(null, setOpenMobile));

    act(() => { result.current.withMobileClose(callback)(); });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(setOpenMobile).not.toHaveBeenCalled();
  });

  it("withMobileClose on mobile (isMobile=true): setOpenMobile(false) called before callback", () => {
    vi.mocked(useSidebar).mockReturnValue(
      { isMobile: true } as ReturnType<typeof useSidebar>,
    );

    const callOrder: string[] = [];
    const callback = vi.fn(() => callOrder.push("callback"));
    const setOpenMobile = vi.fn(() => callOrder.push("setOpenMobile"));

    const { result } = renderHook(() => useDashboardModals(null, setOpenMobile));

    act(() => { result.current.withMobileClose(callback)(); });

    expect(setOpenMobile).toHaveBeenCalledWith(false);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callOrder).toEqual(["setOpenMobile", "callback"]);
  });

  // --- handleConsultationSaved ---

  it("handleConsultationSaved: invokes all three refresh refs when populated", async () => {
    const { result } = renderHook(() => useDashboardModals(null));

    const refreshConsultations = vi.fn().mockResolvedValue(undefined);
    const refreshMetrics = vi.fn().mockResolvedValue(undefined);
    const refreshReports = vi.fn().mockResolvedValue(undefined);

    result.current.refreshConsultationsRef.current = refreshConsultations;
    result.current.refreshMetricsRef.current = refreshMetrics;
    result.current.refreshReportsRef.current = refreshReports;

    await act(async () => {
      await result.current.handleConsultationSaved();
    });

    expect(refreshConsultations).toHaveBeenCalledTimes(1);
    expect(refreshMetrics).toHaveBeenCalledTimes(1);
    expect(refreshReports).toHaveBeenCalledTimes(1);
  });

  it("handleConsultationSaved: is a no-op when refs are null (does not throw)", async () => {
    const { result } = renderHook(() => useDashboardModals(null));

    // Refs are null by default; optional chaining in the hook prevents errors
    await act(async () => {
      await result.current.handleConsultationSaved();
    });
  });
});
