import React, { useState, useMemo, useCallback } from "react";
import { FilterOption, Comic } from "../../types";
import {
  useSeriesComics,
  useComicStats,
} from "../../hooks/useComicAggregations";
import { useComicActions } from "../../hooks/useComicActions";
import PaginationControls from "../ComicList/PaginationControls";
import SeriesHeader from "./SeriesHeader";
import CollapsibleStatsSection from "./CollapsibleStatsSection";
import ViewControls from "./ViewControls";
import ComicsGrid from "./ComicsGrid";
import * as S from "./styles";

interface SeriesDetailViewProps {
  publisher: string;
  series: string;
  volume?: string;
  onBack: () => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  filterOption: FilterOption; // Pass global filter state
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
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);

  // Use hooks to fetch series-specific data
  const {
    comics,
    loading: comicsLoading,
    error: comicsError,
    refetch: refetchComics,
  } = useSeriesComics(
    publisher,
    series,
    volume || null,
    currentPage,
    itemsPerPage,
    true, // always enabled for detail view
    { filterOption } // pass global filters
  );

  // Fetch series-specific stats using the same filters
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useComicStats({
    publisher,
    series,
    filterOption,
  });

  // Handle comic actions internally
  const comicActions = useComicActions({
    onComicUpdated: useCallback(
      (updatedComic: Comic) => {
        console.log("Comic updated in SeriesDetailView:", updatedComic);
        // Refetch both comics and stats after successful update
        refetchComics();
        refetchStats();
      },
      [refetchComics, refetchStats]
    ),
    onError: useCallback((error: string, comic: Comic) => {
      console.error("Comic action failed:", error, comic);
      // Could show toast/notification here in the future
    }, []),
    optimisticUpdates: true,
  });

  // Internal action handlers
  const handleCollect = useCallback(
    async (id: string) => {
      const comic = comics.find((c) => c.id === id);
      if (!comic) {
        console.error("Comic not found in current page:", id);
        return;
      }
      await comicActions.handleCollectedToggle(comic);
    },
    [comics, comicActions]
  );

  const handleToggleGrail = useCallback(
    async (id: string) => {
      const comic = comics.find((c) => c.id === id);
      if (!comic) {
        console.error("Comic not found in current page:", id);
        return;
      }
      await comicActions.handleGrailToggle(comic);
    },
    [comics, comicActions]
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
  if (comicsLoading || statsLoading) {
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

      <ComicsGrid
        comics={sortedComics}
        onCollect={handleCollect}
        onToggleGrail={handleToggleGrail}
      />

      <S.StickyFooter data-sc="StickyFooter">
        <S.FooterControls>
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </S.FooterControls>
      </S.StickyFooter>
    </S.SeriesDetailContainer>
  );
};

export default SeriesDetailView;
