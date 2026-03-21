import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeleteMode } from "@/hooks/consultations/use-consultation-delete-mode";
import { makeConsultationMGF } from "../../factories/consultation";

const c1 = makeConsultationMGF({ id: "id-1" });
const c2 = makeConsultationMGF({ id: "id-2" });
const c3 = makeConsultationMGF({ id: "id-3" });
const defaultConsultations = [c1, c2, c3];

describe("useDeleteMode", () => {
  describe("initial state", () => {
    it("starts with isDeleteMode = false, empty selectedIds, and filteredConsultations = consultations", () => {
      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations })
      );

      expect(result.current.isDeleteMode).toBe(false);
      expect(result.current.selectedIds.size).toBe(0);
      expect(result.current.filteredConsultations).toEqual(defaultConsultations);
    });
  });

  describe("toggleDeleteMode", () => {
    it("flips isDeleteMode from false to true", () => {
      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations })
      );

      act(() => { result.current.toggleDeleteMode(); });

      expect(result.current.isDeleteMode).toBe(true);
    });

    it("flips isDeleteMode back to false on second call", () => {
      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations })
      );

      act(() => { result.current.toggleDeleteMode(); });
      act(() => { result.current.toggleDeleteMode(); });

      expect(result.current.isDeleteMode).toBe(false);
    });

    it("clears selectedIds when toggled", () => {
      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations })
      );

      act(() => { result.current.toggleDeleteMode(); });
      act(() => { result.current.toggleSelectRow("id-1"); });
      expect(result.current.selectedIds.size).toBe(1);

      act(() => { result.current.toggleDeleteMode(); });
      expect(result.current.selectedIds.size).toBe(0);
    });
  });

  describe("toggleSelectRow", () => {
    it("adds an id to selectedIds when not already selected", () => {
      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations })
      );

      act(() => { result.current.toggleSelectRow("id-1"); });

      expect(result.current.selectedIds.has("id-1")).toBe(true);
    });

    it("removes an id from selectedIds when already selected", () => {
      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations })
      );

      act(() => { result.current.toggleSelectRow("id-1"); });
      act(() => { result.current.toggleSelectRow("id-1"); });

      expect(result.current.selectedIds.has("id-1")).toBe(false);
    });

    it("can independently select and deselect multiple rows", () => {
      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations })
      );

      act(() => { result.current.toggleSelectRow("id-1"); });
      act(() => { result.current.toggleSelectRow("id-2"); });
      act(() => { result.current.toggleSelectRow("id-1"); });

      expect(result.current.selectedIds.has("id-1")).toBe(false);
      expect(result.current.selectedIds.has("id-2")).toBe(true);
    });
  });

  describe("toggleSelectAll", () => {
    it("selects all filtered consultations when none are selected", () => {
      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations })
      );

      act(() => { result.current.toggleSelectAll(); });

      expect(result.current.selectedIds.size).toBe(3);
      expect(result.current.selectedIds.has("id-1")).toBe(true);
      expect(result.current.selectedIds.has("id-2")).toBe(true);
      expect(result.current.selectedIds.has("id-3")).toBe(true);
    });

    it("deselects all when all filtered consultations are already selected", () => {
      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations })
      );

      act(() => { result.current.toggleSelectAll(); });
      act(() => { result.current.toggleSelectAll(); });

      expect(result.current.selectedIds.size).toBe(0);
    });

    it("uses the filtered list (excludes optimistically deleted) for select-all", async () => {
      const onBulkDelete = vi.fn().mockResolvedValue({ deletedIds: ["id-1"], failedIds: [] });

      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations, onBulkDelete })
      );

      // Select id-1 and delete it optimistically
      act(() => { result.current.toggleSelectRow("id-1"); });
      await act(async () => { await result.current.handleBulkDelete(); });

      // Now select-all should only cover id-2 and id-3
      act(() => { result.current.toggleSelectAll(); });

      expect(result.current.selectedIds.size).toBe(2);
      expect(result.current.selectedIds.has("id-1")).toBe(false);
      expect(result.current.selectedIds.has("id-2")).toBe(true);
      expect(result.current.selectedIds.has("id-3")).toBe(true);
    });
  });

  describe("handleBulkDelete", () => {
    it("does nothing when selectedIds is empty", async () => {
      const onBulkDelete = vi.fn();
      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations, onBulkDelete })
      );

      await act(async () => { await result.current.handleBulkDelete(); });

      expect(onBulkDelete).not.toHaveBeenCalled();
      expect(result.current.filteredConsultations).toEqual(defaultConsultations);
    });

    it("does nothing when onBulkDelete is not provided", async () => {
      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations })
      );

      act(() => { result.current.toggleSelectRow("id-1"); });
      await act(async () => { await result.current.handleBulkDelete(); });

      // Should still show all (no optimistic deletion happened)
      expect(result.current.filteredConsultations).toEqual(defaultConsultations);
    });

    it("optimistically removes selected IDs from filteredConsultations immediately", async () => {
      // Use a promise that doesn't resolve immediately to inspect intermediate state
      let resolveDelete!: (value: { deletedIds: string[]; failedIds: string[] }) => void;
      const onBulkDelete = vi.fn(() => new Promise<{ deletedIds: string[]; failedIds: string[] }>((res) => { resolveDelete = res; }));

      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations, onBulkDelete })
      );

      act(() => { result.current.toggleSelectRow("id-1"); });

      // Start bulk delete but don't await it — check optimistic state synchronously
      act(() => { void result.current.handleBulkDelete(); });

      expect(result.current.filteredConsultations.map((c) => c.id)).not.toContain("id-1");
      expect(result.current.filteredConsultations).toHaveLength(2);

      // Resolve to clean up the pending promise
      await act(async () => { resolveDelete({ deletedIds: ["id-1"], failedIds: [] }); });
    });

    it("clears selectedIds and exits delete mode before onBulkDelete resolves", async () => {
      let resolveDelete!: (value: { deletedIds: string[]; failedIds: string[] }) => void;
      const onBulkDelete = vi.fn(() => new Promise<{ deletedIds: string[]; failedIds: string[] }>((res) => { resolveDelete = res; }));

      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations, onBulkDelete })
      );

      act(() => { result.current.toggleDeleteMode(); });
      act(() => { result.current.toggleSelectRow("id-1"); });

      act(() => { void result.current.handleBulkDelete(); });

      // Before the promise resolves, selection is cleared and delete mode is off
      expect(result.current.selectedIds.size).toBe(0);
      expect(result.current.isDeleteMode).toBe(false);

      await act(async () => { resolveDelete({ deletedIds: ["id-1"], failedIds: [] }); });
    });

    it("keeps deleted items hidden after successful deletion with no failed IDs", async () => {
      const onBulkDelete = vi.fn().mockResolvedValue({ deletedIds: ["id-1"], failedIds: [] });

      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations, onBulkDelete })
      );

      act(() => { result.current.toggleSelectRow("id-1"); });
      await act(async () => { await result.current.handleBulkDelete(); });

      expect(result.current.filteredConsultations.map((c) => c.id)).not.toContain("id-1");
      expect(result.current.filteredConsultations).toHaveLength(2);
    });

    it("reverts only the failed IDs back into filteredConsultations on partial failure", async () => {
      const onBulkDelete = vi.fn().mockResolvedValue({
        deletedIds: ["id-1"],
        failedIds: ["id-2"],
      });

      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations, onBulkDelete })
      );

      act(() => { result.current.toggleSelectRow("id-1"); });
      act(() => { result.current.toggleSelectRow("id-2"); });
      await act(async () => { await result.current.handleBulkDelete(); });

      const ids = result.current.filteredConsultations.map((c) => c.id);
      // id-1 succeeded — stays hidden
      expect(ids).not.toContain("id-1");
      // id-2 failed — reverted back
      expect(ids).toContain("id-2");
      expect(ids).toContain("id-3");
    });

    it("reverts all IDs when onBulkDelete throws an error", async () => {
      const onBulkDelete = vi.fn().mockRejectedValue(new Error("network error"));

      const { result } = renderHook(() =>
        useDeleteMode({ consultations: defaultConsultations, onBulkDelete })
      );

      act(() => { result.current.toggleSelectRow("id-1"); });
      act(() => { result.current.toggleSelectRow("id-2"); });
      await act(async () => { await result.current.handleBulkDelete(); });

      // All deletions reverted
      expect(result.current.filteredConsultations).toHaveLength(3);
    });
  });

  describe("optimistic cleanup on consultations prop update", () => {
    it("removes an ID from optimisticDeletions when it no longer appears in the updated consultations", async () => {
      const onBulkDelete = vi.fn().mockResolvedValue({ deletedIds: ["id-1"], failedIds: [] });

      let consultations = defaultConsultations;
      const { result, rerender } = renderHook(
        (props: { consultations: typeof defaultConsultations }) =>
          useDeleteMode({ consultations: props.consultations, onBulkDelete }),
        { initialProps: { consultations } }
      );

      act(() => { result.current.toggleSelectRow("id-1"); });
      await act(async () => { await result.current.handleBulkDelete(); });

      // id-1 is still in optimisticDeletions, filteredConsultations excludes it
      expect(result.current.filteredConsultations.map((c) => c.id)).not.toContain("id-1");

      // Simulate a data refresh: id-1 is now truly gone from server data
      consultations = [c2, c3];
      act(() => { rerender({ consultations }); });

      // filteredConsultations still excludes id-1 (it's gone from source too)
      // but optimisticDeletions is cleaned up — no stale entry
      expect(result.current.filteredConsultations).toHaveLength(2);
      expect(result.current.filteredConsultations.map((c) => c.id)).not.toContain("id-1");
    });

    it("keeps an ID in optimisticDeletions when it still appears in the updated consultations", async () => {
      // This happens when the server hasn't confirmed deletion yet (e.g., partial refresh)
      const onBulkDelete = vi.fn().mockResolvedValue({ deletedIds: ["id-1"], failedIds: [] });

      const consultations = defaultConsultations;
      const { result, rerender } = renderHook(
        (props: { consultations: typeof defaultConsultations }) =>
          useDeleteMode({ consultations: props.consultations, onBulkDelete }),
        { initialProps: { consultations } }
      );

      act(() => { result.current.toggleSelectRow("id-1"); });
      await act(async () => { await result.current.handleBulkDelete(); });

      // id-1 is still optimistically hidden
      expect(result.current.filteredConsultations.map((c) => c.id)).not.toContain("id-1");

      // Simulate a refresh where id-1 is still in the server response (e.g., delete not yet propagated)
      act(() => { rerender({ consultations }); });

      // id-1 stays hidden (still in optimisticDeletions)
      expect(result.current.filteredConsultations.map((c) => c.id)).not.toContain("id-1");
    });
  });
});
