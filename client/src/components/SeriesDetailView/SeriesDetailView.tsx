import React, { useState, useCallback, useMemo } from "react";
import { Comic, FilterOption, FavoriteSeries, SortOption } from "../../types";
import {
  useSeriesComics,
  useComicStats,
  useOptimisticComics,
  useComicActions,
} from "../../hooks";
import PaginationControls from "../ComicList/PaginationControls";
import ToTopButton from "../ComicList/ToTopButton";
import SeriesHeader from "./SeriesHeader";
import CollapsibleStatsSection from "./CollapsibleStatsSection";
import ViewControls from "./ViewControls";
import ComicsGrid from "./ComicsGrid";
import EditComicModal from "../EditComicModal";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { apiService } from "../../utils/apiService";
import * as S from "./styles";

function hasPriceGradeOrLocation(comic: Comic): boolean {
  return (
    comic.pricePaid != null ||
    (comic.grade != null && comic.grade.trim() !== "") ||
    (comic.storageLocation != null && comic.storageLocation.trim() !== "")
  );
}

interface SeriesDetailViewProps {
  publisher: string;
  series: string;
  volume?: string;
  onBack: () => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  filterOption: FilterOption;
  searchFilter: string;
  sortBy: SortOption;
  favoriteSeries: FavoriteSeries[];
}

