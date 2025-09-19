import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { AggregationFilters, Comic } from "./types";
import { getApiBaseUrl, buildQueryParams } from "../utils";

/**
 * Hook for fetching comics with silent refetch capability
 */
export const useSeriesComics = (
  publisher: string | null,
  series: string | null,
  volume: string | null,
  page: number,
  perPage: number,
  enabled: boolean,
  extraFilters: AggregationFilters = {}
) => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Track the last fetch params to detect changes
  const lastFetchParamsRef = useRef<string>("");

  const memoized = useMemo(
    () => ({ publisher, series, volume, page, perPage, enabled, extraFilters }),
    [
      publisher,
      series,
      volume,
      page,
      perPage,
      enabled,
      extraFilters.publisher,
      extraFilters.series,
      extraFilters.collected,
      extraFilters.isGrail,
      extraFilters.signed,
      extraFilters.grade,
      extraFilters.storageLocation,
      extraFilters.search,
      extraFilters.filterOption,
    ]
  );

  const fetchComics = useCallback(
    async (silent: boolean = false) => {
      if (!enabled || !publisher || !series) {
        if (!silent) setComics([]);
        return [];
      }

      try {
        // Only show loading state if not a silent refresh
        if (!silent) {
          setLoading(true);
          setError(null);
        } else {
          setIsRefreshing(true);
        }

        const params = new URLSearchParams();
        params.set("exact", "true");
        params.set("publisher", publisher);
        params.set("series", series);
        if (volume) params.set("volume", volume);
        params.set("order", "series.asc,issueNumber.asc,id.asc");

        const offset = (page - 1) * perPage;
        params.set("offset", String(offset));
        params.set("limit", String(perPage));

        const extra = buildQueryParams(extraFilters);
        if (extra) {
          const extraQS = new URLSearchParams(extra);
          extraQS.forEach((v, k) => params.set(k, v));
        }

        const paramsString = params.toString();

        // Check if params have changed
        if (silent && paramsString === lastFetchParamsRef.current) {
          // Skip refetch if params haven't changed
          return comics;
        }

        lastFetchParamsRef.current = paramsString;

        const url = `${getApiBaseUrl()}/comics?${paramsString}`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch comics: ${response.status} - ${errorText}`
          );
        }

        const raw = await response.json();
        const list: Comic[] = Array.isArray(raw) ? raw : raw?.comics ?? [];

        // Always update comics, whether silent or not
        setComics(list);

        return list;
      } catch (err: any) {
        if (!silent) {
          console.error("❌ Error fetching series comics:", err);
          setError(err.message || "Unknown error");
          setComics([]);
        }
        return [];
      } finally {
        if (!silent) {
          setLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [memoized, comics]
  );

  // Standard refetch that shows loading state
  const refetch = useCallback(() => {
    return fetchComics(false);
  }, [fetchComics]);

  // Silent refetch that doesn't show loading state
  const silentRefetch = useCallback(() => {
    return fetchComics(true);
  }, [fetchComics]);

  // Update a single comic in the list without refetching
  const updateComic = useCallback((updatedComic: Comic) => {
    setComics((prevComics) =>
      prevComics.map((comic) =>
        comic.id === updatedComic.id ? updatedComic : comic
      )
    );
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchComics(false);
  }, [
    memoized.publisher,
    memoized.series,
    memoized.volume,
    memoized.page,
    memoized.perPage,
    memoized.enabled,
  ]);

  return {
    comics,
    loading,
    error,
    isRefreshing,
    refetch,
    silentRefetch,
    updateComic,
  };
};
