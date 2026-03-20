import { renderHook, act } from "@testing-library/react";
import { useCachedUserProfile } from "@/hooks/user/use-cached-user-profile";
import { userCache } from "@/utils/user-cache";
import type { UserData } from "@/lib/api/users";
import { vi } from "vitest";

vi.mock("@/utils/user-cache", () => ({
  userCache: {
    getUserProfile: vi.fn(),
    setUserProfile: vi.fn(),
  },
}));

const mockUserCache = vi.mocked(userCache);

/** Minimal UserData stub */
function makeProfile(id = "u1"): UserData {
  return { data: { id, display_name: "Test" } } as unknown as UserData;
}

describe("useCachedUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null as initial value when cache is empty", () => {
    mockUserCache.getUserProfile.mockReturnValue(null);

    const { result } = renderHook(() => useCachedUserProfile());

    expect(result.current[0]).toBeNull();
  });

  it("returns cached profile as initial value when cache has a value", () => {
    const profile = makeProfile();
    mockUserCache.getUserProfile.mockReturnValue(profile);

    const { result } = renderHook(() => useCachedUserProfile());

    expect(result.current[0]).toBe(profile);
  });

  it("updateUserProfile updates returned state", () => {
    mockUserCache.getUserProfile.mockReturnValue(null);
    const { result } = renderHook(() => useCachedUserProfile());

    const newProfile = makeProfile("u2");

    act(() => {
      result.current[1](newProfile);
    });

    expect(result.current[0]).toBe(newProfile);
  });

  it("updateUserProfile writes the new value to userCache", () => {
    mockUserCache.getUserProfile.mockReturnValue(null);
    const { result } = renderHook(() => useCachedUserProfile());

    const newProfile = makeProfile("u2");

    act(() => {
      result.current[1](newProfile);
    });

    expect(mockUserCache.setUserProfile).toHaveBeenCalledWith(newProfile);
    expect(mockUserCache.setUserProfile).toHaveBeenCalledTimes(1);
  });
});