const SeriesDetailView: React.FC<SeriesDetailViewProps> = ({
  publisher,
  series,
  volume,
  onBack,
  itemsPerPage,
  setItemsPerPage,
  isFavorite,
  onToggleFavorite,
  filterOption,
  searchFilter,
  sortBy,
  favoriteSeries,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [editComic, setEditComic] = useState<Comic | null>(null);
  const [openedEditForGrail, setOpenedEditForGrail] = useState(false);
  const [openedEditForCollect, setOpenedEditForCollect] = useState(false);
  const [uncollectConfirmComic, setUncollectConfirmComic] = useState<Comic | null>(null);

  // Use hooks to fetch series-specific data
  const {
    comics: serverComics,
    loading: comicsLoading,
    error: comicsError,
    silentRefetch,
    updateComic,
  } = useSeriesComics(
    publisher,
    series,
    volume || null,
    currentPage,
    itemsPerPage,
    true, // always enabled for detail view
    // In series detail always sort by issue number so all issues appear in order (e.g. 538, 539, 540)
    { filterOption, search: searchFilter, sortBy: "issueNumber" }
  );

  // Fetch series-specific stats using the same filters
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    silentRefetch: silentRefetchStats,
  } = useComicStats(
    {
      publisher,
      series,
      filterOption,
      search: searchFilter,
      sortBy,
    },
    favoriteSeries
  );

  const isTransitioning = comicsLoading && hasLoadedOnce;

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
      console.log("✅ Comic update confirmed:", updatedComic);
      // Silently refetch to ensure consistency
      silentRefetch().then((newComics) => {
        if (newComics) {
          syncWithServer(newComics);
        }
      });
      // Silently refetch stats when comics are updated
      silentRefetchStats();
    },
    onUpdateError: (error, comic) => {
      console.error("❌ Comic update failed in detail view:", error, comic);
    },
  });

  React.useEffect(() => {
    if (!comicsLoading && serverComics) {
      setHasLoadedOnce(true);
    }
  }, [comicsLoading, serverComics]);

  React.useEffect(() => {
    // Reset page when filters change
    setCurrentPage(1);
    // Fetch latest server data and sync optimistic list
    silentRefetch().then((newComics) => {
      if (newComics) syncWithServer(newComics);
    });
  }, [filterOption, searchFilter, publisher, series, volume]);

  React.useEffect(() => {
    silentRefetch().then((newComics) => {
      if (newComics) syncWithServer(newComics);
    });
  }, [currentPage, itemsPerPage]);

  // Handle comic actions with optimistic updates
  const comicActions = useComicActions({
    onComicUpdated: useCallback(
      (updatedComic: Comic) => {
        updateComic({
          ...updatedComic,
          isGrail: updatedComic.isGrail ?? false,
        });
        confirmUpdate(updatedComic);
      },
      [confirmUpdate, updateComic]
    ),
    onError: useCallback(
      (error: string, comic: Comic) => {
        console.error("Comic action failed in detail view:", error, comic);
        // Revert the optimistic update on error
        revertUpdate(comic.id, comic);
      },
      [revertUpdate]
    ),
    optimisticUpdates: false, // We handle optimistic updates ourselves
  });

  // Reset page on filter/series change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterOption, searchFilter, publisher, series, volume]);

  // Keep optimistic list in sync with server results (e.g., after filter/search changes)
  React.useEffect(() => {
    if (serverComics && serverComics.length >= 0) {
      syncWithServer(serverComics);
    }
  }, [serverComics, syncWithServer]);

  React.useEffect(() => {
    silentRefetch().then((newComics) => newComics && syncWithServer(newComics));
  }, [currentPage, itemsPerPage]);

  // Internal action handlers with optimistic updates
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

  // Sort comics (keep existing sorting logic)
  const sortedComics = useMemo(() => {
    return [...comics].sort((a, b) => {
      const aNum = parseFloat(a.issue) || 0;
      const bNum = parseFloat(b.issue) || 0;
      const comparison = aNum - bNum;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [comics, sortOrder]);

  // Calculate total pages from stats (total count) rather than current page data
  const totalPages = stats
    ? Math.ceil(stats.total / itemsPerPage)
    : Math.ceil(comics.length / itemsPerPage);

  // Handle loading states
  if (!hasLoadedOnce && (comicsLoading || statsLoading)) {
    return (
      <S.SeriesDetailContainer data-sc="SeriesDetailContainer">
        <S.CompactHeader data-sc="CompactHeader">
          <SeriesHeader
            publisher={publisher}
            series={series}
            volume={volume}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onBack={onBack}
          />
        </S.CompactHeader>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          Loading series data...
        </div>
      </S.SeriesDetailContainer>
    );
  }

  // Handle error states
  if (comicsError || statsError) {
    return (
      <S.SeriesDetailContainer data-sc="SeriesDetailContainer">
        <S.CompactHeader data-sc="CompactHeader">
          <SeriesHeader
            publisher={publisher}
            series={series}
            volume={volume}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onBack={onBack}
          />
        </S.CompactHeader>
        <div style={{ padding: "2rem", textAlign: "center", color: "#ff6b6b" }}>
          Error loading series data: {comicsError || statsError}
        </div>
      </S.SeriesDetailContainer>
    );
  }

  return (
    <S.SeriesDetailContainer data-sc="SeriesDetailContainer">
      <S.CompactHeader data-sc="CompactHeader">
        <SeriesHeader
          publisher={publisher}
          series={series}
          volume={volume}
          seriesYears={sortedComics[0]?.years}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onBack={onBack}
        />

        <CollapsibleStatsSection
          totalIssues={stats?.total || 0}
          collectedCount={stats?.collected || 0}
          grailCount={stats?.grails || 0}
          totalValue={stats?.totalValue || 0}
          collectedValue={stats?.collectedValue || 0}
          isCollapsed={isStatsCollapsed}
          onToggle={() => setIsStatsCollapsed(!isStatsCollapsed)}
        />

        <ViewControls
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          onCurrentPageReset={() => setCurrentPage(1)}
        />
      </S.CompactHeader>
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
      <div
        style={{
          opacity: isTransitioning ? 0.7 : 1,
          transition: "opacity 150ms ease",
        }}
      >
        <ComicsGrid
          comics={sortedComics}
          onCollect={handleCollect}
          onToggleGrail={handleToggleGrail}
          onEdit={handleOpenEdit}
        />
      </div>

      {totalPages > 1 && (
        <S.StickyFooter data-sc="StickyFooter">
          <S.FooterControls>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </S.FooterControls>
        </S.StickyFooter>
      )}

      <ToTopButton />
    </S.SeriesDetailContainer>
  );
};

export default SeriesDetailView;
