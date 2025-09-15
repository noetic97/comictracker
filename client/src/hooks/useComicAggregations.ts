import { useState, useEffect, useCallback, useMemo } from "react";
import { FilterOption } from "../types";

/**
 * Get the correct API base URL based on environment
 */
const getApiBaseUrl = (): string => {
  // In development, use the dev server port (usually 8888 for Netlify Dev)
  if (import.meta.env.DEV) {
    return "http://localhost:9999/.netlify/functions";
  }

  // In production, use relative path
  return "/.netlify/functions";
};
// Types matching our backend interfaces
export interface ComicStats {
  total: number;
  collected: number;
  grails: number;
  totalValue: number;
  collectedValue: number;
}

export interface PublisherSummary {
  publisher: string;
  seriesCount: number;
  totalComics: number;
  collectedComics: number;
  grailComics: number;
  totalValue: number;
}

export interface SeriesSummary {
  publisher: string;
  series: string;
  volume: string;
  issueCount: number;
  collectedCount: number;
  grailCount: number;
  totalValue: number;
  collectedValue: number;
  isFavorite?: boolean;
}

export interface Comic {
  id: string;
  publisher: string;
  series: string;
  volume?: string;
  issue: string;
  years?: string;
  currentValue?: number;
  collected: boolean;
  isGrail: boolean;
}

export interface AggregationFilters {
  publisher?: string;
  series?: string;
  collected?: boolean;
  isGrail?: boolean;
  signed?: boolean;
  grade?: string;
  storageLocation?: string;
  search?: string;
  filterOption?: FilterOption;
}

/**
 * Helper function to build query parameters from filters
 */
const buildQueryParams = (filters: AggregationFilters): string => {
  const params = new URLSearchParams();

  // Apply FilterOption first (this affects other parameters)
  if (filters.filterOption) {
    switch (filters.filterOption) {
      case "collected":
        params.append("collected", "true");
        break;
      case "uncollected":
        params.append("collected", "false");
        break;
      case "grailComicsOnly":
        params.append("isGrail", "true");
        break;
      // favoriteSeriesOnly will be handled in the frontend by filtering results
    }
  }

  // Apply direct filters (these override filterOption if both are provided)
  if (filters.publisher) params.append("publisher", filters.publisher);
  if (filters.series) params.append("series", filters.series);
  if (filters.collected !== undefined) {
    params.append("collected", filters.collected.toString());
  }
  if (filters.isGrail !== undefined) {
    params.append("isGrail", filters.isGrail.toString());
  }
  if (filters.signed !== undefined) {
    params.append("signed", filters.signed.toString());
  }
  if (filters.grade) params.append("grade", filters.grade);
  if (filters.storageLocation)
    params.append("storageLocation", filters.storageLocation);
  if (filters.search) params.append("search", filters.search);

  return params.toString();
};

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
  }, [memoizedFilters]); // Use memoized filters as dependency

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

/**
 * Hook for fetching publisher summaries
 */
export const usePublisherSummaries = (filters: AggregationFilters = {}) => {
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
      filters.storageLocation,
      filters.search,
      filters.filterOption,
    ]
  );

  const fetchPublishers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching publishers with filters:", memoizedFilters);

      const params = buildQueryParams(memoizedFilters);
      const url = `${getApiBaseUrl()}/comics/publishers?${params}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch publishers: ${response.status} - ${errorText}`
        );
      }

      const data: PublisherSummary[] = await response.json();
      setPublishers(data);

      console.log("✅ Publishers loaded:", data.length);
    } catch (err: any) {
      console.error("❌ Error fetching publishers:", err);
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

/**
 * Hook for fetching series summaries for a specific publisher
 */
export const useSeriesSummaries = (
  publisher: string | null,
  filters: AggregationFilters = {}
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
      filters.storageLocation,
      filters.search,
      filters.filterOption,
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

      console.log(
        `🔄 Fetching series for ${publisher} with filters:`,
        memoizedFilters
      );

      const params = buildQueryParams({ ...memoizedFilters, publisher });
      const url = `${getApiBaseUrl()}/comics/series?${params}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch series: ${response.status} - ${errorText}`
        );
      }

      const data: SeriesSummary[] = await response.json();
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
/**
 * Hook for fetching a paginated list of comics for a given series
 * Only fetches when `enabled` is true (e.g., when the series row is expanded)
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

  // Memoize filter set so deps are stable
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

  const fetchComics = useCallback(async () => {
    if (!enabled || !publisher || !series) {
      setComics([]);
      return;
    }

    console.log("-------fetching comics-------");

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      // exact=true ensures we don't cross-contaminate similarly named series/publishers
      params.set("exact", "true");
      params.set("publisher", publisher);
      params.set("series", series);
      if (volume) params.set("volume", volume);

      // ordering to keep pagination deterministic
      params.set("order", "series.asc,issueNumber.asc,id.asc");

      // translate page/perPage to offset/limit
      const offset = (page - 1) * perPage;
      params.set("offset", String(offset));
      params.set("limit", String(perPage));

      // propagate any additional filters (e.g., collected/grail)
      const extra = buildQueryParams(extraFilters);

      console.log({ extra });

      if (extra) {
        const extraQS = new URLSearchParams(extra);
        extraQS.forEach((v, k) => params.set(k, v));
      }

      const url = `${getApiBaseUrl()}/comics?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch comics: ${response.status} - ${errorText}`
        );
      }

      const raw = await response.json();
      const list: Comic[] = Array.isArray(raw) ? raw : raw?.comics ?? [];
      setComics(list);
    } catch (err: any) {
      console.error("❌ Error fetching series comics:", err);
      setError(err.message || "Unknown error");
      setComics([]);
    } finally {
      setLoading(false);
    }
  }, [memoized]);

  useEffect(() => {
    fetchComics();
  }, [fetchComics]);

  return { comics, loading, error, refetch: fetchComics };
};
/**
 * Helper hook to combine all aggregations for dashboard view
 */
export const useComicDashboard = (filters: AggregationFilters = {}) => {
  const statsResult = useComicStats(filters);
  const publishersResult = usePublisherSummaries(filters);

  const loading = statsResult.loading || publishersResult.loading;
  const error = statsResult.error || publishersResult.error;

  return {
    stats: statsResult.stats,
    publishers: publishersResult.publishers,
    loading,
    error,
    refetch: () => {
      statsResult.refetch();
      publishersResult.refetch();
    },
  };
};
