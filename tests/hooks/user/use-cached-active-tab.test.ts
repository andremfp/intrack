import { renderHook, act } from "@testing-library/react";
import { useCachedActiveTab } from "@/hooks/user/use-cached-active-tab";
import { TAB_CONSTANTS } from "@/constants";
import { userCache } from "@/utils/user-cache";
import type { UserData } from "@/lib/api/users";

/** Build a minimal UserData stub */
function makeUserProfile(specialtyYear?: number): UserData {
  return {
    id: "u1",
    data: {
      display_name: "Test",
      specialty_id: specialtyYear ? "sp1" : null,
      specialty_year: specialtyYear ?? null,
    },
  } as unknown as UserData;
}

describe("useCachedActiveTab", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns 'Consultas' when no storage and no userProfile", () => {
    const { result } = renderHook(() => useCachedActiveTab(undefined));
    expect(result.current[0]).toBe(TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS);
  });

  it("returns 'Consultas.2' when no storage and userProfile.data.specialty_year = 2", () => {
    // Seed the user profile in cache so the lazy initializer finds it
    const profile = makeUserProfile(2);
    userCache.setUserProfile(profile);

    const { result } = renderHook(() => useCachedActiveTab(profile));
    expect(result.current[0]).toBe(`${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.2`);
  });

  it("returns cached tab unchanged when cache is valid (year matches)", () => {
    const profile = makeUserProfile(2);
    userCache.setUserProfile(profile);
    userCache.setActiveTab(`${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.2` as never);

    const { result } = renderHook(() => useCachedActiveTab(profile));
    expect(result.current[0]).toBe(`${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.2`);
  });

  it("corrects stale cached tab: cache has 'Consultas.1' but profile year is 2", () => {
    const profile = makeUserProfile(2);
    userCache.setUserProfile(profile);
    userCache.setActiveTab(`${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.1` as never);

    const { result } = renderHook(() => useCachedActiveTab(profile));
    expect(result.current[0]).toBe(`${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.2`);
  });

  it("updateActiveTab changes state and writes to cache", () => {
    const { result } = renderHook(() => useCachedActiveTab(undefined));

    act(() => {
      result.current[1](TAB_CONSTANTS.MAIN_TABS.METRICS);
    });

    expect(result.current[0]).toBe(TAB_CONSTANTS.MAIN_TABS.METRICS);
    expect(userCache.getActiveTab()).toBe(TAB_CONSTANTS.MAIN_TABS.METRICS);
  });

  it("updates tab reactively when userProfile prop changes specialty year from undefined to a year", () => {
    let profile: UserData | undefined = undefined;
    const { result, rerender } = renderHook(
      (props: { profile: UserData | undefined }) => useCachedActiveTab(props.profile),
      { initialProps: { profile } }
    );

    // Initially no specialty year — expect base consultations tab
    expect(result.current[0]).toBe(TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS);

    // Provide a profile with specialty year 3
    profile = makeUserProfile(3);
    act(() => {
      rerender({ profile });
    });

    expect(result.current[0]).toBe(`${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.3`);
  });
});
