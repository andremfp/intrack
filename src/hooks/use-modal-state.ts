import { useState, useCallback } from "react";
import type { ConsultationMGF } from "@/lib/api/consultations";

type ModalType = "specialty" | "profile" | "consultation" | "about" | null;

interface ModalState {
  type: ModalType;
  editingConsultation: ConsultationMGF | null;
}

/**
 * Hook to manage modal state in a consolidated way
 */
export function useModalState() {
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    editingConsultation: null,
  });

  const openModal = useCallback(
    (type: ModalType, editingConsultation?: ConsultationMGF | null) => {
      setModalState({
        type,
        editingConsultation: editingConsultation ?? null,
      });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalState({
      type: null,
      editingConsultation: null,
    });
  }, []);

  const openConsultationModal = useCallback(
    (consultation?: ConsultationMGF | null) => {
      openModal("consultation", consultation);
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

  const setShowSpecialtyModal = useCallback(
    (show: boolean) => {
      if (show) {
        openSpecialtyModal();
      } else {
        closeModal();
      }
    },
    [openSpecialtyModal, closeModal]
  );

  return {
    showSpecialtyModal: modalState.type === "specialty",
    showProfileModal: modalState.type === "profile",
    showConsultationModal: modalState.type === "consultation",
    showAboutModal: modalState.type === "about",
    editingConsultation: modalState.editingConsultation,
    openConsultationModal,
    openProfileModal,
    openSpecialtyModal,
    openAboutModal,
    closeModal,
    setShowSpecialtyModal,
  };
}

