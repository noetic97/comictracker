import React, { useCallback, useState } from "react";
import { Star, Check, Pencil } from "lucide-react";
import { Comic, FavoriteSeries, FilterOption, SortOption } from "../../../types";
import {
  useSeriesComics,
  useOptimisticComics,
  useComicActions,
} from "../../../hooks";
import { formatCurrency } from "../../../utils/formatters";
import PaginationControls from "../PaginationControls";
import EditComicModal from "../../EditComicModal";
import Modal from "../../shared/Modal";
import Button from "../../shared/Button";
import { apiService } from "../../../utils/apiService";
import { logger } from "../../../utils/logger";
import * as S from "./styles";

function hasPriceGradeOrLocation(comic: Comic): boolean {
  return (
    comic.pricePaid != null ||
    (comic.grade != null && comic.grade.trim() !== "") ||
    (comic.storageLocation != null && comic.storageLocation.trim() !== "")
  );
}

interface SeriesComicsListProps {
  publisher: string;
  series: string;
  volume?: string;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  totalIssues: number;
  filterOption: FilterOption;
  searchFilter: string;
  favoriteSeries: FavoriteSeries[];
  /** Not used: quick view always sorts by issue number to match detail view */
  sortBy?: SortOption;
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
  searchFilter,
  favoriteSeries,
  onStatsRefresh,
}) => {
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [editComic, setEditComic] = useState<Comic | null>(null);
  const [openedEditForGrail, setOpenedEditForGrail] = useState(false);
  const [openedEditForCollect, setOpenedEditForCollect] = useState(false);
  const [uncollectConfirmComic, setUncollectConfirmComic] = useState<Comic | null>(null);
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
    { filterOption, search: searchFilter, sortBy: "issueNumber" },
    favoriteSeries
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

  const isTransitioning = loading && hasLoadedOnce;

  // Track when we've loaded data for the first time
  React.useEffect(() => {
    if (!loading && serverComics) {
      setHasLoadedOnce(true);
    }
  }, [loading, serverComics]);

  // Handle silent refetch on page changes
  React.useEffect(() => {
    if (hasLoadedOnce) {
      silentRefetch().then((newComics) => {
        if (newComics) syncWithServer(newComics);
      });
    }
  }, [currentPage, itemsPerPage, hasLoadedOnce, silentRefetch, syncWithServer]);

  // Handle comic actions with optimistic updates
  const comicActions = useComicActions({
    onComicUpdated: useCallback(
      (updatedComic: Comic) => {
        confirmUpdate(updatedComic);
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

      // Uncollecting and comic has price/grade/location: confirm before clearing
      if (comic.collected && hasPriceGradeOrLocation(comic)) {
        setUncollectConfirmComic(comic);
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
      } else if (result.collected) {
        setOpenedEditForGrail(false);
        setOpenedEditForCollect(true);
        setEditComic(result);
      }
    },
    [comics, comicActions, applyOptimisticUpdate, revertUpdate, isUpdating]
  );

  const handleUncollectConfirm = useCallback(async () => {
    const comic = uncollectConfirmComic;
    if (!comic) return;
    const clearedComic: Comic = {
      ...comic,
      collected: false,
      pricePaid: undefined,
      grade: undefined,
      storageLocation: undefined,
    };
    applyOptimisticUpdate(clearedComic);
    setUncollectConfirmComic(null);
    try {
      const updated = await apiService.comics.update(comic.id, {
        collected: false,
        pricePaid: null,
        grade: null,
        storageLocation: null,
      } as unknown as Partial<Comic>);
      updateComic(updated);
      confirmUpdate(updated);
      silentRefetch();
    } catch {
      revertUpdate(comic.id, comic);
    }
  }, [
    uncollectConfirmComic,
    applyOptimisticUpdate,
    updateComic,
    confirmUpdate,
    revertUpdate,
    silentRefetch,
  ]);

  const handleOpenEdit = useCallback((c: Comic) => {
    setOpenedEditForGrail(false);
    setOpenedEditForCollect(false);
    setEditComic(c);
  }, []);

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
      } else if (result.isGrail) {
        setOpenedEditForGrail(true);
        setEditComic(result);
      }
    },
    [comics, comicActions, applyOptimisticUpdate, revertUpdate, isUpdating]
  );

  const handleEditClose = useCallback(() => {
    if (openedEditForGrail && editComic?.isGrail) {
      handleToggleGrail(editComic.id);
    }
    if (openedEditForCollect && editComic) {
      handleCollect(editComic.id);
    }
    setEditComic(null);
    setOpenedEditForGrail(false);
    setOpenedEditForCollect(false);
  }, [openedEditForGrail, openedEditForCollect, editComic, handleToggleGrail, handleCollect]);

  const handleEditSave = useCallback(
    (updatedComic: Comic) => {
      const base = editComic ?? updatedComic;
      const merged = {
        ...base,
        ...updatedComic,
        isGrail: updatedComic.isGrail ?? base.isGrail ?? false,
      };
      updateComic(merged);
      confirmUpdate(merged);
      setEditComic(null);
      setOpenedEditForGrail(false);
      setOpenedEditForCollect(false);
    },
    [confirmUpdate, updateComic, editComic]
  );

  const totalPages = Math.max(1, Math.ceil(totalIssues / itemsPerPage));

  // Only show full loading on first load
  if (!hasLoadedOnce && loading) {
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
    <div
      style={{
        opacity: isTransitioning ? 0.7 : 1,
        transition: "opacity 150ms ease",
      }}
    >
      <EditComicModal
        isOpen={!!editComic}
        onClose={handleEditClose}
        comic={editComic}
        onSave={handleEditSave}
      />
      <Modal
        isOpen={!!uncollectConfirmComic}
        onClose={() => setUncollectConfirmComic(null)}
        title="Un-collect comic?"
        size="small"
      >
        <p style={{ margin: "0 0 1rem 0" }}>
          Un-collecting will clear price paid, grade, and storage location for
          this comic. Continue?
        </p>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => setUncollectConfirmComic(null)}>
            Cancel
          </Button>
          <Button onClick={handleUncollectConfirm}>
            Uncollect and clear
          </Button>
        </div>
      </Modal>
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
              {comic.type && comic.type !== "Issue" && (
                <S.IssueTypeBadge>{comic.type}</S.IssueTypeBadge>
              )}
              {comic.isGrail && (
                <S.GrailBadge>
                  <Star size={14} fill="currentColor" />
                </S.GrailBadge>
              )}
            </S.ComicTitle>
            <S.ComicMeta data-sc="ComicMeta">
              {comic.collected && comic.grade != null && comic.grade.trim() !== "" && (
                <span>Grade: {comic.grade}</span>
              )}
              {comic.pricePaid != null && (
                <span>Paid: {formatCurrency(comic.pricePaid)}</span>
              )}
              {comic.currentValue != null && (
                <S.ComicValue>
                  Value: {formatCurrency(comic.currentValue)}
                </S.ComicValue>
              )}
            </S.ComicMeta>
          </S.ComicInfo>
          <S.ComicActions>
            <S.ActionButton
              onClick={() => handleOpenEdit(comic)}
              disabled={isUpdating(comic.id)}
              title="Edit details"
              style={{
                cursor: isUpdating(comic.id) ? "not-allowed" : "pointer",
              }}
            >
              <Pencil size={16} />
            </S.ActionButton>
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
    </div>
  );
};

export default SeriesComicsList;
