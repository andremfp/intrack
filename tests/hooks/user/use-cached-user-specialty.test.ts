import { renderHook, act } from "@testing-library/react";
import { useCachedUserSpecialty } from "@/hooks/user/use-cached-user-specialty";
import { userCache } from "@/utils/user-cache";
import type { Specialty } from "@/lib/api/specialties";
import { vi } from "vitest";

vi.mock("@/utils/user-cache", () => ({
  userCache: {
    getUserSpecialty: vi.fn(),
    setUserSpecialty: vi.fn(),
  },
}));

const mockUserCache = vi.mocked(userCache);

/** Minimal Specialty stub */
function makeSpecialty(id = "sp1", code = "MGF"): Specialty {
  return {
    id,
    code,
    name: "Medicina Geral e Familiar",
  } as unknown as Specialty;
}

describe("useCachedUserSpecialty", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null as initial value when cache is empty", () => {
    mockUserCache.getUserSpecialty.mockReturnValue(null);

    const { result } = renderHook(() => useCachedUserSpecialty());

    expect(result.current[0]).toBeNull();
  });

  it("returns cached specialty as initial value when cache has a value", () => {
    const specialty = makeSpecialty();
    mockUserCache.getUserSpecialty.mockReturnValue(specialty);

    const { result } = renderHook(() => useCachedUserSpecialty());

    expect(result.current[0]).toBe(specialty);
  });

  it("updateUserSpecialty updates returned state", () => {
    mockUserCache.getUserSpecialty.mockReturnValue(null);
    const { result } = renderHook(() => useCachedUserSpecialty());

    const newSpecialty = makeSpecialty("sp2", "MED");

    act(() => {
      result.current[1](newSpecialty);
    });

    expect(result.current[0]).toBe(newSpecialty);
  });

  it("updateUserSpecialty writes the new value to userCache", () => {
    mockUserCache.getUserSpecialty.mockReturnValue(null);
    const { result } = renderHook(() => useCachedUserSpecialty());

    const newSpecialty = makeSpecialty("sp2", "MED");

    act(() => {
      result.current[1](newSpecialty);
    });

    expect(mockUserCache.setUserSpecialty).toHaveBeenCalledWith(newSpecialty);
    expect(mockUserCache.setUserSpecialty).toHaveBeenCalledTimes(1);
  });
});
