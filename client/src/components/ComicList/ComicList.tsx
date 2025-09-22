import React, { useState } from "react";
import {
  FavoriteSeries,
  FilterOption,
  ViewMode,
  SortOption,
} from "../../types";
import { usePublisherSummaries, useExpandedState } from "../../hooks";
import { logger } from "../../utils/logger";
import * as S from "./styles";
import ErrorMessage from "../shared/ErrorMessage";
import ControlsSection from "./ControlsSection";
import PublisherCard from "./PublisherCard";
import ToTopButton from "./ToTopButton";
import SeriesDetailView from "../SeriesDetailView";

interface Props {
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  filterOption: FilterOption;
  searchFilter: string;
  sortBy: SortOption;
  favoriteSeries: FavoriteSeries[];
  onToggleFavoriteSeries: (
    publisher: string,
    series: string,
    volume: string
  ) => void;
}

const ComicList: React.FC<Props> = ({
  itemsPerPage,
  setItemsPerPage,
  filterOption,
  searchFilter,
  sortBy,
  favoriteSeries,
  onToggleFavoriteSeries,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedSeries, setSelectedSeries] = useState<{
    publisher: string;
    series: string;
    volume?: string;
  } | null>(null);
  const [seriesPages, setSeriesPages] = useState<Record<string, number>>({});
  const [globalStatsRefresh, setGlobalStatsRefresh] = useState<
    (() => Promise<any>) | null
  >(null);

  // Debug logging for stats callback
  React.useEffect(() => {
    logger.stats.debug("Global stats refresh callback updated", {
      hasCallback: !!globalStatsRefresh,
      isFunction: typeof globalStatsRefresh === "function",
    });
  }, [globalStatsRefresh]);

  // Use our new hook to fetch publisher summaries
  const {
    publishers,
    loading: publishersLoading,
    error: publishersError,
  } = usePublisherSummaries(
    { filterOption, search: searchFilter, sortBy },
    favoriteSeries
  );

  // Convert publishers array to the grouped format expected by existing components
  const groupedComics = publishers.reduce((acc, pub) => {
    acc[pub.publisher] = {}; // We'll load series data when publisher is expanded
    return acc;
  }, {} as { [publisher: string]: any });

  // Use the expanded state hook
  const {
    expandedPublishers,
    expandedSeries,
    isAllExpanded,
    toggleAll,
    togglePublisher,
    toggleSeries,
  } = useExpandedState(groupedComics);

  const handleOpenDetailView = (
    publisher: string,
    series: string,
    volume?: string
  ) => {
    setSelectedSeries({ publisher, series, volume });
    setViewMode("series-detail");
  };

  const handleBackToGrid = () => {
    setViewMode("grid");
    setSelectedSeries(null);
  };

  const getSeriesPage = (seriesKey: string): number =>
    seriesPages[seriesKey] ?? 1;

  const handleSeriesPageChange = (seriesKey: string, page: number) => {
    setSeriesPages((prev) => {
      if (prev[seriesKey] === page) return prev;
      return { ...prev, [seriesKey]: page };
    });
  };

  // Handle errors
  const combinedError = error || publishersError;

  // Render series detail view
  if (viewMode === "series-detail" && selectedSeries) {
    return (
      <SeriesDetailView
        publisher={selectedSeries.publisher}
        series={selectedSeries.series}
        volume={selectedSeries.volume}
        onBack={handleBackToGrid}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        filterOption={filterOption}
        searchFilter={searchFilter}
        sortBy={sortBy}
        favoriteSeries={favoriteSeries}
        isFavorite={favoriteSeries.some(
          (fav) =>
            fav.publisher === selectedSeries.publisher &&
            fav.series === selectedSeries.series &&
            fav.volume === (selectedSeries.volume || "")
        )}
        onToggleFavorite={() =>
          onToggleFavoriteSeries(
            selectedSeries.publisher,
            selectedSeries.series,
            selectedSeries.volume || ""
          )
        }
      />
    );
  }

  // Render grid view
  return (
    <S.ComicListContainer data-sc="ComicListContainer">
      {combinedError && (
        <ErrorMessage
          message={combinedError}
          type="error"
          onDismiss={() => setError(null)}
        />
      )}

      <ControlsSection
        isAllExpanded={isAllExpanded}
        onToggleAll={toggleAll}
        filterOption={filterOption}
        searchFilter={searchFilter}
        sortBy={sortBy}
        favoriteSeries={favoriteSeries}
        onStatsRefreshReady={(refreshFn) =>
          setGlobalStatsRefresh(() => refreshFn)
        }
      />

      {publishersLoading ? (
        <div>Loading publishers...</div>
      ) : (
        <S.PublisherGrid data-sc="PublisherGrid">
          {publishers.map((publisherSummary) => (
            <PublisherCard
              key={publisherSummary.publisher}
              publisherSummary={publisherSummary}
              isExpanded={expandedPublishers.includes(
                publisherSummary.publisher
              )}
              expandedSeries={expandedSeries}
              itemsPerPage={itemsPerPage}
              favoriteSeries={favoriteSeries}
              filterOption={filterOption}
              searchFilter={searchFilter}
              sortBy={sortBy}
              onTogglePublisher={togglePublisher}
              onToggleSeries={toggleSeries}
              onOpenDetailView={handleOpenDetailView}
              onToggleFavoriteSeries={onToggleFavoriteSeries}
              getSeriesPage={getSeriesPage}
              onSeriesPageChange={handleSeriesPageChange}
              onStatsRefresh={globalStatsRefresh}
            />
          ))}
        </S.PublisherGrid>
      )}

      <ToTopButton />
    </S.ComicListContainer>
  );
};

export default ComicList;
