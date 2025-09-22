import { useState, useEffect, useCallback, useMemo } from "react";
import { AggregationFilters, ComicStats } from "./types";
import { getApiBaseUrl, buildQueryParams } from "../utils";
import { logger } from "../../utils/logger";
import { FavoriteSeries } from "../../types";

/**
 * Hook for fetching comic statistics
 */
export const useComicStats = (
  filters: AggregationFilters = {},
  favoriteSeries: FavoriteSeries[] = []
) => {
  const [stats, setStats] = useState<ComicStats | null>(null);
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
      filters.storageLocation,
      filters.search,
      filters.filterOption,
    ]
  );

  // TODO: Implement favoriteSeriesOnly stats filtering
  // This requires complex server-side logic to calculate stats for only favorite series
  // For now, stats will show all comics even when favoriteSeriesOnly is selected

  const fetchStats = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }

        logger.stats.debug("Fetching comic stats", {
          filters: memoizedFilters,
        });

        // Convert filters to query parameters
        const params = buildQueryParams(memoizedFilters);
        const url = `${getApiBaseUrl()}/comics/stats?${params}`;

        logger.api.debug("Stats API request", { url });

        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          logger.api.error("Stats API error response", {
            status: response.status,
            errorText,
          });
          throw new Error(
            `Failed to fetch stats: ${response.status} - ${errorText}`
          );
        }

        const data: ComicStats = await response.json();
        setStats(data);

        logger.stats.info("Stats loaded successfully", {
          total: data.total,
          collected: data.collected,
          grails: data.grails,
        });
        return data;
      } catch (err: any) {
        logger.stats.error("Failed to fetch stats", err);
        if (!silent) {
          setError(err.message);
          setStats(null);
        }
        return null;
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [memoizedFilters]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const silentRefetch = useCallback(() => fetchStats(true), [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    silentRefetch,
  };
};
