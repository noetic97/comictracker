import { useState, useCallback } from "react";
import { Comic } from "../types";
import {
  toggleComicCollected,
  toggleComicGrail,
  createOptimisticUpdate,
  StateChangeResult,
} from "../utils/comicStateManager";

export interface ComicActionsState {
  isUpdating: boolean;
  updatingComics: Set<string>; // Comic IDs currently being updated
  errors: Map<string, string>; // Comic ID -> error message
  lastOperation: string | null;
}

export interface ComicActionsOptions {
  onComicUpdated?: (updatedComic: Comic) => void;
  onError?: (error: string, comic: Comic) => void;
  optimisticUpdates?: boolean;
}

export const useComicActions = (options: ComicActionsOptions = {}) => {
  const { onComicUpdated, onError, optimisticUpdates = true } = options;

  const [state, setState] = useState<ComicActionsState>({
    isUpdating: false,
    updatingComics: new Set(),
    errors: new Map(),
    lastOperation: null,
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<ComicActionsState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
      // Handle Set and Map updates properly
      updatingComics: updates.updatingComics || prev.updatingComics,
      errors: updates.errors || prev.errors,
    }));
  }, []);

  // Add comic to updating list
  const setComicUpdating = useCallback(
    (comicId: string, isUpdating: boolean) => {
      setState((prev) => {
        const newUpdatingComics = new Set(prev.updatingComics);
        if (isUpdating) {
          newUpdatingComics.add(comicId);
        } else {
          newUpdatingComics.delete(comicId);
        }

        return {
          ...prev,
          updatingComics: newUpdatingComics,
          isUpdating: newUpdatingComics.size > 0,
        };
      });
    },
    []
  );

  // Set error for comic
  const setComicError = useCallback((comicId: string, error: string | null) => {
    setState((prev) => {
      const newErrors = new Map(prev.errors);
      if (error) {
        newErrors.set(comicId, error);
      } else {
        newErrors.delete(comicId);
      }

      return {
        ...prev,
        errors: newErrors,
      };
    });
  }, []);

  // Handle collected status toggle
  const handleCollectedToggle = useCallback(
    async (comic: Comic) => {
      if (!comic.id) {
        console.error("Cannot toggle collected: comic missing ID", comic);
        onError?.("Comic missing ID", comic);
        return null;
      }

      // Check if already updating
      if (state.updatingComics.has(comic.id)) {
        console.warn("Comic already being updated:", comic.id);
        return null;
      }

      console.log(
        `🔄 Starting collected toggle for ${comic.series} #${comic.issue}`
      );

      // Clear any previous errors
      setComicError(comic.id, null);
      setComicUpdating(comic.id, true);

      // Optimistic update
      let optimisticComic: Comic | null = null;
      if (optimisticUpdates) {
        optimisticComic = createOptimisticUpdate(comic, "collected");
        onComicUpdated?.(optimisticComic);
      }

      try {
        updateState({
          lastOperation: `Updating ${comic.series} #${comic.issue}...`,
        });

        const result: StateChangeResult = await toggleComicCollected(comic, {
          onProgress: (status) => {
            updateState({ lastOperation: status });
          },
        });

        if (result.success && result.comic) {
          console.log(
            `✅ Collected toggle successful for ${comic.series} #${comic.issue}`
          );
          updateState({
            lastOperation: `Updated ${comic.series} #${comic.issue}`,
          });
          onComicUpdated?.(result.comic);
          return result.comic;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error: any) {
        console.error(
          `❌ Collected toggle failed for ${comic.series} #${comic.issue}:`,
          error
        );

        const errorMessage =
          error.message || "Failed to update collected status";
        setComicError(comic.id, errorMessage);
        updateState({ lastOperation: `Failed: ${errorMessage}` });

        // Revert optimistic update
        if (optimisticUpdates && optimisticComic) {
          onComicUpdated?.(comic); // Revert to original
        }

        onError?.(errorMessage, comic);
        return null;
      } finally {
        setComicUpdating(comic.id, false);
      }
    },
    [
      state.updatingComics,
      optimisticUpdates,
      onComicUpdated,
      onError,
      setComicError,
      setComicUpdating,
      updateState,
    ]
  );

  // Handle grail status toggle
  const handleGrailToggle = useCallback(
    async (comic: Comic) => {
      if (!comic.id) {
        console.error("Cannot toggle grail: comic missing ID", comic);
        onError?.("Comic missing ID", comic);
        return null;
      }

      // Check if already updating
      if (state.updatingComics.has(comic.id)) {
        console.warn("Comic already being updated:", comic.id);
        return null;
      }

      console.log(
        `⭐ Starting grail toggle for ${comic.series} #${comic.issue}`
      );

      // Clear any previous errors
      setComicError(comic.id, null);
      setComicUpdating(comic.id, true);

      // Optimistic update
      let optimisticComic: Comic | null = null;
      if (optimisticUpdates) {
        optimisticComic = createOptimisticUpdate(comic, "grail");
        onComicUpdated?.(optimisticComic);
      }

      try {
        updateState({
          lastOperation: `Updating grail status for ${comic.series} #${comic.issue}...`,
        });

        const result: StateChangeResult = await toggleComicGrail(comic, {
          onProgress: (status) => {
            updateState({ lastOperation: status });
          },
        });

        if (result.success && result.comic) {
          console.log(
            `✅ Grail toggle successful for ${comic.series} #${comic.issue}`
          );
          updateState({
            lastOperation: `Updated ${comic.series} #${comic.issue}`,
          });
          onComicUpdated?.(result.comic);
          return result.comic;
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error: any) {
        console.error(
          `❌ Grail toggle failed for ${comic.series} #${comic.issue}:`,
          error
        );

        const errorMessage = error.message || "Failed to update grail status";
        setComicError(comic.id, errorMessage);
        updateState({ lastOperation: `Failed: ${errorMessage}` });

        // Revert optimistic update
        if (optimisticUpdates && optimisticComic) {
          onComicUpdated?.(comic); // Revert to original
        }

        onError?.(errorMessage, comic);
        return null;
      } finally {
        setComicUpdating(comic.id, false);
      }
    },
    [
      state.updatingComics,
      optimisticUpdates,
      onComicUpdated,
      onError,
      setComicError,
      setComicUpdating,
      updateState,
    ]
  );

  // Clear all errors
  const clearErrors = useCallback(() => {
    updateState({
      errors: new Map(),
      lastOperation: null,
    });
  }, [updateState]);

  // Get error for specific comic
  const getComicError = useCallback(
    (comicId: string) => {
      return state.errors.get(comicId) || null;
    },
    [state.errors]
  );

  // Check if comic is updating
  const isComicUpdating = useCallback(
    (comicId: string) => {
      return state.updatingComics.has(comicId);
    },
    [state.updatingComics]
  );

  return {
    // State
    isUpdating: state.isUpdating,
    lastOperation: state.lastOperation,
    hasErrors: state.errors.size > 0,
    errorCount: state.errors.size,
    updatingCount: state.updatingComics.size,

    // Actions
    handleCollectedToggle,
    handleGrailToggle,
    clearErrors,

    // Utilities
    getComicError,
    isComicUpdating,
    getAllErrors: () => Array.from(state.errors.entries()),
    getUpdatingComics: () => Array.from(state.updatingComics),
  };
};
