import React, { Suspense } from "react";
import { FavoriteSeries, FilterOption } from "../../../types";
import {
  PublisherSummary,
  useSeriesSummaries,
} from "../../../hooks/useComicAggregations";
import SeriesCard from "../SeriesCard";
import * as S from "./styles";

export interface PublisherCardProps {
  publisherSummary: PublisherSummary;
  isExpanded: boolean;
  expandedSeries: string[];
  itemsPerPage: number;
  favoriteSeries: FavoriteSeries[];
  filterOption: FilterOption;
  onTogglePublisher: (publisher: string) => void;
  onToggleSeries: (seriesKey: string) => void;
  onCollect: (id: string) => void;
  onToggleGrail: (id: string) => void;
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
}

const PublisherCard: React.FC<PublisherCardProps> = ({
  publisherSummary,
  isExpanded,
  expandedSeries,
  itemsPerPage,
  favoriteSeries,
  filterOption,
  onTogglePublisher,
  onToggleSeries,
  onCollect,
  onToggleGrail,
  onOpenDetailView,
  onToggleFavoriteSeries,
}) => {
  // Only fetch series data when this publisher is expanded
  const {
    series,
    loading: seriesLoading,
    error: seriesError,
  } = useSeriesSummaries(isExpanded ? publisherSummary.publisher : null, {
    filterOption,
  });

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
        <div>
          <S.SeriesCount>{publisherSummary.seriesCount} series</S.SeriesCount>
          <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
            {publisherSummary.totalComics} comics •{" "}
            {publisherSummary.collectedComics} collected
            {publisherSummary.grailComics > 0 && (
              <> • {publisherSummary.grailComics} grails</>
            )}
          </div>
        </div>
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
                    currentPage={1} // We'll handle pagination later
                    itemsPerPage={itemsPerPage}
                    onCollect={onCollect}
                    onToggleGrail={onToggleGrail}
                    onPageChange={() => {}} // Handle later
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
