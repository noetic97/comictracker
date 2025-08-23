import React, { Suspense } from "react";
import { Comic, FavoriteSeries } from "../../../types";
import SeriesCard from "../SeriesCard";
import * as S from "./styles";

export interface PublisherCardProps {
  publisher: string;
  publisherComics: { [seriesKey: string]: Comic[] };
  isExpanded: boolean;
  expandedSeries: string[];
  currentPages: { [key: string]: number };
  itemsPerPage: number;
  favoriteSeries: FavoriteSeries[];
  onTogglePublisher: (publisher: string) => void;
  onToggleSeries: (seriesKey: string) => void;
  onPageChange: (series: string, newPage: number) => void;
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
  publisher,
  publisherComics,
  isExpanded,
  expandedSeries,
  currentPages,
  itemsPerPage,
  favoriteSeries,
  onTogglePublisher,
  onToggleSeries,
  onPageChange,
  onCollect,
  onToggleGrail,
  onOpenDetailView,
  onToggleFavoriteSeries,
}) => {
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

  // Simple loading fallback - invisible since loading manager handles main experience
  const LoadingFallback = () => (
    <div
      style={{
        height: "20px",
        opacity: 0, // Invisible fallback
      }}
    />
  );

  return (
    <S.PublisherCard $isExpanded={isExpanded} data-sc="PublisherCard">
      <S.PublisherButton
        $isExpanded={isExpanded}
        onClick={() => onTogglePublisher(publisher)}
      >
        <S.PublisherName>{publisher}</S.PublisherName>
        <S.SeriesCount>
          {Object.keys(publisherComics).length} series
        </S.SeriesCount>
      </S.PublisherButton>

      <S.SeriesList className={isExpanded ? "expanded" : ""}>
        <Suspense fallback={<LoadingFallback />}>
          {Object.entries(publisherComics).map(([seriesKey, comicList]) => (
            <SeriesCard
              key={seriesKey}
              seriesKey={seriesKey}
              comicList={comicList}
              $isExpanded={expandedSeries.includes(seriesKey)}
              toggleSeries={onToggleSeries}
              currentPage={currentPages[seriesKey] || 1}
              itemsPerPage={itemsPerPage}
              onCollect={onCollect}
              onToggleGrail={onToggleGrail}
              onPageChange={(newPage) => onPageChange(seriesKey, newPage)}
              onOpenDetailView={onOpenDetailView}
              isFavorite={isFavoriteSeries(
                comicList[0].publisher,
                comicList[0].series,
                comicList[0].volume || ""
              )}
              onToggleFavorite={() =>
                onToggleFavoriteSeries(
                  comicList[0].publisher,
                  comicList[0].series,
                  comicList[0].volume || ""
                )
              }
            />
          ))}
        </Suspense>
      </S.SeriesList>
    </S.PublisherCard>
  );
};

export default PublisherCard;
