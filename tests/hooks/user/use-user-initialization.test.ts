import { renderHook, waitFor } from "@testing-library/react";
import { AppError, ErrorMessages } from "@/errors";
import type { UserData } from "@/lib/api/users";
import type { Specialty } from "@/lib/api/specialties";

// ---------------------------------------------------------------------------
// Hoisted mocks — must be defined before vi.mock() calls
// ---------------------------------------------------------------------------
const {
  mockCheckUserExists,
  mockGetCurrentUser,
  mockUpsertUser,
  mockGetSpecialty,
  mockNavigate,
} = vi.hoisted(() => ({
  mockCheckUserExists: vi.fn(),
  mockGetCurrentUser: vi.fn(),
  mockUpsertUser: vi.fn(),
  mockGetSpecialty: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock("@/lib/api/users", () => ({
  checkUserExists: mockCheckUserExists,
  getCurrentUser: mockGetCurrentUser,
  upsertUser: mockUpsertUser,
}));

vi.mock("@/lib/api/specialties", () => ({
  getSpecialty: mockGetSpecialty,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// ---------------------------------------------------------------------------
// Import subject under test AFTER mocks are established
// ---------------------------------------------------------------------------
import { useUserInitialization } from "@/hooks/user/use-user-initialization";

// ---------------------------------------------------------------------------
// Test data factories
// ---------------------------------------------------------------------------
function makeUserData(specialtyId?: string | null): UserData {
  return {
    data: {
      id: "db-row-id",
      user_id: "auth-uid",
      display_name: "Test User",
      specialty_id: specialtyId ?? null,
      specialty_year: specialtyId ? 1 : null,
    },
  } as unknown as UserData;
}

function makeSpecialty(): Specialty {
  return { id: "sp1", code: "mgf", name: "MGF" } as Specialty;
}

/** Injected toast mock — resets automatically in beforeEach */
function makeToastsMock() {
  return { apiError: vi.fn(), error: vi.fn(), success: vi.fn(), warning: vi.fn() };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("useUserInitialization", () => {
  let toastsMock: ReturnType<typeof makeToastsMock>;

  beforeEach(() => {
    vi.resetAllMocks();
    toastsMock = makeToastsMock();
  });

  // --- Fast-path: initialUserProfile provided ---

  it("with initialUserProfile that has specialty_id: isLoading=false, showSpecialtyModal=false, no API calls", () => {
    const profile = makeUserData("sp1");
    const { result } = renderHook(() =>
      useUserInitialization(vi.fn(), vi.fn(), profile, toastsMock)
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.showSpecialtyModal).toBe(false);
    expect(mockCheckUserExists).not.toHaveBeenCalled();
  });

  it("with initialUserProfile that has no specialty_id: isLoading=false, showSpecialtyModal=true", () => {
    const profile = makeUserData(null);
    const { result } = renderHook(() =>
      useUserInitialization(vi.fn(), vi.fn(), profile, toastsMock)
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.showSpecialtyModal).toBe(true);
    expect(mockCheckUserExists).not.toHaveBeenCalled();
  });

  // --- Async init path ---

  it("checkUserExists returns AUTH_FAILED error → navigate('/') called, no toast", async () => {
    mockCheckUserExists.mockResolvedValueOnce({
      success: false,
      error: new AppError(ErrorMessages.AUTH_FAILED),
    });

    const { result } = renderHook(() =>
      useUserInitialization(vi.fn(), vi.fn(), null, toastsMock)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    expect(toastsMock.apiError).not.toHaveBeenCalled();
  });

  it("checkUserExists returns non-auth API error → apiError toast called, isLoading=false", async () => {
    const apiError = new AppError("Some other error");
    mockCheckUserExists.mockResolvedValueOnce({ success: false, error: apiError });

    const { result } = renderHook(() =>
      useUserInitialization(vi.fn(), vi.fn(), null, toastsMock)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(toastsMock.apiError).toHaveBeenCalledWith(apiError, "Erro");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("checkUserExists returns false (new user) → upsertUser called → updateUserProfile called on success", async () => {
    const userData = makeUserData("sp1");
    const specialty = makeSpecialty();

    mockCheckUserExists.mockResolvedValueOnce({ success: true, data: false });
    mockUpsertUser.mockResolvedValueOnce({ success: true, data: userData });
    mockGetSpecialty.mockResolvedValueOnce({ success: true, data: specialty });

    const updateUserProfile = vi.fn();
    const updateUserSpecialty = vi.fn();

    const { result } = renderHook(() =>
      useUserInitialization(updateUserProfile, updateUserSpecialty, null, toastsMock)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockUpsertUser).toHaveBeenCalledTimes(1);
    expect(updateUserProfile).toHaveBeenCalledWith(userData);
  });

  it("checkUserExists returns true → getCurrentUser called → updateUserProfile called", async () => {
    const userData = makeUserData(null);

    mockCheckUserExists.mockResolvedValueOnce({ success: true, data: true });
    mockGetCurrentUser.mockResolvedValueOnce({ success: true, data: userData });

    const updateUserProfile = vi.fn();

    const { result } = renderHook(() =>
      useUserInitialization(updateUserProfile, vi.fn(), null, toastsMock)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(updateUserProfile).toHaveBeenCalledWith(userData);
  });

  it("user loaded with no specialty_id → showSpecialtyModal=true, getSpecialty not called", async () => {
    const userData = makeUserData(null);

    mockCheckUserExists.mockResolvedValueOnce({ success: true, data: true });
    mockGetCurrentUser.mockResolvedValueOnce({ success: true, data: userData });

    const { result } = renderHook(() =>
      useUserInitialization(vi.fn(), vi.fn(), null, toastsMock)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.showSpecialtyModal).toBe(true);
    expect(mockGetSpecialty).not.toHaveBeenCalled();
  });

  it("user loaded with specialty_id → getSpecialty called → updateUserSpecialty called", async () => {
    const userData = makeUserData("sp1");
    const specialty = makeSpecialty();

    mockCheckUserExists.mockResolvedValueOnce({ success: true, data: true });
    mockGetCurrentUser.mockResolvedValueOnce({ success: true, data: userData });
    mockGetSpecialty.mockResolvedValueOnce({ success: true, data: specialty });

    const updateUserSpecialty = vi.fn();

    const { result } = renderHook(() =>
      useUserInitialization(vi.fn(), updateUserSpecialty, null, toastsMock)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetSpecialty).toHaveBeenCalledWith("sp1");
    expect(updateUserSpecialty).toHaveBeenCalledWith(specialty);
  });
});
