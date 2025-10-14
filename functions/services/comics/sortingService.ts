/**
 * Server-side sorting utilities for comics
 * Provides article-aware sorting that matches client-side sortingUtils.ts behavior
 */

import { PublisherSummary } from "../../types/services";

// Common articles to ignore when sorting (matches client-side)
const ARTICLES = ["the", "a", "an"];

/**
 * Removes common articles from the beginning of a string for sorting purposes
 * Server-side version of client/src/utils/sortingUtils.ts normalizeForSorting
 * @param text - The text to normalize
 * @returns The text with articles removed from the beginning
 */
export const normalizeForSorting = (text: string): string => {
  if (!text || typeof text !== "string") {
    return "";
  }

  const trimmed = text.trim().toLowerCase();

  for (const article of ARTICLES) {
    if (trimmed.startsWith(article + " ")) {
      return trimmed.slice(article.length + 1);
    }
  }

  return trimmed;
};

/**
 * Creates a sort key for series that ignores articles
 * Server-side version of client-side createSeriesSortKey
 * @param series - Series name
 * @param volume - Volume (optional)
 * @returns A normalized sort key
 */
export const createSeriesSortKey = (
  series: string,
  volume?: string | null
): string => {
  const normalizedSeries = normalizeForSorting(series);
  return volume
    ? `${normalizedSeries} - ${volume.toLowerCase()}`
    : normalizedSeries;
};

export type PublisherSortField =
  | "publisher"
  | "seriesCount"
  | "totalComics"
  | "collectedComics"
  | "grailComics"
  | "totalValue";

/**
 * Sort publishers with article-aware alphabetical sorting as default
 * @param publishers - Array of publisher summaries
 * @param sortBy - Field to sort by (defaults to publisher name)
 * @param ascending - Sort direction (defaults based on field type)
 * @returns Sorted array of publishers
 */
export const sortPublishers = (
  publishers: PublisherSummary[],
  sortBy?: PublisherSortField,
  ascending?: boolean
): PublisherSummary[] => {
  return [...publishers].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "publisher":
      case undefined: // Default case
        const normalizedA = normalizeForSorting(a.publisher);
        const normalizedB = normalizeForSorting(b.publisher);
        comparison = normalizedA.localeCompare(normalizedB);
        // Publisher names default to ascending
        return ascending === false ? -comparison : comparison;

      case "seriesCount":
        comparison = a.seriesCount - b.seriesCount;
        // Numeric fields default to descending (show largest first)
        return ascending === true ? comparison : -comparison;

      case "totalComics":
        comparison = a.totalComics - b.totalComics;
        return ascending === true ? comparison : -comparison;

      case "collectedComics":
        comparison = a.collectedComics - b.collectedComics;
        return ascending === true ? comparison : -comparison;

      case "grailComics":
        comparison = a.grailComics - b.grailComics;
        return ascending === true ? comparison : -comparison;

      case "totalValue":
        comparison = a.totalValue - b.totalValue;
        return ascending === true ? comparison : -comparison;

      default:
        // Fallback to publisher name
        const fallbackA = normalizeForSorting(a.publisher);
        const fallbackB = normalizeForSorting(b.publisher);
        return fallbackA.localeCompare(fallbackB);
    }
  });
};

/**
 * Series sorting types and utilities
 */
export interface SeriesSummary {
  publisher: string;
  series: string;
  volume: string;
  issueCount: number;
  collectedCount: number;
  grailCount: number;
  totalValue: number;
  collectedValue: number;
}

export type SeriesSortField =
  | "series"
  | "issueCount"
  | "collectedCount"
  | "grailCount"
  | "totalValue"
  | "collectedValue";

/**
 * Sort series with article-aware alphabetical sorting as default
 * @param series - Array of series summaries
 * @param sortBy - Field to sort by (defaults to series name)
 * @param ascending - Sort direction (defaults based on field type)
 * @returns Sorted array of series
 */
