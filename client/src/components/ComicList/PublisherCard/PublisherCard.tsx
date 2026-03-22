import React, { Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FavoriteSeries, FilterOption, SortOption } from "../../../types";
import { PublisherSummary } from "../../../hooks/aggregations/types";
import { useSeriesSummaries } from "../../../hooks";
import { seriesStorageKey } from "../../../utils/hiddenSeries";
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
  filterType?: string;
  filterGrade?: string;
  filterMinValue?: string;
  filterMaxValue?: string;
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
  isHidden?: boolean;
  showHiddenMode?: boolean;
  onHidePublisher?: (publisher: string) => void;
  onUnhidePublisher?: (publisher: string) => void;
  hiddenSeriesSet?: Set<string>;
  showHiddenSeries?: boolean;
  onHideSeries?: (storageKey: string) => void;
  onUnhideSeries?: (storageKey: string) => void;
}

const PublisherCard: React.FC<PublisherCardProps> = ({
  publisherSummary,
  isExpanded,
  expandedSeries,
  itemsPerPage,
  favoriteSeries,
  filterOption,
  searchFilter,
  filterType = "",
  filterGrade = "",
  filterMinValue = "",
  filterMaxValue = "",
  sortBy,
  onTogglePublisher,
  onToggleSeries,
  onOpenDetailView,
  onToggleFavoriteSeries,
  getSeriesPage,
  onSeriesPageChange,
  onStatsRefresh,
  isHidden = false,
  showHiddenMode = false,
  onHidePublisher,
  onUnhidePublisher,
  hiddenSeriesSet = new Set(),
  showHiddenSeries = false,
  onHideSeries,
  onUnhideSeries,
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
      type: filterType || undefined,
      grade: filterGrade || undefined,
      minValue: filterMinValue || undefined,
      maxValue: filterMaxValue || undefined,
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

  const handleHideClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isHidden && onUnhidePublisher) onUnhidePublisher(publisherSummary.publisher);
    else if (!isHidden && onHidePublisher) onHidePublisher(publisherSummary.publisher);
  };

  return (
    <S.PublisherCard $isExpanded={isExpanded} data-sc="PublisherCard">
      <S.PublisherButton
        $isExpanded={isExpanded}
        onClick={() => onTogglePublisher(publisherSummary.publisher)}
      >
        <S.PublisherTopBlock>
          <S.PublisherHeaderRow>
            <S.PublisherName>{publisherSummary.publisher}</S.PublisherName>
            {(onHidePublisher || onUnhidePublisher) && (
              <S.HideButton
                type="button"
                onClick={handleHideClick}
                title={isHidden ? "Unhide publisher" : "Hide publisher"}
                aria-label={isHidden ? "Unhide publisher" : "Hide publisher"}
              >
                {isHidden ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} />
                )}
              </S.HideButton>
            )}
          </S.PublisherHeaderRow>
          {showHiddenMode && isHidden && (
            <S.HiddenBadge>Hidden</S.HiddenBadge>
          )}
        </S.PublisherTopBlock>
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
              (showHiddenSeries
                ? series
                : series.filter(
                    (s) =>
                      !hiddenSeriesSet.has(
                        seriesStorageKey(s.publisher, s.series, s.volume)
                      )
                  )
              ).map((seriesSummary) => {
                const seriesKey = `${seriesSummary.series}${
                  seriesSummary.volume ? ` - ${seriesSummary.volume}` : ""
                }`;
                const storageKey = seriesStorageKey(
                  seriesSummary.publisher,
                  seriesSummary.series,
                  seriesSummary.volume
                );
                const isSeriesHidden = hiddenSeriesSet.has(storageKey);

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
                    favoriteSeries={favoriteSeries}
                    sortBy={sortBy}
                    onStatsRefresh={onStatsRefresh}
                    isHidden={isSeriesHidden}
                    showHiddenMode={showHiddenSeries}
                    seriesStorageKey={storageKey}
                    onHideSeries={onHideSeries}
                    onUnhideSeries={onUnhideSeries}
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
