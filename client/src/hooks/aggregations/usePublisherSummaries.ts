import { AggregationFilters, PublisherSummary } from "./types";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  getApiBaseUrl,
  buildQueryParams,
  getCachedApiResponse,
  setCachedApiResponse,
} from "../utils";
import { logger } from "../../utils/logger";
import { FavoriteSeries } from "../../types";

/**
 * Hook for fetching publisher summaries
 */
export const usePublisherSummaries = (
  filters: AggregationFilters = {},
  favoriteSeries: FavoriteSeries[] = []
) => {
  const [publishers, setPublishers] = useState<PublisherSummary[]>([]);
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

  const fetchPublishers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 usePublisherSummaries fetchPublishers called", {
        filters: memoizedFilters,
        sortBy: memoizedFilters.sortBy,
      });
      logger.stats.debug("Fetching publishers", { filters: memoizedFilters });

      const params = buildQueryParams(memoizedFilters);
      const url = `${getApiBaseUrl()}/comics/publishers?${params}`;

      console.log("🌐 usePublisherSummaries API call", {
        url,
        params: Object.fromEntries(new URLSearchParams(params).entries()),
      });

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch publishers: ${response.status} - ${errorText}`
        );
      }

      let data: PublisherSummary[] = await response.json();

      setPublishers(data);

      // Cache publishers for offline use
      void setCachedApiResponse(url, data);

      logger.stats.info("Publishers loaded successfully", {
        count: data.length,
        filtered:
          memoizedFilters.filterOption === "favoriteSeriesOnly"
            ? "favorites only"
            : "all",
      });
    } catch (err: any) {
      const isOffline =
        typeof navigator !== "undefined" && navigator.onLine === false;

      if (isOffline) {
        try {
          const params = buildQueryParams(memoizedFilters);
          const offlineUrl = `${getApiBaseUrl()}/comics/publishers?${params}`;
          const cached =
            await getCachedApiResponse<PublisherSummary[]>(offlineUrl);
          if (cached && cached.length > 0) {
            logger.stats.warn(
              "Using cached publisher summaries due to offline/network error"
            );
            setPublishers(cached);
            return;
          }
        } catch (cacheError) {
          logger.stats.error(
            "Failed to load cached publisher summaries",
            cacheError
          );
        }
      }

      logger.stats.error("Failed to fetch publishers", err);
      setError(err.message);
      setPublishers([]);
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  useEffect(() => {
    fetchPublishers();
  }, [fetchPublishers]);

  return {
    publishers,
    loading,
    error,
    refetch: fetchPublishers,
  };
};
