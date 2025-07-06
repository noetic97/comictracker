import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Star,
  Heart,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Comic } from "../../../../src/types";
import Button from "../shared/Button";
import PaginationControls from "../ComicList/PaginationControls";
import * as S from "./styles";

interface SeriesDetailViewProps {
  comics: Comic[];
  publisher: string;
  series: string;
  volume?: string;
  onCollect: (id: string) => void;
  onToggleGrail: (id: string) => void;
  onBack: () => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const SeriesDetailView: React.FC<SeriesDetailViewProps> = ({
  comics,
  publisher,
  series,
  volume,
  onCollect,
  onToggleGrail,
  onBack,
  itemsPerPage,
  setItemsPerPage,
  isFavorite,
  onToggleFavorite,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);

  const sortedComics = useMemo(() => {
    return [...comics].sort((a, b) => {
      const comparison = a.issueNumber - b.issueNumber;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [comics, sortOrder]);

  const totalPages = Math.ceil(sortedComics.length / itemsPerPage);
  const paginatedComics = sortedComics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const seriesTitle = volume ? `${series} - ${volume}` : series;
  const totalValue = comics.reduce((sum, comic) => sum + comic.currentValue, 0);
  const collectedCount = comics.filter((comic) => comic.collected).length;
  const grailCount = comics.filter((comic) => comic.isGrail).length;

  const itemsPerPageOptions = [10, 25, 50, 100];

  return (
    <S.SeriesDetailContainer data-sc="SeriesDetailContainer">
      <S.CompactHeader data-sc="CompactHeader">
        <S.HeaderTop>
          <Button
            onClick={onBack}
            icon={ArrowLeft}
            variant="secondary"
            size="small"
            shape="circular"
          />
          <S.TitleSection>
            <S.CompactSeriesTitle>
              {seriesTitle}
              <S.FavoriteButton
                onClick={onToggleFavorite}
                $isFavorite={isFavorite}
                title={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
              </S.FavoriteButton>
            </S.CompactSeriesTitle>
            <S.CompactPublisher>{publisher}</S.CompactPublisher>
          </S.TitleSection>
        </S.HeaderTop>

        <S.CollapsibleStats $isCollapsed={isStatsCollapsed}>
          <S.StatsHeader onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}>
            <span>Series Statistics</span>
            {isStatsCollapsed ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </S.StatsHeader>
          <S.SeriesStats className={isStatsCollapsed ? "collapsed" : ""}>
            <S.StatItem>
              <S.StatValue>{comics.length}</S.StatValue>
              <S.StatLabel>Total Issues</S.StatLabel>
            </S.StatItem>
            <S.StatItem>
              <S.StatValue>{collectedCount}</S.StatValue>
              <S.StatLabel>Collected</S.StatLabel>
            </S.StatItem>
            <S.StatItem>
              <S.StatValue>{grailCount}</S.StatValue>
              <S.StatLabel>Grails</S.StatLabel>
            </S.StatItem>
            <S.StatItem>
              <S.StatValue>${totalValue.toLocaleString()}</S.StatValue>
              <S.StatLabel>Total Value</S.StatLabel>
            </S.StatItem>
          </S.SeriesStats>
        </S.CollapsibleStats>

        <S.ViewControls>
          <S.SortControls>
            <S.ControlLabel>Sort:</S.ControlLabel>
            <S.CompactSelect
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            >
              <option value="asc">Issue # ↑</option>
              <option value="desc">Issue # ↓</option>
            </S.CompactSelect>
          </S.SortControls>
        </S.ViewControls>
      </S.CompactHeader>

      <S.ComicsGrid data-sc="ComicsGrid">
        {paginatedComics.map((comic) => (
          <S.CompactComicCard
            key={comic.id}
            $collected={comic.collected}
            $isGrail={comic.isGrail}
            data-sc="ComicCard"
          >
            <S.ComicHeader>
              <S.IssueNumber>#{comic.issue}</S.IssueNumber>
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
                    comic.collected
                      ? "Mark as uncollected"
                      : "Mark as collected"
                  }
                >
                  <Check size={16} />
                </S.ActionButton>
              </S.ComicActions>
            </S.ComicHeader>

            <S.CompactComicDetails>
              <S.ComicMetaLine>
                <span>{comic.years}</span>
                <S.ComicValue>
                  ${comic.currentValue.toLocaleString()}
                </S.ComicValue>
              </S.ComicMetaLine>
            </S.CompactComicDetails>
          </S.CompactComicCard>
        ))}
      </S.ComicsGrid>

      <S.StickyFooter data-sc="StickyFooter">
        <S.FooterControls>
          <S.ItemsPerPageControl>
            <S.ControlLabel>Items:</S.ControlLabel>
            <S.CompactSelect
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </S.CompactSelect>
          </S.ItemsPerPageControl>

          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </S.FooterControls>
      </S.StickyFooter>
    </S.SeriesDetailContainer>
  );
};

export default SeriesDetailView;
