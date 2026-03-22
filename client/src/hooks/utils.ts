import { AggregationFilters } from "./aggregations/types";

export const getApiBaseUrl = (): string => {
  // Same as apiService: relative /api (proxied to API server in dev)
  return import.meta.env.VITE_API_BASE_URL ?? "/api";
};

// Helper to build query parameters from filters
export const buildQueryParams = (filters: AggregationFilters): string => {
  const params = new URLSearchParams();

  if (filters.publisher) params.set("publisher", filters.publisher);
  if (filters.series) params.set("series", filters.series);
  if (filters.volume) params.set("volume", filters.volume);
  if (filters.collected !== undefined)
    params.set("collected", String(filters.collected));
  if (filters.isGrail !== undefined)
    params.set("isGrail", String(filters.isGrail));
  if (filters.signed !== undefined)
    params.set("signed", String(filters.signed));
  if (filters.grade) params.set("grade", filters.grade);
  if (filters.type) params.set("type", filters.type);
  if (filters.minValue !== undefined && filters.minValue !== "")
    params.set("minValue", String(filters.minValue));
  if (filters.maxValue !== undefined && filters.maxValue !== "")
    params.set("maxValue", String(filters.maxValue));
  if (filters.storageLocation)
    params.set("storageLocation", filters.storageLocation);
  if (filters.search) params.set("search", filters.search);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);

  // Handle the special filterOption cases
  if (filters.filterOption && filters.filterOption !== "all") {
    switch (filters.filterOption) {
      case "collected":
        params.set("collected", "true");
        break;
      case "uncollected":
        params.set("collected", "false");
        break;
      case "grailComicsOnly":
        params.set("isGrail", "true");
        break;
      case "signed":
        params.set("signed", "true");
        break;
      case "favoriteSeriesOnly":
        params.set("favoriteSeriesOnly", "true");
        break;
    }
  }

  return params.toString();
};
