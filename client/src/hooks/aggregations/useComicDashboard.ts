import { AggregationFilters } from "./types";
import { useComicStats } from "./useComicStats";
import { usePublisherSummaries } from "./usePublisherSummaries";

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
