import React, { useState } from "react";
import { FavoriteSeries, FilterOption, ViewMode } from "../../types";
import { usePublisherSummaries } from "../../hooks/useComicAggregations";
import { useExpandedState } from "../../hooks";
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

  // Use our new hook to fetch publisher summaries
  const {
    publishers,
    loading: publishersLoading,
    error: publishersError,
  } = usePublisherSummaries({ filterOption });

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
        filterOption={filterOption} // Pass global filter state
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
              onTogglePublisher={togglePublisher}
              onToggleSeries={toggleSeries}
              onOpenDetailView={handleOpenDetailView}
              onToggleFavoriteSeries={onToggleFavoriteSeries}
            />
          ))}
        </S.PublisherGrid>
      )}

      <ToTopButton />
    </S.ComicListContainer>
  );
};

export default ComicList;
