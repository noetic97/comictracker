// src/components/ComicList/SeriesCard/SeriesCard.tsx
import React from "react";
import { ExternalLink, Heart, Star, Check } from "lucide-react";
import { Comic } from "../../../types";
import PaginationControls from "../PaginationControls";
import Button from "../../shared/Button";
import * as S from "./styles";

interface SeriesCardProps {
  seriesKey: string;
  comicList: Comic[];
  $isExpanded: boolean;
  toggleSeries: (series: string) => void;
  currentPage: number;
  itemsPerPage: number;
  onCollect: (id: string) => void;
  onToggleGrail: (id: string) => void;
  onPageChange: (page: number) => void;
  onOpenDetailView: (
    publisher: string,
    series: string,
    volume?: string
  ) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const SeriesCard: React.FC<SeriesCardProps> = ({
  seriesKey,
  comicList,
  $isExpanded,
  toggleSeries,
  currentPage,
  itemsPerPage,
  onCollect,
  onToggleGrail,
  onPageChange,
  onOpenDetailView,
  isFavorite,
  onToggleFavorite,
}) => {
  const totalPages = Math.ceil(comicList.length / itemsPerPage);
  const paginatedComics = comicList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDetailView = () => {
    const firstComic = comicList[0];
    if (firstComic) {
      onOpenDetailView(
        firstComic.publisher,
        firstComic.series,
        firstComic.volume
      );
    }
  };

  const grailCount = comicList.filter((comic) => comic.isGrail).length;
  const collectedCount = comicList.filter((comic) => comic.collected).length;

  // Get years from the first comic (assuming all comics in a series have the same years)
  const seriesYears = comicList[0]?.years || "";

  // Create display title with years
  const displayTitle = seriesYears
    ? `${seriesKey} (${seriesYears})`
    : seriesKey;

  return (
    <S.SeriesCard data-sc="SeriesCard">
      <S.SeriesHeader
        onClick={() => toggleSeries(seriesKey)}
        aria-expanded={$isExpanded}
        tabIndex={0}
        className={$isExpanded ? "expanded" : ""}
        data-sc="SeriesHeader"
      >
        <S.SeriesInfo>
          <S.SeriesTitle>
            <S.SeriesTitleText>{displayTitle}</S.SeriesTitleText>
            {grailCount > 0 && (
              <S.GrailIndicator title={`${grailCount} grail comic(s)`}>
                <Star size={16} fill="currentColor" />
                {grailCount}
              </S.GrailIndicator>
            )}
          </S.SeriesTitle>
          <S.SeriesStats>
            {comicList.length} issues • {collectedCount} collected
          </S.SeriesStats>
        </S.SeriesInfo>
      </S.SeriesHeader>

      <S.SeriesActions className={$isExpanded ? "expanded" : ""}>
        <Button
          onClick={onToggleFavorite}
          icon={Heart}
          variant={isFavorite ? "primary" : "secondary"}
          size="small"
        >
          {isFavorite ? "Favorited" : "Favorite"}
        </Button>
        <Button
          onClick={handleDetailView}
          icon={ExternalLink}
          variant="tertiary"
          size="small"
        >
          Detail View
        </Button>
      </S.SeriesActions>

      <S.SeriesContent className={$isExpanded ? "expanded" : ""}>
        {paginatedComics.map((comic) => (
          <S.ComicItem
            key={comic.id}
            $collected={comic.collected}
            $isGrail={comic.isGrail}
            data-sc="ComicItem"
          >
            <S.ComicInfo data-sc="ComicInfo">
              <S.ComicTitle data-sc="ComicTitle">
                {comic.series}
                {comic.volume && ` - ${comic.volume}`} #{comic.issue}
              </S.ComicTitle>
              <S.ComicMeta data-sc="ComicMeta">
                <span>Years: {comic.years}</span>
                <S.ComicValue>
                  ${comic.currentValue.toLocaleString()}
                </S.ComicValue>
              </S.ComicMeta>
            </S.ComicInfo>
            <S.ComicActions>
              <S.ActionButton
                onClick={() => onToggleGrail(comic.id)}
                $isActive={comic.isGrail}
                title={comic.isGrail ? "Remove from grails" : "Mark as grail"}
              >
                <Star
                  size={16}
                  fill={comic.isGrail ? "currentColor" : "none"}
                />
              </S.ActionButton>
              <S.ActionButton
                onClick={() => onCollect(comic.id)}
                $isActive={comic.collected}
                title={
                  comic.collected ? "Mark as uncollected" : "Mark as collected"
                }
              >
                <Check size={16} />
              </S.ActionButton>
            </S.ComicActions>
          </S.ComicItem>
        ))}
        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </S.SeriesContent>
    </S.SeriesCard>
  );
};

export default SeriesCard;
