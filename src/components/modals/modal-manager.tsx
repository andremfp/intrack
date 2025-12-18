import { SpecialtySelectionModal } from "./specialty-selection-modal";
import { ProfileModal } from "./profile-modal";
import { ConsultationModal } from "./consultation-modal";
import { AboutModal } from "./about-modal";
import type { UserData } from "@/lib/api/users";
import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationMGF } from "@/lib/api/consultations";

/**
 * Props for the ModalManager component
 */
interface ModalManagerProps {
  userProfile: UserData | null;
  userSpecialty: Specialty | null;
  showSpecialtyModal: boolean;
  showProfileModal: boolean;
  showConsultationModal: boolean;
  showAboutModal: boolean;
  editingConsultation: ConsultationMGF | null;
  specialtyYear?: number | null;
  userId: string;
  onSpecialtySelected: (specialty: Specialty) => void;
  onProfileClose: () => void;
  onProfileUserUpdated: (user: UserData) => void;
  onConsultationClose: () => void;
  onConsultationSaved: () => void;
  onAboutClose: () => void;
}

/**
 * Component that manages all modal rendering logic
 * Centralizes modal rendering to reduce complexity in parent components
 */
export function ModalManager({
  userProfile,
  userSpecialty,
  showSpecialtyModal,
  showProfileModal,
  showConsultationModal,
  showAboutModal,
  editingConsultation,
  specialtyYear,
  userId,
  onSpecialtySelected,
  onProfileClose,
  onProfileUserUpdated,
  onConsultationClose,
  onConsultationSaved,
  onAboutClose,
}: ModalManagerProps) {
  return (
    <>
      {showSpecialtyModal && userId && (
        <SpecialtySelectionModal
          userId={userId}
          username={userProfile?.data.display_name ?? ""}
          onSpecialtySelected={onSpecialtySelected}
        />
      )}
      {showProfileModal && userSpecialty && (
        <ProfileModal
          user={userProfile}
          specialty={userSpecialty}
          onClose={onProfileClose}
          onUserUpdated={onProfileUserUpdated}
        />
      )}
      {showConsultationModal && userId && (
        <ConsultationModal
          userId={userId}
          specialty={userSpecialty}
          editingConsultation={editingConsultation}
          specialtyYear={specialtyYear}
          onClose={onConsultationClose}
          onConsultationSaved={onConsultationSaved}
        />
      )}
      {showAboutModal && <AboutModal onClose={onAboutClose} />}
    </>
  );
}
