import { useState, useEffect, useCallback, useMemo } from "react";
import { AggregationFilters, ComicStats } from "./types";
import { getApiBaseUrl, buildQueryParams } from "../utils";

/**
 * Hook for fetching comic statistics
 */
export const useComicStats = (filters: AggregationFilters = {}) => {
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

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching comic stats with filters:", memoizedFilters);

      // Convert filters to query parameters
      const params = buildQueryParams(memoizedFilters);
      const url = `${getApiBaseUrl()}/comics/stats?${params}`;

      console.log("📡 Requesting:", url);

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        throw new Error(
          `Failed to fetch stats: ${response.status} - ${errorText}`
        );
      }

      const data: ComicStats = await response.json();
      setStats(data);

      console.log("✅ Stats loaded:", data);
    } catch (err: any) {
      console.error("❌ Error fetching stats:", err);
      setError(err.message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
