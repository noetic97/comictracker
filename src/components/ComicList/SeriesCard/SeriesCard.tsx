import React from "react";
import { Comic } from "../../../types";
import PaginationControls from "../PaginationControls";
import * as S from "./styles";

interface SeriesCardProps {
  seriesKey: string;
  comicList: Comic[];
  $isExpanded: boolean;
  toggleSeries: (series: string) => void;
  currentPage: number;
  itemsPerPage: number;
  onCollect: (id: string) => void;
  onPageChange: (page: number) => void;
}

const SeriesCard: React.FC<SeriesCardProps> = ({
  seriesKey,
  comicList,
  $isExpanded,
  toggleSeries,
  currentPage,
  itemsPerPage,
  onCollect,
  onPageChange,
}) => {
  const totalPages = Math.ceil(comicList.length / itemsPerPage);
  const paginatedComics = comicList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <S.SeriesCard data-sc="SeriesCard">
      <S.SeriesHeader
        onClick={() => toggleSeries(seriesKey)}
        aria-expanded={$isExpanded}
        tabIndex={0}
        data-sc="SeriesHeader"
      >
        {seriesKey} ({comicList.length} issues)
      </S.SeriesHeader>
      <S.SeriesContent className={$isExpanded ? "expanded" : ""}>
        {paginatedComics.map((comic) => (
          <S.ComicItem
            key={comic.id}
            $collected={comic.collected}
            data-sc="ComicItem"
          >
            <S.ComicInfo data-sc="ComicInfo">
              <S.ComicTitle data-sc="ComicTitle">
                {comic.series}
                {comic.volume && ` - ${comic.volume}`} #{comic.issue}
              </S.ComicTitle>
              <S.ComicMeta data-sc="ComicMeta">
                Years: {comic.years}
              </S.ComicMeta>
              <S.ComicValue data-sc="ComicValue">
                Current Value: ${comic.currentValue}
              </S.ComicValue>
            </S.ComicInfo>
            <S.CollectButton
              onClick={() => onCollect(comic.id)}
              $collected={comic.collected}
              data-sc="CollectButton"
            >
              {comic.collected ? "Collected" : "Mark as Collected"}
            </S.CollectButton>{" "}
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
