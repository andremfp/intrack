import { useCallback, useReducer } from "react";
import { modalsReducer, initialModalState } from "./helpers";
import type { ModalType, UseModalsReturn } from "./types";
import type { ConsultationMGF } from "@/lib/api/consultations";

/**
 * Generic hook for managing modal state.
 *
 * Features:
 * - Centralized modal state management with reducer
 * - Type-safe modal operations
 * - Convenient boolean getters for each modal type
 * - Editing consultation state management
 */
export function useModals(): UseModalsReturn {
  const [modalState, dispatch] = useReducer(modalsReducer, initialModalState);

  // Action creators
  const openModal = useCallback(
    (type: ModalType, editingConsultation?: ConsultationMGF | null, specialtyYear?: number | null) => {
      dispatch({
        type: "OPEN_MODAL",
        payload: { type, editingConsultation, specialtyYear },
      });
    },
    []
  );

  const closeModal = useCallback(() => {
    dispatch({ type: "CLOSE_MODAL" });
  }, []);

  const setEditingConsultation = useCallback((consultation: ConsultationMGF | null) => {
    dispatch({
      type: "SET_EDITING_CONSULTATION",
      payload: consultation,
    });
  }, []);

  // Convenience methods for specific modals
  const openConsultationModal = useCallback(
    (consultation?: ConsultationMGF | null, specialtyYear?: number | null) => {
      openModal("consultation", consultation, specialtyYear);
    },
    [openModal]
  );

  const openProfileModal = useCallback(() => {
    openModal("profile");
  }, [openModal]);

  const openSpecialtyModal = useCallback(() => {
    openModal("specialty");
  }, [openModal]);

  const openAboutModal = useCallback(() => {
    openModal("about");
  }, [openModal]);

  // Computed boolean states
  const showSpecialtyModal = modalState.type === "specialty";
  const showProfileModal = modalState.type === "profile";
  const showConsultationModal = modalState.type === "consultation";
  const showAboutModal = modalState.type === "about";

  return {
    // Modal states
    modalState,
    showSpecialtyModal,
    showProfileModal,
    showConsultationModal,
    showAboutModal,
    editingConsultation: modalState.editingConsultation,
    specialtyYear: modalState.specialtyYear,

    // Modal actions
    openModal,
    closeModal,
    openConsultationModal,
    openProfileModal,
    openSpecialtyModal,
    openAboutModal,
    setEditingConsultation,
  };
}
