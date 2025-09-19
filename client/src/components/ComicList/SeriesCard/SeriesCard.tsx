import React, { useCallback } from "react";
import { Heart, Star, Check, ExternalLink } from "lucide-react";
import { Comic, FilterOption } from "../../../types";
import { SeriesSummary } from "../../../hooks/aggregations/types";
import {
  useSeriesComics,
  useOptimisticComics,
  useComicActions,
} from "../../../hooks";
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
  filterOption: FilterOption;
}

const SeriesCard: React.FC<SeriesCardProps> = ({
  seriesKey,
  seriesSummary,
  $isExpanded,
  toggleSeries,
  currentPage,
  itemsPerPage,
  onPageChange,
  onOpenDetailView,
  isFavorite,
  onToggleFavorite,
  filterOption,
}) => {
  const handleDetailView = () => {
    onOpenDetailView(
      seriesSummary.publisher,
      seriesSummary.series,
      seriesSummary.volume
    );
  };

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
            filterOption={filterOption}
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
  filterOption: FilterOption;
}

const SeriesComicsList: React.FC<SeriesComicsListProps> = ({
  publisher,
  series,
  volume,
  currentPage,
  itemsPerPage,
  onPageChange,
  totalIssues,
  filterOption,
}) => {
  const {
    comics: serverComics,
    loading,
    error,
    silentRefetch,
    updateComic,
  } = useSeriesComics(
    publisher,
    series,
    volume || null,
    currentPage,
    itemsPerPage,
    true,
    { filterOption }
  );

  // Use optimistic comics hook for immediate UI updates
  const {
    comics,
    applyOptimisticUpdate,
    confirmUpdate,
    revertUpdate,
    isUpdating,
    syncWithServer,
  } = useOptimisticComics(serverComics, {
    onUpdateSuccess: (updatedComic) => {
      console.log("✅ Comic update confirmed:", updatedComic);
      // Silently refetch to ensure consistency
      silentRefetch().then((newComics) => {
        if (newComics) {
          syncWithServer(newComics);
        }
      });
    },
    onUpdateError: (error, comic) => {
      console.error("❌ Comic update failed:", error, comic);
    },
  });

  // Handle comic actions with optimistic updates
  const comicActions = useComicActions({
    onComicUpdated: useCallback(
      (updatedComic: Comic) => {
        // Confirm the update was successful
        confirmUpdate(updatedComic);
        // Update the single comic in the background
        updateComic({
          ...updatedComic,
          isGrail: updatedComic.isGrail ?? false,
        });
      },
      [confirmUpdate, updateComic]
    ),
    onError: useCallback(
      (error: string, comic: Comic) => {
        console.error("Comic action failed:", error, comic);
        // Revert the optimistic update on error
        revertUpdate(comic.id, comic);
      },
      [revertUpdate]
    ),
    optimisticUpdates: false, // We handle optimistic updates ourselves
  });

  // Internal action handlers
  const handleCollect = useCallback(
    async (id: string) => {
      const comic = comics.find((c) => c.id === id);
      if (!comic || isUpdating(id)) {
        return;
      }

      // Apply optimistic update immediately
      const optimisticComic = {
        ...comic,
        collected: !comic.collected,
      };
      applyOptimisticUpdate(optimisticComic);

      // Perform the actual update
      const result = await comicActions.handleCollectedToggle(comic);

      if (!result) {
        // Revert on failure
        revertUpdate(id, comic);
      }
    },
    [comics, comicActions, applyOptimisticUpdate, revertUpdate, isUpdating]
  );

  const handleToggleGrail = useCallback(
    async (id: string) => {
      const comic = comics.find((c) => c.id === id);
      if (!comic || isUpdating(id)) {
        return;
      }

      // Apply optimistic update immediately
      const optimisticComic = {
        ...comic,
        isGrail: !comic.isGrail,
      };
      applyOptimisticUpdate(optimisticComic);

      // Perform the actual update
      const result = await comicActions.handleGrailToggle(comic);

      if (!result) {
        // Revert on failure
        revertUpdate(id, comic);
      }
    },
    [comics, comicActions, applyOptimisticUpdate, revertUpdate, isUpdating]
  );

  const totalPages = Math.max(1, Math.ceil(totalIssues / itemsPerPage));

  if (loading) {
    return <div style={{ padding: "1rem" }}>Loading comics...</div>;
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
          style={{
            opacity: isUpdating(comic.id) ? 0.7 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          <S.ComicInfo data-sc="ComicInfo">
            <S.ComicTitle data-sc="ComicTitle">
              {comic.series}
              {comic.volume && ` - ${comic.volume}`} #{comic.issue}
              {comic.isGrail && (
                <S.GrailBadge>
                  <Star size={14} fill="currentColor" />
                </S.GrailBadge>
              )}
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
              disabled={isUpdating(comic.id)}
              title={comic.isGrail ? "Remove from grails" : "Mark as grail"}
              style={{
                cursor: isUpdating(comic.id) ? "not-allowed" : "pointer",
              }}
            >
              <Star size={16} fill={comic.isGrail ? "currentColor" : "none"} />
            </S.ActionButton>
            <S.ActionButton
              onClick={() => handleCollect(comic.id)}
              $isActive={comic.collected}
              disabled={isUpdating(comic.id)}
              title={
                comic.collected ? "Mark as uncollected" : "Mark as collected"
              }
              style={{
                cursor: isUpdating(comic.id) ? "not-allowed" : "pointer",
              }}
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
