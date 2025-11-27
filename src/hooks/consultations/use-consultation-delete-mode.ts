import { useState, useEffect, useMemo } from "react";
import type { UseDeleteModeProps } from "./types";

export function useDeleteMode({
  consultations,
  onBulkDelete,
}: UseDeleteModeProps) {
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Track optimistically deleted IDs
  const [optimisticDeletions, setOptimisticDeletions] = useState<
    Set<string>
  >(new Set());

  // Clear optimistic deletions when consultations change (data refreshed)
  // Only clear if the consultation no longer exists in the new data
  useEffect(() => {
    setOptimisticDeletions((prev) => {
      const next = new Set(prev);
      let hasChanges = false;

      prev.forEach((id) => {
        // If consultation no longer exists in the data, it was successfully deleted
        const stillExists = consultations.some((c) => c.id === id);
        if (!stillExists) {
          next.delete(id);
          hasChanges = true;
        }
      });

      return hasChanges ? next : prev;
    });
  }, [consultations]);

  // Filter out optimistically deleted consultations
  const filteredConsultations = useMemo(() => {
    return consultations.filter(
      (consultation) => !optimisticDeletions.has(consultation.id!)
    );
  }, [consultations, optimisticDeletions]);

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    // Use filtered consultations for select all
    if (selectedIds.size === filteredConsultations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredConsultations.map((c) => c.id!)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0 || !onBulkDelete) return;

    const idsToDelete = Array.from(selectedIds);

    // Optimistic update: immediately remove from UI
    setOptimisticDeletions((prev) => {
      const next = new Set(prev);
      idsToDelete.forEach((id) => next.add(id));
      return next;
    });

    // Clear selection and exit delete mode
    setSelectedIds(new Set());
    setIsDeleteMode(false);

    try {
      // Call the delete handler
      const result = await onBulkDelete(idsToDelete);

      // Revert optimistic deletions for failed IDs
      if (result.failedIds.length > 0) {
        setOptimisticDeletions((prev) => {
          const next = new Set(prev);
          result.failedIds.forEach((id) => next.delete(id));
          return next;
        });
      }
    } catch (error) {
      // On error, revert all optimistic deletions
      setOptimisticDeletions((prev) => {
        const next = new Set(prev);
        idsToDelete.forEach((id) => next.delete(id));
        return next;
      });
      console.error("Error during bulk delete:", error);
    }
  };

  return {
    isDeleteMode,
    selectedIds,
    filteredConsultations,
    toggleDeleteMode,
    toggleSelectAll,
    toggleSelectRow,
    handleBulkDelete,
  };
}

