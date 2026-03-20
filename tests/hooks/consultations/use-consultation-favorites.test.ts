import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "@/hooks/consultations/use-consultation-favorites";
import { makeConsultationMGF } from "../../factories/consultation";

// Mock the API layer so tests never touch Supabase
vi.mock("@/lib/api/consultations", () => ({
  updateConsultation: vi.fn(),
}));

import { updateConsultation } from "@/lib/api/consultations";

const mockUpdateConsultation = vi.mocked(updateConsultation);

const c1 = makeConsultationMGF({ id: "id-1", favorite: false });
const c2 = makeConsultationMGF({ id: "id-2", favorite: true });
const c3 = makeConsultationMGF({ id: "id-3", favorite: false });
const defaultConsultations = [c1, c2, c3];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useFavorites", () => {
  describe("isFavorite", () => {
    it("reflects the database value when no optimistic update is in flight", () => {
      const { result } = renderHook(() =>
        useFavorites({ consultations: defaultConsultations })
      );

      // c1.favorite = false
      expect(result.current.isFavorite("id-1")).toBe(false);
      // c2.favorite = true
      expect(result.current.isFavorite("id-2")).toBe(true);
    });

    it("reflects the optimistic override immediately after toggleStar", async () => {
      mockUpdateConsultation.mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useFavorites({ consultations: defaultConsultations })
      );

      // c1 starts as false; after toggle the optimistic value should be true
      await act(async () => {
        await result.current.toggleStar(c1);
      });

      expect(result.current.isFavorite("id-1")).toBe(true);
    });

    it("defaults to false for a consultation ID not in the list", () => {
      const { result } = renderHook(() =>
        useFavorites({ consultations: defaultConsultations })
      );

      expect(result.current.isFavorite("unknown-id")).toBe(false);
    });
  });

  describe("sortedConsultations", () => {
    it("returns consultations unchanged when there are no optimistic updates", () => {
      const { result } = renderHook(() =>
        useFavorites({ consultations: defaultConsultations })
      );

      // Same reference — no map/spread overhead when map is empty
      expect(result.current.sortedConsultations).toBe(defaultConsultations);
    });

    it("applies the optimistic favorite override to the matching consultation", async () => {
      mockUpdateConsultation.mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useFavorites({ consultations: defaultConsultations })
      );

      await act(async () => {
        await result.current.toggleStar(c1);
      });

      const updated = result.current.sortedConsultations.find((c) => c.id === "id-1");
      expect(updated?.favorite).toBe(true);

      // Other consultations are unaffected
      const unchanged = result.current.sortedConsultations.find((c) => c.id === "id-2");
      expect(unchanged?.favorite).toBe(true); // original db value
    });

    it("does not modify consultations whose favorite already matches the optimistic value", async () => {
      mockUpdateConsultation.mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useFavorites({ consultations: defaultConsultations })
      );

      // c2 already has favorite = true; toggling would set optimistic to false
      await act(async () => {
        await result.current.toggleStar(c2);
      });

      const updated = result.current.sortedConsultations.find((c) => c.id === "id-2");
      // Optimistic value is now false (toggled from true)
      expect(updated?.favorite).toBe(false);
    });
  });

  describe("toggleStar", () => {
    it("applies an optimistic update immediately (before the API call resolves)", () => {
      let resolveUpdate!: (value: { success: boolean }) => void;
      mockUpdateConsultation.mockReturnValue(
        new Promise<{ success: boolean }>((res) => {
          resolveUpdate = res;
        })
      );

      const { result } = renderHook(() =>
        useFavorites({ consultations: defaultConsultations })
      );

      // Fire toggle but don't await — inspect state synchronously
      act(() => {
        void result.current.toggleStar(c1);
      });

      // Optimistic update applied immediately
      expect(result.current.isFavorite("id-1")).toBe(true);

      // Clean up pending promise
      act(() => {
        resolveUpdate({ success: true });
      });
    });

    it("calls onFavoriteToggle on success", async () => {
      mockUpdateConsultation.mockResolvedValue({ success: true });
      const onFavoriteToggle = vi.fn();

      const { result } = renderHook(() =>
        useFavorites({ consultations: defaultConsultations, onFavoriteToggle })
      );

      await act(async () => {
        await result.current.toggleStar(c1);
      });

      expect(onFavoriteToggle).toHaveBeenCalledOnce();
    });

    it("keeps the optimistic update in place after a successful API call", async () => {
      mockUpdateConsultation.mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useFavorites({ consultations: defaultConsultations })
      );

      await act(async () => {
        await result.current.toggleStar(c1);
      });

      // Optimistic state persists (cleanup happens when consultations prop refreshes)
      expect(result.current.isFavorite("id-1")).toBe(true);
    });

    it("reverts the optimistic update when updateConsultation returns success = false", async () => {
      mockUpdateConsultation.mockResolvedValue({ success: false, error: "db error" });

      const { result } = renderHook(() =>
        useFavorites({ consultations: defaultConsultations })
      );

      await act(async () => {
        await result.current.toggleStar(c1);
      });

      // Reverted — isFavorite now falls back to the DB value (false)
      expect(result.current.isFavorite("id-1")).toBe(false);
    });

    it("does not call onFavoriteToggle when updateConsultation returns success = false", async () => {
      mockUpdateConsultation.mockResolvedValue({ success: false, error: "db error" });
      const onFavoriteToggle = vi.fn();

      const { result } = renderHook(() =>
        useFavorites({ consultations: defaultConsultations, onFavoriteToggle })
      );

      await act(async () => {
        await result.current.toggleStar(c1);
      });

      expect(onFavoriteToggle).not.toHaveBeenCalled();
    });

    it("reverts the optimistic update when updateConsultation throws an error", async () => {
      mockUpdateConsultation.mockRejectedValue(new Error("network error"));

      const { result } = renderHook(() =>
        useFavorites({ consultations: defaultConsultations })
      );

      await act(async () => {
        await result.current.toggleStar(c1);
      });

      // Reverted — falls back to DB value
      expect(result.current.isFavorite("id-1")).toBe(false);
    });

    it("does not call onFavoriteToggle when updateConsultation throws", async () => {
      mockUpdateConsultation.mockRejectedValue(new Error("network error"));
      const onFavoriteToggle = vi.fn();

      const { result } = renderHook(() =>
        useFavorites({ consultations: defaultConsultations, onFavoriteToggle })
      );

      await act(async () => {
        await result.current.toggleStar(c1);
      });

      expect(onFavoriteToggle).not.toHaveBeenCalled();
    });

    it("toggles from true to false when the consultation is currently a favorite", async () => {
      mockUpdateConsultation.mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useFavorites({ consultations: defaultConsultations })
      );

      // c2 starts as true — toggle should flip to false
      await act(async () => {
        await result.current.toggleStar(c2);
      });

      expect(result.current.isFavorite("id-2")).toBe(false);
    });
  });

  describe("optimistic cleanup on consultations prop update", () => {
    it("removes the entry from the map when the DB value matches the optimistic value", async () => {
      mockUpdateConsultation.mockResolvedValue({ success: true });

      // Start with c1 (favorite = false); after toggle, optimistic = true
      const { result, rerender } = renderHook(
        (props: { consultations: typeof defaultConsultations }) =>
          useFavorites({ consultations: props.consultations }),
        { initialProps: { consultations: defaultConsultations } }
      );

      await act(async () => {
        await result.current.toggleStar(c1);
      });

      // Optimistic value is true; isFavorite reports true
      expect(result.current.isFavorite("id-1")).toBe(true);

      // Simulate server refresh: c1 now has favorite = true in DB
      const refreshed = [
        makeConsultationMGF({ id: "id-1", favorite: true }),
        c2,
        c3,
      ];

      act(() => {
        rerender({ consultations: refreshed });
      });

      // DB value matches optimistic — entry is cleaned up; still reports true (from DB now)
      expect(result.current.isFavorite("id-1")).toBe(true);
      // sortedConsultations should be the same reference as the input (optimisticFavorites is now empty)
      expect(result.current.sortedConsultations).toBe(refreshed);
    });

    it("keeps the optimistic entry when the DB value still differs from the optimistic value", async () => {
      mockUpdateConsultation.mockResolvedValue({ success: true });

      const { result, rerender } = renderHook(
        (props: { consultations: typeof defaultConsultations }) =>
          useFavorites({ consultations: props.consultations }),
        { initialProps: { consultations: defaultConsultations } }
      );

      await act(async () => {
        await result.current.toggleStar(c1);
      });

      // Optimistic value is true
      expect(result.current.isFavorite("id-1")).toBe(true);

      // Simulate a refresh where c1 still has favorite = false (DB hasn't caught up)
      act(() => {
        rerender({ consultations: defaultConsultations });
      });

      // Optimistic update is preserved
      expect(result.current.isFavorite("id-1")).toBe(true);
    });
  });
});
