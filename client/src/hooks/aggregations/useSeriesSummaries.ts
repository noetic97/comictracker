import { useState, useCallback, useMemo, useEffect } from "react";
import { AggregationFilters, SeriesSummary } from "./types";
import { getApiBaseUrl, buildQueryParams } from "../utils";
import { FavoriteSeries } from "../../types";

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

      setSeries(data);

      console.log(`✅ Series loaded for ${publisher}:`, data.length);
    } catch (err: any) {
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
