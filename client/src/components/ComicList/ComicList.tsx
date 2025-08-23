import React, { useState, lazy, Suspense } from "react";
import { Comic, FavoriteSeries, FilterOption, ViewMode } from "../../types";
import * as S from "./styles";
import ErrorMessage from "../shared/ErrorMessage";
import ControlsSection from "./ControlsSection";
import PublisherCard from "./PublisherCard";
import { useComicGrouping, useExpandedState } from "../../hooks";

const ToTopButton = lazy(() => import("./ToTopButton"));
const SeriesDetailView = lazy(() => import("../SeriesDetailView"));

interface Props {
  comics: Comic[];
  onCollect: (id: string) => void;
  onToggleGrail: (id: string) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  filterOption: FilterOption;
  favoriteSeries: FavoriteSeries[];
  onToggleFavoriteSeries: (
    publisher: string,
    series: string,
    volume: string
  ) => void;
}

const ComicList: React.FC<Props> = ({
  comics,
  onCollect,
  onToggleGrail,
  itemsPerPage,
  setItemsPerPage,
  filterOption,
  favoriteSeries,
  onToggleFavoriteSeries,
}) => {
  const [currentPages, setCurrentPages] = useState<{ [key: string]: number }>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedSeries, setSelectedSeries] = useState<{
    publisher: string;
    series: string;
    volume?: string;
  } | null>(null);

  // Use the comic grouping hook for all data processing
  const { filteredComics, groupedComics, stats } = useComicGrouping(
    comics,
    filterOption,
    favoriteSeries,
    {
      onError: (errorMessage) => setError(errorMessage),
    }
  );

  // Use the expanded state hook for all expansion logic
  const {
    expandedPublishers,
    expandedSeries,
    isAllExpanded,
    toggleAll,
    togglePublisher,
    toggleSeries,
  } = useExpandedState(groupedComics);

  const handlePageChange = (series: string, newPage: number) => {
    setCurrentPages((prev) => ({ ...prev, [series]: newPage }));
  };

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

  // Simple loading fallback - no registration needed
  const LoadingFallback = () => (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        color: "transparent", // Make it invisible - loading manager handles this
      }}
    >
      Loading...
    </div>
  );

  // Render series detail view
  if (viewMode === "series-detail" && selectedSeries) {
    const seriesComics = filteredComics.filter(
      (comic) =>
        comic.publisher === selectedSeries.publisher &&
        comic.series === selectedSeries.series &&
        comic.volume === (selectedSeries.volume || "")
    );

    const isFavorite = favoriteSeries.some(
      (fav) =>
        fav.publisher === selectedSeries.publisher &&
        fav.series === selectedSeries.series &&
        fav.volume === (selectedSeries.volume || "")
    );

    return (
      <Suspense fallback={<LoadingFallback />}>
        <SeriesDetailView
          comics={seriesComics}
          publisher={selectedSeries.publisher}
          series={selectedSeries.series}
          volume={selectedSeries.volume}
          onCollect={onCollect}
          onToggleGrail={onToggleGrail}
          onBack={handleBackToGrid}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          isFavorite={isFavorite}
          onToggleFavorite={() =>
            onToggleFavoriteSeries(
              selectedSeries.publisher,
              selectedSeries.series,
              selectedSeries.volume || ""
            )
          }
        />
      </Suspense>
    );
  }

  // Render grid view
  return (
    <S.ComicListContainer data-sc="ComicListContainer">
      <Suspense fallback={<LoadingFallback />}>
        {error && (
          <ErrorMessage
            message={error}
            type="error"
            onDismiss={() => setError(null)}
          />
        )}

        <ControlsSection
          isAllExpanded={isAllExpanded}
          onToggleAll={toggleAll}
          totalComics={stats.total}
          filteredComics={stats.filtered}
          collectedComics={stats.collected}
          grailComics={stats.grails}
          totalValue={stats.totalValue}
          collectedValue={stats.collectedValue}
          filterOption={filterOption}
        />

        <S.PublisherGrid data-sc="PublisherGrid">
          {Object.entries(groupedComics).map(([publisher, publisherComics]) => (
            <PublisherCard
              key={publisher}
              publisher={publisher}
              publisherComics={publisherComics}
              isExpanded={expandedPublishers.includes(publisher)}
              expandedSeries={expandedSeries}
              currentPages={currentPages}
              itemsPerPage={itemsPerPage}
              favoriteSeries={favoriteSeries}
              onTogglePublisher={togglePublisher}
              onToggleSeries={toggleSeries}
              onPageChange={handlePageChange}
              onCollect={onCollect}
              onToggleGrail={onToggleGrail}
              onOpenDetailView={handleOpenDetailView}
              onToggleFavoriteSeries={onToggleFavoriteSeries}
            />
          ))}
        </S.PublisherGrid>

        <ToTopButton />
      </Suspense>
    </S.ComicListContainer>
  );
};

export default ComicList;