export const sortSeries = (
  series: SeriesSummary[],
  sortBy?: SeriesSortField,
  ascending?: boolean
): SeriesSummary[] => {
  return [...series].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "series":
      case undefined: // Default case
        // First compare by series name (ignoring articles)
        const normalizedSeriesA = normalizeForSorting(a.series);
        const normalizedSeriesB = normalizeForSorting(b.series);
        comparison = normalizedSeriesA.localeCompare(normalizedSeriesB);

        // If series names are equal, compare by volume
        if (comparison === 0) {
          comparison = a.volume.localeCompare(b.volume);
        }

        // Series names default to ascending
        return ascending === false ? -comparison : comparison;

      case "issueCount":
        comparison = a.issueCount - b.issueCount;
        // Numeric fields default to descending (show largest first)
        return ascending === true ? comparison : -comparison;

      case "collectedCount":
        comparison = a.collectedCount - b.collectedCount;
        return ascending === true ? comparison : -comparison;

      case "grailCount":
        comparison = a.grailCount - b.grailCount;
        return ascending === true ? comparison : -comparison;

      case "totalValue":
        comparison = a.totalValue - b.totalValue;
        return ascending === true ? comparison : -comparison;

      case "collectedValue":
        comparison = a.collectedValue - b.collectedValue;
        return ascending === true ? comparison : -comparison;

      default:
        // Fallback to series name + volume
        const fallbackSeriesA = normalizeForSorting(a.series);
        const fallbackSeriesB = normalizeForSorting(b.series);
        const fallbackComparison =
          fallbackSeriesA.localeCompare(fallbackSeriesB);
        if (fallbackComparison === 0) {
          return a.volume.localeCompare(b.volume);
        }
        return fallbackComparison;
    }
  });
};

/**
 * Comic sorting types and utilities
 */
export interface Comic {
  id: string;
  publisher: string;
  series: string;
  volume: string;
  issue: string;
  issueNumber: number;
  currentValue: number;
  pricePaid: number;
  grade: string;
  createdAt: string;
  collected: boolean;
  isGrail: boolean;
}

export type ComicSortField =
  | "series"
  | "publisher"
  | "currentValue"
  | "pricePaid"
  | "grade"
  | "createdAt"
  | "issue"
  | "issueNumber"
  | "collected";

/**
 * Sort comics with proper hierarchical default (series -> issueNumber -> id)
 * @param comics - Array of comics
 * @param sortBy - Field to sort by
 * @param ascending - Sort direction (defaults based on field type)
 * @returns Sorted array of comics
 */
export const sortComics = (
  comics: Comic[],
  sortBy?: ComicSortField,
  ascending?: boolean
): Comic[] => {
  return [...comics].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "series":
        const normalizedSeriesA = normalizeForSorting(a.series);
        const normalizedSeriesB = normalizeForSorting(b.series);
        comparison = normalizedSeriesA.localeCompare(normalizedSeriesB);
        return ascending === false ? -comparison : comparison;

      case "publisher":
        const normalizedPubA = normalizeForSorting(a.publisher);
        const normalizedPubB = normalizeForSorting(b.publisher);
        comparison = normalizedPubA.localeCompare(normalizedPubB);
        return ascending === false ? -comparison : comparison;

      case "currentValue":
        comparison = (a.currentValue || 0) - (b.currentValue || 0);
        return ascending === true ? comparison : -comparison;

      case "pricePaid":
        comparison = (a.pricePaid || 0) - (b.pricePaid || 0);
        return ascending === true ? comparison : -comparison;

      case "grade":
        comparison = (a.grade || "").localeCompare(b.grade || "");
        return ascending === false ? -comparison : comparison;

      case "createdAt":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return ascending === true ? comparison : -comparison;

      case "issue":
        comparison = (a.issue || "").localeCompare(b.issue || "");
        return ascending === false ? -comparison : comparison;

      case "collected":
        comparison = Number(a.collected) - Number(b.collected);
        return ascending === false ? -comparison : comparison;

      case "issueNumber":
      case undefined: // Default case
      default:
        // Default hierarchical sorting: series -> issueNumber -> id
        if (!sortBy) {
          // First by series name (ignoring articles)
          const seriesA = normalizeForSorting(a.series);
          const seriesB = normalizeForSorting(b.series);
          const seriesComparison = seriesA.localeCompare(seriesB);

          if (seriesComparison !== 0) {
            return seriesComparison;
          }

          // Then by issue number (numeric)
          const issueComparison = (a.issueNumber || 0) - (b.issueNumber || 0);
          if (issueComparison !== 0) {
            return issueComparison;
          }

          // Finally by ID for deterministic ordering
          return a.id.localeCompare(b.id);
        }

        // issueNumber sorting
        comparison = (a.issueNumber || 0) - (b.issueNumber || 0);
        return ascending === false ? -comparison : comparison;
    }
  });
};

/**
 * Utility to parse old-style sort strings from the API
 * Converts "series.asc" or "currentValue.desc" to structured format
 * @param orderString - String like "series.asc,issueNumber.desc"
 * @returns Parsed sort configuration
 */
export const parseSortString = (
  orderString?: string
): {
  field?: ComicSortField;
  ascending?: boolean;
} => {
  if (!orderString) {
    return {};
  }

  const parts = orderString.split(",")[0]?.split(".") || [];
  const field = parts[0] as ComicSortField;
  const direction = parts[1];

  return {
    field,
    ascending: direction !== "desc",
  };
};
