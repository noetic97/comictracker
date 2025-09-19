import { useMemo } from "react";
import {
  Comic,
  PublisherGroupedComics,
  FavoriteSeries,
  FilterOption,
} from "../types";
import { isValidComic } from "../utils/validation/validation";
import { sortSeriesKeysIgnoringArticles } from "../utils/sortingUtils";

interface ComicGroupingResult {
  filteredComics: Comic[];
  groupedComics: PublisherGroupedComics;
  stats: {
    total: number;
    filtered: number;
    collected: number;
    grails: number;
    totalValue: number;
    collectedValue: number;
  };
}

interface UseComicGroupingOptions {
  onError?: (error: string) => void;
}

export const useComicGrouping = (
  comics: Comic[],
  filterOption: FilterOption,
  favoriteSeries: FavoriteSeries[],
  options: UseComicGroupingOptions = {}
): ComicGroupingResult => {
  const { onError } = options;

  // In your useComicGrouping hook, add debug logging
  console.log("📊 All comics received:", comics.length);
  console.log(
    "🔍 Marvel comic found:",
    comics.find((c) => c.publisher === "Marvel")
  );
  console.log(
    "📋 All publishers:",
    [...new Set(comics.map((c) => c.publisher))].sort()
  );

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

  // Calculate statistics
  const stats = useMemo(() => {
    const total = comics.length;
    const filtered = filteredComics.length;
    const collected = comics.filter((comic) => comic.collected).length;
    const grails = comics.filter((comic) => comic.isGrail).length;
    const totalValue = comics.reduce(
      (sum, comic) => sum + (comic.currentValue ?? 0),
      0
    );

    console.log({ comics });

    return {
      total,
      filtered,
      collected,
      grails,
      totalValue,
      collectedValue: comics
        .filter((comic) => comic.collected)
        .reduce((sum, comic) => sum + (comic.currentValue ?? 0), 0),
    };
  }, [comics, filteredComics]);

  // Group and sort comics by publisher and series
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

      // Sort series within each publisher using the sorting utility
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
      const errorMessage =
        "An error occurred while processing the comics. Some data may not be displayed correctly.";

      onError?.(errorMessage);

      return {};
    }
  }, [filteredComics, onError]);

  return {
    filteredComics,
    groupedComics,
    stats,
  };
};
