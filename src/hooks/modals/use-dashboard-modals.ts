import { useCallback, useEffect, useRef, useState } from "react";
import type { Specialty } from "@/lib/api/specialties";
import { useSidebar } from "@/components/ui/sidebar-context";
import { useModals } from "./use-modals";

/**
 * Hook to manage all dashboard modal logic in one place
 * Extends the generic modals hook with dashboard-specific behavior
 */
export function useDashboardModals(
  userSpecialty: Specialty | null,
  setOpenMobile?: (open: boolean) => void
) {
  const { isMobile } = useSidebar();
  const refreshConsultationsRef = useRef<(() => Promise<void>) | null>(null);
  const refreshMetricsRef = useRef<(() => Promise<void>) | null>(null);
  const refreshReportsRef = useRef<(() => Promise<void>) | null>(null);
  const [initShowSpecialtyModal, setInitShowSpecialtyModal] = useState<boolean | null>(null);

  // Use the generic modals hook
  const modals = useModals();

  // Update initialization state when it becomes available
  const updateInitShowSpecialtyModal = useCallback((show: boolean) => {
    setInitShowSpecialtyModal(show);
  }, []);

  // Handle specialty modal visibility based on initialization state
  useEffect(() => {
    if (initShowSpecialtyModal !== null) {
      if (initShowSpecialtyModal && !userSpecialty && !modals.showSpecialtyModal) {
        modals.openSpecialtyModal();
      } else if (userSpecialty && modals.showSpecialtyModal) {
        modals.closeModal();
      }
    }
  }, [
    initShowSpecialtyModal,
    userSpecialty,
    modals,
  ]);

  // Enhanced handlers that include parent component logic
  const handleSpecialtySelected = useCallback(() => {
    // This will be handled by the parent component since it needs access to updateUserSpecialty
    // We just close the modal here
    modals.closeModal();
  }, [modals]);

  const handleRowClick = modals.openConsultationModal;
  const handleAddConsultation = useCallback((specialtyYear?: number) =>
    modals.openConsultationModal(null, specialtyYear), [modals]);

  // Mobile-aware action wrapper
  const withMobileClose = useCallback(<T extends unknown[]>(
    callback: (...args: T) => void
  ) => {
    return (...args: T) => {
      if (isMobile && setOpenMobile) {
        setOpenMobile(false);
      }
      callback(...args);
    };
  }, [isMobile, setOpenMobile]);

  const handleConsultationSaved = useCallback(async () => {
    // Refresh consultations, metrics, and reports after save
    await refreshConsultationsRef.current?.();
    await refreshMetricsRef.current?.();
    await refreshReportsRef.current?.();
  }, []);

  return {
    // Modal states (re-export from generic hook)
    showSpecialtyModal: modals.showSpecialtyModal,
    showProfileModal: modals.showProfileModal,
    showConsultationModal: modals.showConsultationModal,
    showAboutModal: modals.showAboutModal,
    editingConsultation: modals.editingConsultation,
    specialtyYear: modals.specialtyYear,  

    // Modal handlers
    handleSpecialtySelected,
    handleRowClick,
    handleAddConsultation,
    handleConsultationSaved,
    openProfileModal: withMobileClose(modals.openProfileModal),
    openAboutModal: withMobileClose(modals.openAboutModal),
    closeModal: modals.closeModal,

    // Utility functions
    withMobileClose,
    setShowSpecialtyModal: modals.openSpecialtyModal, // For backwards compatibility

    // Refs
    refreshConsultationsRef,
    refreshMetricsRef,
    refreshReportsRef,

    // Initialization
    updateInitShowSpecialtyModal,
  };
}
