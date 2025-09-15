import React, { useCallback } from "react";
import { ExternalLink, Heart, Star, Check } from "lucide-react";
import { SeriesSummary } from "../../../hooks/useComicAggregations";
import { useSeriesComics } from "../../../hooks/useComicAggregations";
import { useComicActions } from "../../../hooks/useComicActions";
import { Comic } from "../../../types";
import PaginationControls from "../PaginationControls";
import Button from "../../shared/Button";
import * as S from "./styles";

interface SeriesCardProps {
  seriesKey: string;
  seriesSummary: SeriesSummary;
  $isExpanded: boolean;
  toggleSeries: (series: string) => void;
  currentPage: number;
  itemsPerPage: number;
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
  seriesSummary,
  $isExpanded,
  toggleSeries,
  onOpenDetailView,
  isFavorite,
  onToggleFavorite,
  currentPage,
  itemsPerPage,
  onPageChange,
}) => {
  const handleDetailView = () => {
    onOpenDetailView(
      seriesSummary.publisher,
      seriesSummary.series,
      seriesSummary.volume
    );
  };

  // Create display title with years if available
  const displayTitle = seriesSummary.volume
    ? `${seriesSummary.series} - ${seriesSummary.volume}`
    : seriesSummary.series;

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
            {seriesSummary.grailCount > 0 && (
              <S.GrailIndicator
                title={`${seriesSummary.grailCount} grail comic(s)`}
              >
                <Star size={16} fill="currentColor" />
                {seriesSummary.grailCount}
              </S.GrailIndicator>
            )}
            {isFavorite && (
              <S.FavoriteIndicator title="Favorite series">
                <Heart size={16} fill="currentColor" />
              </S.FavoriteIndicator>
            )}
          </S.SeriesTitle>
          <S.SeriesStats>
            {seriesSummary.issueCount} issues • {seriesSummary.collectedCount}{" "}
            collected
            {seriesSummary.totalValue > 0 && (
              <>
                {" "}
                • ${Math.round(seriesSummary.totalValue).toLocaleString()} total
                value
              </>
            )}
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
        {$isExpanded && (
          <SeriesComicsList
            publisher={seriesSummary.publisher}
            series={seriesSummary.series}
            volume={seriesSummary.volume}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            totalIssues={seriesSummary.issueCount}
          />
        )}
      </S.SeriesContent>
    </S.SeriesCard>
  );
};

interface SeriesComicsListProps {
  publisher: string;
  series: string;
  volume?: string;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  totalIssues: number;
}

const SeriesComicsList: React.FC<SeriesComicsListProps> = ({
  publisher,
  series,
  volume,
  currentPage,
  itemsPerPage,
  onPageChange,
  totalIssues,
}) => {
  const {
    comics,
    loading,
    error,
    refetch: refetchComics,
  } = useSeriesComics(
    publisher,
    series,
    volume || null,
    currentPage,
    itemsPerPage,
    true
  );

  // Handle comic actions internally
  const comicActions = useComicActions({
    onComicUpdated: useCallback(
      (updatedComic: Comic) => {
        console.log("Comic updated in SeriesCard:", updatedComic);
        // Refetch comics after successful update
        refetchComics();
      },
      [refetchComics]
    ),
    onError: useCallback((error: string, comic: Comic) => {
      console.error("Comic action failed in SeriesCard:", error, comic);
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

  const totalPages = Math.max(1, Math.ceil(totalIssues / itemsPerPage));

  if (loading) {
    return <div style={{ padding: "1rem" }}>Loading comics…</div>;
  }
  if (error) {
    return (
      <div style={{ padding: "1rem", color: "#ffdddd" }}>
        Failed to load comics: {error}
      </div>
    );
  }

  return (
    <>
      {comics.map((comic) => (
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
                ${comic.currentValue?.toLocaleString()}
              </S.ComicValue>
            </S.ComicMeta>
          </S.ComicInfo>
          <S.ComicActions>
            <S.ActionButton
              onClick={() => handleToggleGrail(comic.id)}
              $isActive={comic.isGrail}
              title={comic.isGrail ? "Remove from grails" : "Mark as grail"}
            >
              <Star size={16} fill={comic.isGrail ? "currentColor" : "none"} />
            </S.ActionButton>
            <S.ActionButton
              onClick={() => handleCollect(comic.id)}
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
    </>
  );
};

export default SeriesCard;
