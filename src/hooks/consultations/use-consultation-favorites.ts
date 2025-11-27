import { useState, useEffect, useMemo } from "react";
import type { ConsultationMGF } from "@/lib/api/consultations";
import { updateConsultation } from "@/lib/api/consultations";
import type { UseFavoritesProps } from "./types";

export function useFavorites({
  consultations,
  onFavoriteToggle,
}: UseFavoritesProps) {
  const [optimisticFavorites, setOptimisticFavorites] = useState<
    Map<string, boolean>
  >(new Map());

  // Clear optimistic updates when database value matches optimistic value
  // Keep updates if consultation isn't found (might be on different page)
  useEffect(() => {
    setOptimisticFavorites((prev) => {
      const next = new Map(prev);
      let hasChanges = false;

      prev.forEach((optimisticValue, id) => {
        const consultation = consultations.find((c) => c.id === id);
        if (consultation) {
          const dbValue = consultation.favorite ?? false;
          if (dbValue === optimisticValue) {
            next.delete(id);
            hasChanges = true;
          }
        }
      });

      return hasChanges ? next : prev;
    });
  }, [consultations]);

  // Apply optimistic updates to consultations
  // Backend handles sorting, so we only need to reflect optimistic changes
  const sortedConsultations = useMemo(() => {
    if (optimisticFavorites.size === 0) {
      return consultations;
    }

    return consultations.map((consultation) => {
      const optimisticFavorite = optimisticFavorites.get(consultation.id!);
      if (optimisticFavorite !== undefined && consultation.favorite !== optimisticFavorite) {
        return { ...consultation, favorite: optimisticFavorite };
      }
      return consultation;
    });
  }, [consultations, optimisticFavorites]);

  const toggleStar = async (consultation: ConsultationMGF) => {
    const id = consultation.id!;
    const currentFavorite =
      optimisticFavorites.get(id) ?? consultation.favorite ?? false;
    const newFavorite = !currentFavorite;

    // Apply optimistic update immediately
    setOptimisticFavorites((prev) => {
      const next = new Map(prev);
      next.set(id, newFavorite);
      return next;
    });

    try {
      const result = await updateConsultation(id, {
        favorite: newFavorite,
      });

      if (!result.success) {
        // Revert on error
        setOptimisticFavorites((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        console.error("Failed to update favorite:", result.error);
        return;
      }

      // Success: keep optimistic update, notify parent to refresh
      onFavoriteToggle?.();
    } catch (error) {
      // Revert on error
      setOptimisticFavorites((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      console.error("Error updating favorite:", error);
    }
  };

  const isFavorite = (id: string): boolean => {
    const consultation = consultations.find((c) => c.id === id);
    return optimisticFavorites.get(id) ?? consultation?.favorite ?? false;
  };

  return {
    sortedConsultations,
    toggleStar,
    isFavorite,
  };
}
