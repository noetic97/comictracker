import React, { useState, useMemo } from "react";
import { Comic } from "../../types";
import PaginationControls from "../ComicList/PaginationControls";
import SeriesHeader from "./SeriesHeader";
import CollapsibleStatsSection from "./CollapsibleStatsSection";
import ViewControls from "./ViewControls";
import ComicsGrid from "./ComicsGrid";
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
      const comparison = (a.issueNumber ?? 0) - (b.issueNumber ?? 0);
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [comics, sortOrder]);

  const totalPages = Math.ceil(sortedComics.length / itemsPerPage);
  const paginatedComics = sortedComics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalValue = comics.reduce(
    (sum, comic) => sum + (comic.currentValue ?? 0),
    0
  );
  const collectedCount = comics.filter((comic) => comic.collected).length;
  const grailCount = comics.filter((comic) => comic.isGrail).length;

  // Calculate the value of collected comics - NEW METRIC!
  const collectedValue = comics
    .filter((comic) => comic.collected)
    .reduce((sum, comic) => sum + (comic.currentValue ?? 0), 0);

  return (
    <S.SeriesDetailContainer data-sc="SeriesDetailContainer">
      <S.CompactHeader data-sc="CompactHeader">
        <SeriesHeader
          publisher={publisher}
          series={series}
          volume={volume}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onBack={onBack}
        />

        <CollapsibleStatsSection
          totalIssues={comics.length}
          collectedCount={collectedCount}
          grailCount={grailCount}
          totalValue={totalValue}
          collectedValue={collectedValue}
          isCollapsed={isStatsCollapsed}
          onToggle={() => setIsStatsCollapsed(!isStatsCollapsed)}
        />

        <ViewControls
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          onCurrentPageReset={() => setCurrentPage(1)}
        />
      </S.CompactHeader>

      <ComicsGrid
        comics={paginatedComics}
        onCollect={onCollect}
        onToggleGrail={onToggleGrail}
      />

      <S.StickyFooter data-sc="StickyFooter">
        <S.FooterControls>
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
