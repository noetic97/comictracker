import React, { useState, useMemo, lazy, Suspense } from "react";
import {
  Comic,
  PublisherGroupedComics,
  FavoriteSeries,
  FilterOption,
  ViewMode,
} from "../../types";
import * as S from "./styles";
import { isValidComic } from "../../utils/validation";
import { sortSeriesKeysIgnoringArticles } from "../../utils/sortingUtils";
import ErrorMessage from "../shared/ErrorMessage";

const SeriesCard = lazy(() => import("./SeriesCard"));
const ToTopButton = lazy(() => import("./ToTopButton"));
const SeriesDetailView = lazy(() => import("../SeriesDetailView"));

interface Props {
  comics: Comic[];
  onCollect: (id: string) => void;
  onToggleGrail: (id: string) => void;
  itemsPerPage: number;
  filterOption: FilterOption;
  favoriteSeries: FavoriteSeries[];
  onToggleFavoriteSeries: (
    publisher: string,
    series: string,
    volume: string
  ) => void;
}

interface Props {
  comics: Comic[];
  onCollect: (id: string) => void;
  onToggleGrail: (id: string) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  filterOption: FilterOption;
  favoriteSeries: FavoriteSeries[];
  onToggleFavoriteSeries: (
    publisher: string,
    series: string,
    volume: string
  ) => void;
}

const ComicList: React.FC<Props> = ({
  comics,
  onCollect,
  onToggleGrail,
  itemsPerPage,
  setItemsPerPage,
  filterOption,
  favoriteSeries,
  onToggleFavoriteSeries,
}) => {
  const [expandedPublishers, setExpandedPublishers] = useState<string[]>([]);
  const [expandedSeries, setExpandedSeries] = useState<string[]>([]);
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [currentPages, setCurrentPages] = useState<{ [key: string]: number }>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedSeries, setSelectedSeries] = useState<{
    publisher: string;
    series: string;
    volume?: string;
  } | null>(null);

  // Filter comics based on filter option
  const filteredComics = useMemo(() => {
    return comics.filter((comic) => {
      switch (filterOption) {
        case "favoriteSeriesOnly":
          return favoriteSeries.some(
            (fav) =>
              fav.publisher === comic.publisher &&
              fav.series === comic.series &&
              fav.volume === comic.volume
          );
        case "grailComicsOnly":
          return comic.isGrail;
        case "collected":
          return comic.collected;
        case "uncollected":
          return !comic.collected;
        default:
          return true;
      }
    });
  }, [comics, filterOption, favoriteSeries]);

  const groupedComics = useMemo(() => {
    try {
      const grouped = filteredComics.reduce(
        (acc: PublisherGroupedComics, comic) => {
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
        },
        {}
      );

      // Sort series within each publisher using the new sorting logic
      Object.keys(grouped).forEach((publisher) => {
        const seriesKeys = Object.keys(grouped[publisher]);
        const sortedKeys = sortSeriesKeysIgnoringArticles(seriesKeys);

        const sortedSeries: { [key: string]: Comic[] } = {};
        sortedKeys.forEach((key) => {
          sortedSeries[key] = grouped[publisher][key];
        });

        grouped[publisher] = sortedSeries;
      });

      return grouped;
    } catch (error) {
      console.error("Error grouping comics:", error);
      setError(
        "An error occurred while processing the comics. Some data may not be displayed correctly."
      );
      return {};
    }
  }, [filteredComics]);

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

  const handleOpenDetailView = (
    publisher: string,
    series: string,
    volume?: string
  ) => {
    setSelectedSeries({ publisher, series, volume });
    setViewMode("series-detail");
  };

  const handleBackToGrid = () => {
    setViewMode("grid");
    setSelectedSeries(null);
  };

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

  const LoadingSpinner = () => <div>Loading...</div>;

  // Render series detail view
  if (viewMode === "series-detail" && selectedSeries) {
    const seriesComics = filteredComics.filter(
      (comic) =>
        comic.publisher === selectedSeries.publisher &&
        comic.series === selectedSeries.series &&
        comic.volume === (selectedSeries.volume || "")
    );

    const isFavorite = isFavoriteSeries(
      selectedSeries.publisher,
      selectedSeries.series,
      selectedSeries.volume || ""
    );

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <SeriesDetailView
          comics={seriesComics}
          publisher={selectedSeries.publisher}
          series={selectedSeries.series}
          volume={selectedSeries.volume}
          onCollect={onCollect}
          onToggleGrail={onToggleGrail}
          onBack={handleBackToGrid}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          isFavorite={isFavorite}
          onToggleFavorite={() =>
            onToggleFavoriteSeries(
              selectedSeries.publisher,
              selectedSeries.series,
              selectedSeries.volume || ""
            )
          }
        />
      </Suspense>
    );
  }

  // Render grid view
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
                      onToggleGrail={onToggleGrail}
                      onPageChange={(newPage) =>
                        handlePageChange(seriesKey, newPage)
                      }
                      onOpenDetailView={handleOpenDetailView}
                      isFavorite={isFavoriteSeries(
                        comicList[0].publisher,
                        comicList[0].series,
                        comicList[0].volume
                      )}
                      onToggleFavorite={() =>
                        onToggleFavoriteSeries(
                          comicList[0].publisher,
                          comicList[0].series,
                          comicList[0].volume
                        )
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
