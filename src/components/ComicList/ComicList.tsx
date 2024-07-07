import React, { useState, useMemo, useEffect } from "react";
import { Comic, GroupedComics } from "../../types";
import * as S from "./styles";
import { ChevronLeft, ChevronRight, ChevronsUp } from "lucide-react";

interface Props {
  comics: Comic[];
  onCollect: (id: string) => void;
  itemsPerPage: number;
}

const ComicList: React.FC<Props> = ({ comics, onCollect, itemsPerPage }) => {
  const [expandedSeries, setExpandedSeries] = useState<string[]>([]);
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [currentPages, setCurrentPages] = useState<{ [key: string]: number }>(
    {}
  );
  const [showToTop, setShowToTop] = useState(false);

  const groupedComics = useMemo(() => {
    return comics.reduce((acc: GroupedComics, comic) => {
      const key = comic.volume
        ? `${comic.series} - ${comic.volume}`
        : comic.series;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(comic);
      return acc;
    }, {});
  }, [comics]);

  useEffect(() => {
    const handleScroll = () => {
      setShowToTop(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleAll = () => {
    setIsAllExpanded(!isAllExpanded);
    setExpandedSeries(isAllExpanded ? [] : Object.keys(groupedComics));
  };

  const toggleSeries = (series: string) => {
    setExpandedSeries((prev) =>
      prev.includes(series)
        ? prev.filter((s) => s !== series)
        : [...prev, series]
    );
  };

  const handlePageChange = (series: string, newPage: number) => {
    setCurrentPages((prev) => ({ ...prev, [series]: newPage }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <S.ComicListContainer data-sc="ComicListContainer">
      <S.ExpandContainer data-sc="ExpandContainer">
        <S.ToggleButton onClick={toggleAll} data-sc="ToggleButton">
          {isAllExpanded ? "Collapse All" : "Expand All"}
        </S.ToggleButton>
      </S.ExpandContainer>

      {Object.entries(groupedComics).map(([seriesKey, comicList]) => {
        const currentPage = currentPages[seriesKey] || 1;
        const totalPages = Math.ceil(comicList.length / itemsPerPage);
        const paginatedComics = comicList.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        );

        return (
          <S.SeriesCard key={seriesKey} data-sc="SeriesCard">
            <S.SeriesHeader
              onClick={() => toggleSeries(seriesKey)}
              data-sc="SeriesHeader"
            >
              {seriesKey} ({comicList.length} issues)
            </S.SeriesHeader>
            {expandedSeries.includes(seriesKey) && (
              <>
                {paginatedComics.map((comic) => (
                  <S.ComicItem
                    key={comic.id}
                    collected={comic.collected}
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
                      collected={comic.collected}
                      data-sc="CollectButton"
                    >
                      {comic.collected ? "Collected" : "Mark as Collected"}
                    </S.CollectButton>
                  </S.ComicItem>
                ))}
                {totalPages > 1 && (
                  <S.PaginationContainer data-sc="PaginationContainer">
                    <S.PaginationButton
                      onClick={() =>
                        handlePageChange(
                          seriesKey,
                          Math.max(currentPage - 1, 1)
                        )
                      }
                      disabled={currentPage === 1}
                      data-sc="PaginationButton"
                    >
                      <ChevronLeft size={20} />
                    </S.PaginationButton>
                    <S.PaginationInfo data-sc="PaginationInfo">
                      Page {currentPage} of {totalPages}
                    </S.PaginationInfo>
                    <S.PaginationButton
                      onClick={() =>
                        handlePageChange(
                          seriesKey,
                          Math.min(currentPage + 1, totalPages)
                        )
                      }
                      disabled={currentPage === totalPages}
                      data-sc="PaginationButton"
                    >
                      <ChevronRight size={20} />
                    </S.PaginationButton>
                  </S.PaginationContainer>
                )}
              </>
            )}
          </S.SeriesCard>
        );
      })}

      {showToTop && (
        <S.ToTopButton onClick={scrollToTop} data-sc="ToTopButton">
          <ChevronsUp size={24} />
        </S.ToTopButton>
      )}
    </S.ComicListContainer>
  );
};

export default ComicList;
