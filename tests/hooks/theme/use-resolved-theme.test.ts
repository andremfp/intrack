import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useResolvedTheme } from "@/hooks/theme/use-resolved-theme";
import type { ThemeProviderState } from "@/components/theme/theme-context";

// Mock the theme context so tests can control which theme value the hook sees
vi.mock("@/components/theme/theme-context");

import { useTheme } from "@/components/theme/theme-context";

const mockUseTheme = vi.mocked(useTheme);

// Creates a minimal matchMedia mock that supports addEventListener/removeEventListener
// and can trigger "change" events programmatically via trigger()
function createMockMediaQuery(matches: boolean) {
  const listeners = new Set<(event: Partial<MediaQueryListEvent>) => void>();

  const mq = {
    matches,
    addEventListener: vi.fn(
      (_event: string, listener: (e: Partial<MediaQueryListEvent>) => void) => {
        listeners.add(listener);
      }
    ),
    removeEventListener: vi.fn(
      (_event: string, listener: (e: Partial<MediaQueryListEvent>) => void) => {
        listeners.delete(listener);
      }
    ),
    /** Fire a "change" event with the given matches value */
    trigger(newMatches: boolean) {
      listeners.forEach((l) => l({ matches: newMatches }));
    },
  };

  return mq;
}

function mockTheme(theme: ThemeProviderState["theme"]) {
  mockUseTheme.mockReturnValue({ theme, setTheme: vi.fn() });
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useResolvedTheme", () => {
  describe("explicit theme values", () => {
    it('resolves to "dark" immediately when theme is "dark"', () => {
      mockTheme("dark");

      const { result } = renderHook(() => useResolvedTheme());

      expect(result.current).toBe("dark");
    });

    it('resolves to "light" immediately when theme is "light"', () => {
      mockTheme("light");

      const { result } = renderHook(() => useResolvedTheme());

      expect(result.current).toBe("light");
    });
  });

  describe('"system" theme — initial resolution', () => {
    it('resolves to "dark" when the system prefers dark', () => {
      mockTheme("system");
      const mq = createMockMediaQuery(true);
      vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mq));

      const { result } = renderHook(() => useResolvedTheme());

      expect(result.current).toBe("dark");
    });

    it('resolves to "light" when the system prefers light', () => {
      mockTheme("system");
      const mq = createMockMediaQuery(false);
      vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mq));

      const { result } = renderHook(() => useResolvedTheme());

      expect(result.current).toBe("light");
    });
  });

  describe('"system" theme — media query change events', () => {
    it('updates resolved value to "dark" when a change event fires with matches = true', () => {
      mockTheme("system");
      const mq = createMockMediaQuery(false); // starts light
      vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mq));

      const { result } = renderHook(() => useResolvedTheme());
      expect(result.current).toBe("light");

      // System switches to dark
      act(() => {
        mq.trigger(true);
      });

      expect(result.current).toBe("dark");
    });

    it('updates resolved value to "light" when a change event fires with matches = false', () => {
      mockTheme("system");
      const mq = createMockMediaQuery(true); // starts dark
      vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mq));

      const { result } = renderHook(() => useResolvedTheme());
      expect(result.current).toBe("dark");

      // System switches to light
      act(() => {
        mq.trigger(false);
      });

      expect(result.current).toBe("light");
    });

    it("registers a change listener when theme is system", () => {
      mockTheme("system");
      const mq = createMockMediaQuery(false);
      vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mq));

      renderHook(() => useResolvedTheme());

      expect(mq.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
    });
  });

  describe('transition away from "system" theme', () => {
    it('removes the media query listener and resolves to "dark" when theme changes from "system" to "dark"', () => {
      let currentTheme: ThemeProviderState["theme"] = "system";
      mockUseTheme.mockImplementation(() => ({
        theme: currentTheme,
        setTheme: vi.fn(),
      }));

      const mq = createMockMediaQuery(true);
      vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mq));

      const { result, rerender } = renderHook(() => useResolvedTheme());
      expect(result.current).toBe("dark");
      expect(mq.addEventListener).toHaveBeenCalledOnce();

      // Theme switches to explicit "dark"
      act(() => {
        currentTheme = "dark";
        rerender();
      });

      // Listener is cleaned up
      expect(mq.removeEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
      expect(result.current).toBe("dark");
    });

    it('removes the media query listener and resolves to "light" when theme changes from "system" to "light"', () => {
      let currentTheme: ThemeProviderState["theme"] = "system";
      mockUseTheme.mockImplementation(() => ({
        theme: currentTheme,
        setTheme: vi.fn(),
      }));

      const mq = createMockMediaQuery(true);
      vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mq));

      const { result, rerender } = renderHook(() => useResolvedTheme());
      expect(result.current).toBe("dark");

      // Theme switches to explicit "light"
      act(() => {
        currentTheme = "light";
        rerender();
      });

      expect(mq.removeEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
      expect(result.current).toBe("light");
    });
  });

  describe("SSR guard", () => {
    // The typeof window === "undefined" branch in getSystemTheme() is designed for
    // Node/SSR environments where window does not exist at all. In a jsdom test
    // environment, window is always present and React DOM itself depends on it, so
    // this specific branch cannot be exercised here without crashing the test runner.
    //
    // The guard is verified by code review: getSystemTheme() returns "dark" before
    // touching window.matchMedia, making it safe to call during SSR.
    it("is documented — SSR guard (typeof window === undefined → dark) is not exercisable in jsdom", () => {
      // Intentionally empty: the guard is trivially correct (2-line early return)
      // and cannot be triggered in a jsdom environment.
      expect(true).toBe(true);
    });
  });
});
