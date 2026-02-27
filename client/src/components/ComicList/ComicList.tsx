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
  filterType: string;
  filterGrade: string;
  filterMinValue: string;
  filterMaxValue: string;
  sortBy: SortOption;
  sortOrder: "asc" | "desc";
  setSortBy: (v: SortOption) => void;
  setSortOrder: (v: "asc" | "desc") => void;
  favoriteSeries: FavoriteSeries[];
  onToggleFavoriteSeries: (
    publisher: string,
    series: string,
    volume: string
  ) => void;
  selectedSeries: {
    publisher: string;
    series: string;
    volume?: string;
  } | null;
  onOpenDetailView: (
    publisher: string,
    series: string,
    volume?: string
  ) => void;
  onBackToGrid: () => void;
  seriesPage: number;
  setSeriesPage: (page: number) => void;
  hiddenPublishersSet: Set<string>;
  showHiddenPublishers: boolean;
  onHidePublisher: (name: string) => void;
  onUnhidePublisher: (name: string) => void;
  hiddenSeriesSet: Set<string>;
  showHiddenSeries: boolean;
  onHideSeries: (storageKey: string) => void;
  onUnhideSeries: (storageKey: string) => void;
}

const ComicList: React.FC<Props> = ({
  itemsPerPage,
  setItemsPerPage,
  filterOption,
  searchFilter,
  filterType,
  filterGrade,
  filterMinValue,
  filterMaxValue,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  favoriteSeries,
  onToggleFavoriteSeries,
  selectedSeries,
  onOpenDetailView,
  onBackToGrid,
  seriesPage,
  setSeriesPage,
  hiddenPublishersSet: hiddenSet,
  showHiddenPublishers: showHidden,
  onHidePublisher: hidePublisher,
  onUnhidePublisher: unhidePublisher,
  hiddenSeriesSet,
  showHiddenSeries,
  onHideSeries: hideSeries,
  onUnhideSeries: unhideSeries,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [seriesPages, setSeriesPages] = useState<Record<string, number>>({});
  const [globalStatsRefresh, setGlobalStatsRefresh] = useState<
    (() => Promise<any>) | null
  >(null);

  const viewMode: ViewMode = selectedSeries ? "series-detail" : "grid";

  // Debug logging for stats callback
  React.useEffect(() => {
    logger.stats.debug("Global stats refresh callback updated", {
      hasCallback: !!globalStatsRefresh,
      isFunction: typeof globalStatsRefresh === "function",
    });
  }, [globalStatsRefresh]);

  // Use our new hook to fetch publisher summaries
  const {
    publishers: publishersFromApi,
    loading: publishersLoading,
    error: publishersError,
  } = usePublisherSummaries(
    {
      filterOption,
      search: searchFilter,
      sortBy,
      type: filterType || undefined,
      grade: filterGrade || undefined,
      minValue: filterMinValue || undefined,
      maxValue: filterMaxValue || undefined,
    },
    favoriteSeries
  );

  // When showHidden is false, exclude hidden publishers (and all their series/comics). When true, show all.
  const publishers =
    showHidden
      ? publishersFromApi
      : publishersFromApi.filter((p) => !hiddenSet.has(p.publisher));

  // Convert publishers array to the grouped format expected by existing components
  const groupedComics = publishers.reduce((acc, pub) => {
    acc[pub.publisher] = {}; // We'll load series data when publisher is expanded
    return acc;
  }, {} as { [publisher: string]: any });

  // Use the expanded state hook
  const {
    expandedPublishers,
    expandedSeries,
    togglePublisher,
    toggleSeries,
  } = useExpandedState(groupedComics);

  const handleOpenDetailView = (
    publisher: string,
    series: string,
    volume?: string
  ) => {
    onOpenDetailView(publisher, series, volume);
  };

  const handleBackToGrid = () => {
    onBackToGrid();
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
        filterType={filterType}
        filterGrade={filterGrade}
        filterMinValue={filterMinValue}
        filterMaxValue={filterMaxValue}
        sortBy={sortBy}
        sortOrder={sortOrder}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
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
        currentPage={seriesPage}
        setCurrentPage={setSeriesPage}
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
              filterType={filterType}
              filterGrade={filterGrade}
              filterMinValue={filterMinValue}
              filterMaxValue={filterMaxValue}
              sortBy={sortBy}
              onTogglePublisher={togglePublisher}
              onToggleSeries={toggleSeries}
              onOpenDetailView={handleOpenDetailView}
              onToggleFavoriteSeries={onToggleFavoriteSeries}
              getSeriesPage={getSeriesPage}
              onSeriesPageChange={handleSeriesPageChange}
              onStatsRefresh={globalStatsRefresh}
              isHidden={hiddenSet.has(publisherSummary.publisher)}
              showHiddenMode={showHidden}
              onHidePublisher={hidePublisher}
              onUnhidePublisher={unhidePublisher}
              hiddenSeriesSet={hiddenSeriesSet}
              showHiddenSeries={showHiddenSeries}
              onHideSeries={hideSeries}
              onUnhideSeries={unhideSeries}
            />
          ))}
        </S.PublisherGrid>
      )}

      <ToTopButton />
    </S.ComicListContainer>
  );
};

export default ComicList;
