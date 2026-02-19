import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Specialty } from "@/lib/api/specialties";
import type { UserData } from "@/lib/api/users";

// ---------------------------------------------------------------------------
// Mock all modal sub-components with identifiable stubs
// ---------------------------------------------------------------------------
vi.mock("@/components/modals/specialty-selection-modal", () => ({
  SpecialtySelectionModal: () => <div data-testid="specialty-modal" />,
}));

vi.mock("@/components/modals/profile-modal", () => ({
  ProfileModal: () => <div data-testid="profile-modal" />,
}));

vi.mock("@/components/modals/consultation-modal", () => ({
  ConsultationModal: () => <div data-testid="consultation-modal" />,
}));

vi.mock("@/components/modals/about-modal", () => ({
  AboutModal: () => <div data-testid="about-modal" />,
}));

// ---------------------------------------------------------------------------
// Import subject under test AFTER mocks are established
// ---------------------------------------------------------------------------
import { ModalManager } from "@/components/modals/modal-manager";

function makeSpecialty(): Specialty {
  return { id: "sp1", code: "mgf", name: "MGF" } as Specialty;
}

/** All show* flags default to false — tests override as needed */
const baseProps = {
  userProfile: null as UserData | null,
  userSpecialty: null as Specialty | null,
  showSpecialtyModal: false,
  showProfileModal: false,
  showConsultationModal: false,
  showAboutModal: false,
  editingConsultation: null,
  userId: "u1",
  onSpecialtySelected: vi.fn(),
  onProfileClose: vi.fn(),
  onProfileUserUpdated: vi.fn(),
  onConsultationClose: vi.fn(),
  onConsultationSaved: vi.fn(),
  onAboutClose: vi.fn(),
};

describe("ModalManager", () => {
  it("all show* false → no modal stubs in document", () => {
    render(<ModalManager {...baseProps} />);
    expect(screen.queryByTestId("specialty-modal")).not.toBeInTheDocument();
    expect(screen.queryByTestId("profile-modal")).not.toBeInTheDocument();
    expect(screen.queryByTestId("consultation-modal")).not.toBeInTheDocument();
    expect(screen.queryByTestId("about-modal")).not.toBeInTheDocument();
  });

  it("showSpecialtyModal=true + userId → SpecialtySelectionModal present", () => {
    render(<ModalManager {...baseProps} showSpecialtyModal={true} />);
    expect(screen.getByTestId("specialty-modal")).toBeInTheDocument();
  });

  it("showProfileModal=true + userSpecialty=null → ProfileModal absent (guard condition)", () => {
    render(<ModalManager {...baseProps} showProfileModal={true} />);
    expect(screen.queryByTestId("profile-modal")).not.toBeInTheDocument();
  });

  it("showProfileModal=true + userSpecialty provided → ProfileModal present", () => {
    render(
      <ModalManager
        {...baseProps}
        showProfileModal={true}
        userSpecialty={makeSpecialty()}
      />,
    );
    expect(screen.getByTestId("profile-modal")).toBeInTheDocument();
  });

  it("showConsultationModal=true + userId → ConsultationModal present", () => {
    render(<ModalManager {...baseProps} showConsultationModal={true} />);
    expect(screen.getByTestId("consultation-modal")).toBeInTheDocument();
  });

  it("showAboutModal=true → AboutModal present", () => {
    render(<ModalManager {...baseProps} showAboutModal={true} />);
    expect(screen.getByTestId("about-modal")).toBeInTheDocument();
  });
});
