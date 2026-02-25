import { useState, useCallback, useMemo } from "react";
import { Comic } from "../types";

interface UseOptimisticComicsOptions {
  onUpdateSuccess?: (comic: Comic) => void;
  onUpdateError?: (error: string, comic: Comic) => void;
}

/**
 * Hook for managing optimistic updates to comics without triggering loading states
 * Maintains a local cache that merges server data with optimistic updates
 */
export const useOptimisticComics = (
  serverComics: Comic[],
  options: UseOptimisticComicsOptions = {}
) => {
  const { onUpdateSuccess, onUpdateError } = options;

  // Track optimistic updates separately from server state
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<string, Comic>
  >(new Map());

  // Track which comics are currently being updated
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());

  /**
   * Merge server comics with optimistic updates (optimistic wins)
   */
  const mergedComics = useMemo<Comic[]>(() => {
    // Merge server comics with optimistic updates (optimistic wins)
    return serverComics.map(
      (comic) => optimisticUpdates.get(comic.id) ?? comic
    );
  }, [serverComics, optimisticUpdates]);

  /**
   * Apply an optimistic update immediately
   */
  const applyOptimisticUpdate = useCallback((comic: Comic) => {
    if (!comic.id) {
      console.error("Cannot apply optimistic update: comic missing ID");
      return;
    }
    setOptimisticUpdates((prev) => {
      const next = new Map(prev);
      next.set(comic.id, comic);
      return next;
    });

    setPendingUpdates((prev) => {
      const next = new Set(prev);
      next.add(comic.id);
      return next;
    });
  }, []);

  /**
   * Confirm a successful update from the server
   */
  const confirmUpdate = useCallback(
    (comic: Comic) => {
      if (!comic.id) return;

      // Keep the confirmed version optimistically until serverComics catches up
      setOptimisticUpdates((prev) => {
        const next = new Map(prev);
        next.set(comic.id, comic);
        return next;
      });

      // Remove from pending
      setPendingUpdates((prev) => {
        const next = new Set(prev);
        next.delete(comic.id);
        return next;
      });
      onUpdateSuccess?.(comic);
    },
    [onUpdateSuccess]
  );

  /**
   * Revert an optimistic update on error
   */
  const revertUpdate = useCallback(
    (comicId: string, originalComic?: Comic) => {
      // Remove optimistic update
      setOptimisticUpdates((prev) => {
        const next = new Map(prev);
        next.delete(comicId);
        return next;
      });

      // Remove from pending
      setPendingUpdates((prev) => {
        const next = new Set(prev);
        next.delete(comicId);
        return next;
      });

      if (originalComic) {
        onUpdateError?.("Update failed", originalComic);
      }
    },
    [onUpdateError]
  );

  /**
   * Check if a comic is currently being updated
   */
  const isUpdating = useCallback(
    (comicId: string): boolean => {
      return pendingUpdates.has(comicId);
    },
    [pendingUpdates]
  );

  /**
   * Clear all optimistic updates (useful for error recovery)
   */
  const clearOptimisticUpdates = useCallback(() => {
    setOptimisticUpdates(new Map());
    setPendingUpdates(new Set());
  }, []);

  /**
   * Sync with new server data without losing optimistic updates
   * This is called when background refetch completes
   */
  const syncWithServer = useCallback((newServerComics: Comic[]) => {
    // Remove optimistic entries that now match the server
    setOptimisticUpdates((prev) => {
      const next = new Map(prev);

      newServerComics.forEach((srv) => {
        const opt = next.get(srv.id);
        if (
          opt &&
          opt.collected === srv.collected &&
          opt.isGrail === srv.isGrail
        ) {
          next.delete(srv.id);
        }
      });
      return next;
    });
  }, []);

  return {
    // The merged comics list (server + optimistic)
    comics: mergedComics,

    // Methods for managing optimistic updates
    applyOptimisticUpdate,
    confirmUpdate,
    revertUpdate,
    isUpdating,
    clearOptimisticUpdates,
    syncWithServer,

    // State info
    hasPendingUpdates: pendingUpdates.size > 0,
    pendingUpdateCount: pendingUpdates.size,
  };
};
