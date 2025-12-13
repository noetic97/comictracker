import React, { Suspense } from "react";
import { FavoriteSeries, FilterOption, SortOption } from "../../../types";
import { PublisherSummary } from "../../../hooks/aggregations/types";
import { useSeriesSummaries } from "../../../hooks";
import SeriesCard from "../SeriesCard";
import * as S from "./styles";

interface PublisherCardProps {
  publisherSummary: PublisherSummary;
  isExpanded: boolean;
  expandedSeries: string[];
  itemsPerPage: number;
  favoriteSeries: FavoriteSeries[];
  filterOption: FilterOption;
  searchFilter: string;
  sortBy: SortOption;
  onTogglePublisher: (publisher: string) => void;
  onToggleSeries: (seriesKey: string) => void;
  onOpenDetailView: (
    publisher: string,
    series: string,
    volume?: string
  ) => void;
  onToggleFavoriteSeries: (
    publisher: string,
    series: string,
    volume: string
  ) => void;
  getSeriesPage: (seriesKey: string) => number;
  onSeriesPageChange: (seriesKey: string, page: number) => void;
  onStatsRefresh?: (() => Promise<any>) | null;
}

const PublisherCard: React.FC<PublisherCardProps> = ({
  publisherSummary,
  isExpanded,
  expandedSeries,
  itemsPerPage,
  favoriteSeries,
  filterOption,
  searchFilter,
  sortBy,
  onTogglePublisher,
  onToggleSeries,
  onOpenDetailView,
  onToggleFavoriteSeries,
  getSeriesPage,
  onSeriesPageChange,
  onStatsRefresh,
}) => {
  // Only fetch series data when this publisher is expanded
  const {
    series,
    loading: seriesLoading,
    error: seriesError,
  } = useSeriesSummaries(
    isExpanded ? publisherSummary.publisher : null,
    {
      filterOption,
      search: searchFilter,
      sortBy,
    },
    favoriteSeries
  );

  const isFavoriteSeries = (
    publisher: string,
    series: string,
    volume: string
  ) => {
    return favoriteSeries.some(
      (fav) =>
        fav.publisher === publisher &&
        fav.series === series &&
        fav.volume === volume
    );
  };

  const LoadingFallback = () => (
    <div style={{ padding: "1rem", opacity: 0.7 }}>Loading series...</div>
  );

  return (
    <S.PublisherCard $isExpanded={isExpanded} data-sc="PublisherCard">
      <S.PublisherButton
        $isExpanded={isExpanded}
        onClick={() => onTogglePublisher(publisherSummary.publisher)}
      >
        <S.PublisherName>{publisherSummary.publisher}</S.PublisherName>
        <S.PublisherCardCountsContainer>
          <S.PublisherCardCounts>
            {publisherSummary.seriesCount} series
          </S.PublisherCardCounts>
          <S.PublisherCardCounts>
            {publisherSummary.totalComics} comics
          </S.PublisherCardCounts>
          <S.PublisherCardCounts>
            {publisherSummary.collectedComics} collected
          </S.PublisherCardCounts>
          {publisherSummary.grailComics > 0 && (
            <S.PublisherCardCounts>
              {publisherSummary.grailComics} grails
            </S.PublisherCardCounts>
          )}
        </S.PublisherCardCountsContainer>
      </S.PublisherButton>

      <S.SeriesList className={isExpanded ? "expanded" : ""}>
        {isExpanded && (
          <Suspense fallback={<LoadingFallback />}>
            {seriesLoading ? (
              <LoadingFallback />
            ) : seriesError ? (
              <div style={{ padding: "1rem", color: "red" }}>
                Error loading series: {seriesError}
              </div>
            ) : (
              series.map((seriesSummary) => {
                const seriesKey = `${seriesSummary.series}${
                  seriesSummary.volume ? ` - ${seriesSummary.volume}` : ""
                }`;

                return (
                  <SeriesCard
                    key={seriesKey}
                    seriesKey={seriesKey}
                    seriesSummary={seriesSummary}
                    $isExpanded={expandedSeries.includes(seriesKey)}
                    toggleSeries={onToggleSeries}
                    currentPage={getSeriesPage(seriesKey)}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(page) => onSeriesPageChange(seriesKey, page)}
                    onOpenDetailView={onOpenDetailView}
                    isFavorite={isFavoriteSeries(
                      seriesSummary.publisher,
                      seriesSummary.series,
                      seriesSummary.volume
                    )}
                    onToggleFavorite={() =>
                      onToggleFavoriteSeries(
                        seriesSummary.publisher,
                        seriesSummary.series,
                        seriesSummary.volume
                      )
                    }
                    filterOption={filterOption}
                    searchFilter={searchFilter}
                    sortBy={sortBy}
                    onStatsRefresh={onStatsRefresh}
                  />
                );
              })
            )}
          </Suspense>
        )}
      </S.SeriesList>
    </S.PublisherCard>
  );
};

export default PublisherCard;
