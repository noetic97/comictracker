import React from "react";
import { Heart, Star, ExternalLink } from "lucide-react";
import SeriesComicsList from "../SeriesComicList";
import { FilterOption, SortOption } from "../../../types";
import { SeriesSummary } from "../../../hooks/aggregations/types";
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
  searchFilter: string;
  sortBy: SortOption;
  onStatsRefresh?: (() => Promise<any>) | null;
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
  searchFilter,
  sortBy,
  onStatsRefresh,
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
            searchFilter={searchFilter}
            sortBy={sortBy}
            onStatsRefresh={onStatsRefresh}
          />
        )}
      </S.SeriesContent>
    </S.SeriesCard>
  );
};

export default SeriesCard;
