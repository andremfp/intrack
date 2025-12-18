import type { ConsultationMGF } from "@/lib/api/consultations";

/**
 * Modal types supported by the application
 */
export type ModalType = "specialty" | "profile" | "consultation" | "about" | null;

/**
 * Modal state structure
 */
export interface ModalState {
  type: ModalType;
  editingConsultation: ConsultationMGF | null;
  specialtyYear?: number | null;
}

/**
 * Action types for modal reducer
 */
export type ModalAction =
  | { type: "OPEN_MODAL"; payload: { type: ModalType; editingConsultation?: ConsultationMGF | null; specialtyYear?: number | null } }
  | { type: "CLOSE_MODAL" }
  | { type: "SET_EDITING_CONSULTATION"; payload: ConsultationMGF | null }
  | { type: "RESET" };

/**
 * Return type for the useModals hook
 */
export interface UseModalsReturn {
  // Modal states
  modalState: ModalState;
  showSpecialtyModal: boolean;
  showProfileModal: boolean;
  showConsultationModal: boolean;
  showAboutModal: boolean;
  editingConsultation: ConsultationMGF | null;
  specialtyYear?: number | null;

  // Modal actions
  openModal: (type: ModalType, editingConsultation?: ConsultationMGF | null, specialtyYear?: number | null) => void;
  closeModal: () => void;
  openConsultationModal: (consultation?: ConsultationMGF | null, specialtyYear?: number | null) => void;
  openProfileModal: () => void;
  openSpecialtyModal: () => void;
  openAboutModal: () => void;
  setEditingConsultation: (consultation: ConsultationMGF | null) => void;
}
