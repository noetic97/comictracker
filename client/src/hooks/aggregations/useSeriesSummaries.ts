import { useState, useCallback, useMemo, useEffect } from "react";
import { AggregationFilters, SeriesSummary } from "./types";
import { getApiBaseUrl, buildQueryParams } from "../utils";
import { FavoriteSeries } from "../../types";
import {
  getAllPendingComicPatches,
  getMergedOfflineComics,
  hasOfflineComicsSync,
} from "../../utils/db";
import {
  computeSeriesSummaries,
  filterComicsForSeriesSummaries,
} from "../../utils/offlineComicQuery";
import { isLikelyOfflineFetchFailure } from "../offlineRead";

/**
 * Hook for fetching series summaries for a specific publisher
 */
export const useSeriesSummaries = (
  publisher: string | null,
  filters: AggregationFilters = {},
  favoriteSeries: FavoriteSeries[] = []
) => {
  const [series, setSeries] = useState<SeriesSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the filters to prevent infinite loops
  const memoizedFilters = useMemo(
    () => filters,
    [
      filters.publisher,
      filters.series,
      filters.collected,
      filters.isGrail,
      filters.signed,
      filters.grade,
      filters.type,
      filters.minValue,
      filters.maxValue,
      filters.storageLocation,
      filters.search,
      filters.filterOption,
      filters.sortBy,
    ]
  );

  const fetchSeries = useCallback(async () => {
    if (!publisher) {
      setSeries([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 useSeriesSummaries fetchSeries called for ${publisher}`, {
        filters: memoizedFilters,
        sortBy: memoizedFilters.sortBy,
      });

      const params = buildQueryParams({ ...memoizedFilters, publisher });
      const url = `${getApiBaseUrl()}/comics/series?${params}`;

      console.log("🌐 useSeriesSummaries API call", {
        url,
        params: Object.fromEntries(new URLSearchParams(params).entries()),
      });

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch series: ${response.status} - ${errorText}`
        );
      }

      let data: SeriesSummary[] = await response.json();

      const patchCount = Object.keys(await getAllPendingComicPatches()).length;
      if (patchCount > 0 && (await hasOfflineComicsSync())) {
        const merged = await getMergedOfflineComics();
        const filtered = filterComicsForSeriesSummaries(
          merged,
          publisher,
          memoizedFilters,
          favoriteSeries
        );
        data = computeSeriesSummaries(filtered, memoizedFilters.sortBy);
      }

      setSeries(data);

      console.log(`✅ Series loaded for ${publisher}:`, data.length);
    } catch (err: any) {
      if (
        isLikelyOfflineFetchFailure(err) &&
        (await hasOfflineComicsSync())
      ) {
        try {
          const merged = await getMergedOfflineComics();
          const filtered = filterComicsForSeriesSummaries(
            merged,
            publisher,
            memoizedFilters,
            favoriteSeries
          );
          const fromIdb = computeSeriesSummaries(
            filtered,
            memoizedFilters.sortBy
          );
          console.warn(
            "📦 Using synced IndexedDB for series summaries (offline / network error)"
          );
          setSeries(fromIdb);
          return;
        } catch (idbError) {
          console.error("IDB series summaries failed", idbError);
        }
      }

      console.error("❌ Error fetching series:", err);
      setError(err.message);
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }, [publisher, memoizedFilters]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  return {
    series,
    loading,
    error,
    refetch: fetchSeries,
  };
};
