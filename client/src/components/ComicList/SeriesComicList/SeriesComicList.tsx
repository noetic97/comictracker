import React, { useCallback } from "react";
import { Star, Check } from "lucide-react";
import { Comic, FilterOption } from "../../../types";
import {
  useSeriesComics,
  useOptimisticComics,
  useComicActions,
} from "../../../hooks";
import PaginationControls from "../PaginationControls";
import { logger } from "../../../utils/logger";
import * as S from "./styles";

interface SeriesComicsListProps {
  publisher: string;
  series: string;
  volume?: string;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  totalIssues: number;
  filterOption: FilterOption;
  onStatsRefresh?: (() => Promise<any>) | null;
}

const SeriesComicsList: React.FC<SeriesComicsListProps> = ({
  publisher,
  series,
  volume,
  currentPage,
  itemsPerPage,
  onPageChange,
  totalIssues,
  filterOption,
  onStatsRefresh,
}) => {
  const {
    comics: serverComics,
    loading,
    error,
    silentRefetch,
    updateComic,
  } = useSeriesComics(
    publisher,
    series,
    volume || null,
    currentPage,
    itemsPerPage,
    true,
    { filterOption }
  );

  // Use optimistic comics hook for immediate UI updates
  const {
    comics,
    applyOptimisticUpdate,
    confirmUpdate,
    revertUpdate,
    isUpdating,
    syncWithServer,
  } = useOptimisticComics(serverComics, {
    onUpdateSuccess: (updatedComic) => {
      logger.comics.info("Comic update confirmed", updatedComic);
      // Silently refetch to ensure consistency
      silentRefetch().then((newComics) => {
        if (newComics) {
          syncWithServer(newComics);
        }
      });
      // Refresh global stats when comics are updated
      logger.stats.debug("Attempting to refresh stats", {
        hasCallback: !!onStatsRefresh,
        isFunction: typeof onStatsRefresh === "function",
      });
      if (onStatsRefresh && typeof onStatsRefresh === "function") {
        onStatsRefresh();
        logger.stats.info("Stats refreshed successfully");
      }
    },
    onUpdateError: (error, comic) => {
      logger.comics.error("Comic update failed", { error, comic });
    },
  });

  // Handle comic actions with optimistic updates
  const comicActions = useComicActions({
    onComicUpdated: useCallback(
      (updatedComic: Comic) => {
        // Confirm the update was successful
        confirmUpdate(updatedComic);
        // Update the single comic in the background
        updateComic({
          ...updatedComic,
          isGrail: updatedComic.isGrail ?? false,
        });
      },
      [confirmUpdate, updateComic]
    ),
    onError: useCallback(
      (error: string, comic: Comic) => {
        console.error("Comic action failed:", error, comic);
        // Revert the optimistic update on error
        revertUpdate(comic.id, comic);
      },
      [revertUpdate]
    ),
    optimisticUpdates: false, // We handle optimistic updates ourselves
  });

  // Internal action handlers
  const handleCollect = useCallback(
    async (id: string) => {
      const comic = comics.find((c) => c.id === id);
      if (!comic || isUpdating(id)) {
        return;
      }

      // Apply optimistic update immediately
      const optimisticComic = {
        ...comic,
        collected: !comic.collected,
      };
      applyOptimisticUpdate(optimisticComic);

      // Perform the actual update
      const result = await comicActions.handleCollectedToggle(comic);

      if (!result) {
        // Revert on failure
        revertUpdate(id, comic);
      }
    },
    [comics, comicActions, applyOptimisticUpdate, revertUpdate, isUpdating]
  );

  const handleToggleGrail = useCallback(
    async (id: string) => {
      const comic = comics.find((c) => c.id === id);
      if (!comic || isUpdating(id)) {
        return;
      }

      // Apply optimistic update immediately
      const optimisticComic = {
        ...comic,
        isGrail: !comic.isGrail,
      };
      applyOptimisticUpdate(optimisticComic);

      // Perform the actual update
      const result = await comicActions.handleGrailToggle(comic);

      if (!result) {
        // Revert on failure
        revertUpdate(id, comic);
      }
    },
    [comics, comicActions, applyOptimisticUpdate, revertUpdate, isUpdating]
  );

  const totalPages = Math.max(1, Math.ceil(totalIssues / itemsPerPage));

  if (loading) {
    return <div style={{ padding: "1rem" }}>Loading comics...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "1rem", color: "#ffdddd" }}>
        Failed to load comics: {error}
      </div>
    );
  }

  return (
    <>
      {comics.map((comic) => (
        <S.ComicItem
          key={comic.id}
          $collected={comic.collected}
          $isGrail={comic.isGrail}
          data-sc="ComicItem"
          style={{
            opacity: isUpdating(comic.id) ? 0.7 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          <S.ComicInfo data-sc="ComicInfo">
            <S.ComicTitle data-sc="ComicTitle">
              {comic.series}
              {comic.volume && ` - ${comic.volume}`} #{comic.issue}
              {comic.isGrail && (
                <S.GrailBadge>
                  <Star size={14} fill="currentColor" />
                </S.GrailBadge>
              )}
            </S.ComicTitle>
            <S.ComicMeta data-sc="ComicMeta">
              <span>Years: {comic.years}</span>
              <S.ComicValue>
                ${comic.currentValue?.toLocaleString()}
              </S.ComicValue>
            </S.ComicMeta>
          </S.ComicInfo>
          <S.ComicActions>
            <S.ActionButton
              onClick={() => handleToggleGrail(comic.id)}
              $isActive={comic.isGrail}
              disabled={isUpdating(comic.id)}
              title={comic.isGrail ? "Remove from grails" : "Mark as grail"}
              style={{
                cursor: isUpdating(comic.id) ? "not-allowed" : "pointer",
              }}
            >
              <Star size={16} fill={comic.isGrail ? "currentColor" : "none"} />
            </S.ActionButton>
            <S.ActionButton
              onClick={() => handleCollect(comic.id)}
              $isActive={comic.collected}
              disabled={isUpdating(comic.id)}
              title={
                comic.collected ? "Mark as uncollected" : "Mark as collected"
              }
              style={{
                cursor: isUpdating(comic.id) ? "not-allowed" : "pointer",
              }}
            >
              <Check size={16} />
            </S.ActionButton>
          </S.ComicActions>
        </S.ComicItem>
      ))}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default SeriesComicsList;
