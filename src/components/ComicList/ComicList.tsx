import React, { useState, useMemo, lazy, Suspense } from "react";
import { Comic, PublisherGroupedComics } from "../../types";
import * as S from "./styles";
import { isValidComic } from "../../utils/validation";
import ErrorMessage from "../shared/ErrorMessage";

const SeriesCard = lazy(() => import("./SeriesCard"));
const ToTopButton = lazy(() => import("./ToTopButton"));
interface Props {
  comics: Comic[];
  onCollect: (id: string) => void;
  itemsPerPage: number;
}

const ComicList: React.FC<Props> = ({ comics, onCollect, itemsPerPage }) => {
  const [expandedPublishers, setExpandedPublishers] = useState<string[]>([]);
  const [expandedSeries, setExpandedSeries] = useState<string[]>([]);
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [currentPages, setCurrentPages] = useState<{ [key: string]: number }>(
    {}
  );
  const [error, setError] = useState<string | null>(null);

  const groupedComics = useMemo(() => {
    try {
      return comics.reduce((acc: PublisherGroupedComics, comic) => {
        if (!isValidComic(comic)) {
          console.error("Invalid comic object:", comic);
          return acc;
        }

        const publisher = comic.publisher;
        const seriesKey = comic.volume
          ? `${comic.series} - ${comic.volume}`
          : comic.series;

        if (!acc[publisher]) {
          acc[publisher] = {};
        }
        if (!acc[publisher][seriesKey]) {
          acc[publisher][seriesKey] = [];
        }
        acc[publisher][seriesKey].push(comic);
        return acc;
      }, {});
    } catch (error) {
      console.error("Error grouping comics:", error);
      setError(
        "An error occurred while processing the comics. Some data may not be displayed correctly."
      );
      return {};
    }
  }, [comics]);

  const toggleAll = () => {
    setIsAllExpanded(!isAllExpanded);
    if (!isAllExpanded) {
      const allPublishers = Object.keys(groupedComics);
      const allSeries = allPublishers.flatMap((publisher) =>
        Object.keys(groupedComics[publisher])
      );
      setExpandedPublishers(allPublishers);
      setExpandedSeries(allSeries);
    } else {
      setExpandedPublishers([]);
      setExpandedSeries([]);
    }
  };

  const togglePublisher = (publisher: string) => {
    setExpandedPublishers((prev) => {
      if (prev.includes(publisher)) {
        // If collapsing a publisher, also collapse all its series
        setExpandedSeries((series) =>
          series.filter(
            (s) => !Object.keys(groupedComics[publisher]).includes(s)
          )
        );
        return prev.filter((p) => p !== publisher);
      } else {
        return [...prev, publisher];
      }
    });
  };

  const toggleSeries = (seriesKey: string) => {
    setExpandedSeries((prev) =>
      prev.includes(seriesKey)
        ? prev.filter((s) => s !== seriesKey)
        : [...prev, seriesKey]
    );
  };

  const handlePageChange = (series: string, newPage: number) => {
    setCurrentPages((prev) => ({ ...prev, [series]: newPage }));
  };

  const LoadingSpinner = () => <div>Loading...</div>;

  return (
    <S.ComicListContainer data-sc="ComicListContainer">
      <Suspense fallback={<LoadingSpinner />}>
        {error && (
          <ErrorMessage
            message={error}
            type="error"
            onDismiss={() => setError(null)}
          />
        )}
        <S.ExpandContainer data-sc="ExpandContainer">
          <S.ToggleButton onClick={toggleAll} data-sc="ToggleButton">
            {isAllExpanded ? "Collapse All" : "Expand All"}
          </S.ToggleButton>
        </S.ExpandContainer>
        <S.PublisherGrid data-sc="PublisherGrid">
          {Object.entries(groupedComics).map(([publisher, publisherComics]) => (
            <S.PublisherCard
              key={publisher}
              $isExpanded={expandedPublishers.includes(publisher)}
              data-sc="PublisherCard"
            >
              <S.PublisherButton
                $isExpanded={expandedPublishers.includes(publisher)}
                onClick={() => togglePublisher(publisher)}
              >
                <S.PublisherName>{publisher}</S.PublisherName>
                <S.SeriesCount>
                  {Object.keys(publisherComics).length} series
                </S.SeriesCount>
              </S.PublisherButton>
              <S.SeriesList
                className={
                  expandedPublishers.includes(publisher) ? "expanded" : ""
                }
              >
                {Object.entries(publisherComics).map(
                  ([seriesKey, comicList]) => (
                    <SeriesCard
                      key={seriesKey}
                      seriesKey={seriesKey}
                      comicList={comicList}
                      $isExpanded={expandedSeries.includes(seriesKey)}
                      toggleSeries={toggleSeries}
                      currentPage={currentPages[seriesKey] || 1}
                      itemsPerPage={itemsPerPage}
                      onCollect={onCollect}
                      onPageChange={(newPage) =>
                        handlePageChange(seriesKey, newPage)
                      }
                    />
                  )
                )}
              </S.SeriesList>
            </S.PublisherCard>
          ))}
        </S.PublisherGrid>
        <ToTopButton />
      </Suspense>
    </S.ComicListContainer>
  );
};

export default ComicList;
