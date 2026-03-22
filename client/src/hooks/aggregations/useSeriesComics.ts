import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { AggregationFilters } from "./types";
import { Comic, FavoriteSeries } from "../../types";
import { getApiBaseUrl, buildQueryParams } from "../utils";
import {
  applyPendingPatchesToComics,
  hasOfflineComicsSync,
  getMergedOfflineComics,
} from "../../utils/db";
import { querySeriesComicsOffline } from "../../utils/offlineComicQuery";
import { isLikelyOfflineFetchFailure } from "../offlineRead";

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
  extraFilters: AggregationFilters = {},
  favoriteSeries: FavoriteSeries[] = []
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
      extraFilters.type,
      extraFilters.minValue,
      extraFilters.maxValue,
      extraFilters.storageLocation,
      extraFilters.search,
      extraFilters.filterOption,
      extraFilters.sortBy,
      extraFilters.sortOrder,
    ]
  );

  const fetchComics = useCallback(
    async (silent: boolean = false) => {
      console.log("🔄 useSeriesComics fetchComics called", {
        enabled,
        publisher,
        series,
        sortBy: extraFilters.sortBy,
        silent,
      });

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

        // Set default order if no sortBy is specified
        if (!extraFilters.sortBy) {
          params.set("order", "series.asc,issueNumber.asc,id.asc");
        }

        const limit = Math.min(perPage, 2000);
        const offset = (page - 1) * limit;
        params.set("offset", String(offset));
        params.set("limit", String(limit));

        const extra = buildQueryParams(extraFilters);
        if (extra) {
          const extraQS = new URLSearchParams(extra);
          const orderDir = extraFilters.sortOrder ?? "asc";
          extraQS.forEach((v, k) => {
            if (k === "sortBy") {
              params.set("order", `${v}.${orderDir},id.asc`);
            } else {
              params.set(k, v);
            }
          });
        }

        const paramsString = params.toString();

        console.log("🌐 useSeriesComics API call", {
          url: `${getApiBaseUrl()}/comics?${paramsString}`,
          params: Object.fromEntries(params.entries()),
          sortBy: extraFilters.sortBy,
        });

        // Check if params have changed
        if (silent && paramsString === lastFetchParamsRef.current) {
          console.log("⏭️ Skipping refetch - params unchanged");
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
        const mergedList = await applyPendingPatchesToComics(list);

        // Always update comics, whether silent or not
        setComics(mergedList);

        return mergedList;
      } catch (err: any) {
        if (isLikelyOfflineFetchFailure(err)) {
          if (await hasOfflineComicsSync()) {
            try {
              const limit = Math.min(perPage, 2000);
              const offset = (page - 1) * limit;
              const order = !extraFilters.sortBy
                ? "series.asc,issueNumber.asc,id.asc"
                : `${extraFilters.sortBy}.${extraFilters.sortOrder ?? "asc"},id.asc`;
              const merged = await getMergedOfflineComics();
              const fromIdb = querySeriesComicsOffline(merged, {
                publisher: publisher!,
                series: series!,
                volume,
                extraFilters,
                favoriteSeries,
                offset,
                limit,
                order,
              });
              console.warn(
                "📦 Using synced IndexedDB comics (offline / network error)"
              );
              setComics(fromIdb);
              return fromIdb;
            } catch (idbError) {
              console.error("Failed to load series comics from IDB", idbError);
            }
          }
        }

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
    [
      memoized,
      comics,
      publisher,
      series,
      volume,
      page,
      perPage,
      extraFilters.sortBy,
      extraFilters.sortOrder,
      favoriteSeries,
      enabled,
    ]
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

  // Silent refetch on filter/sort changes (including sortBy and sortOrder)
  useEffect(() => {
    // Only run when base params are valid
    if (!enabled || !publisher || !series) return;
    fetchComics(true);
  }, [
    // filter deps
    extraFilters.publisher,
    extraFilters.series,
    extraFilters.collected,
    extraFilters.isGrail,
    extraFilters.signed,
    extraFilters.grade,
    extraFilters.storageLocation,
    extraFilters.search,
    extraFilters.filterOption,
    extraFilters.sortBy,
    extraFilters.sortOrder,
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
