import { AggregationFilters } from "./aggregations/types";

export const getApiBaseUrl = (): string => {
  // In development, use the dev server port (usually 8888 for Netlify Dev)
  if (import.meta.env.DEV) {
    return "http://localhost:9999/.netlify/functions";
  }

  // In production, use relative path
  return "/.netlify/functions";
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
  if (filters.storageLocation)
    params.set("storageLocation", filters.storageLocation);
  if (filters.search) params.set("search", filters.search);

  // Handle the special filterOption cases
  if (filters.filterOption && filters.filterOption !== "all") {
    switch (filters.filterOption) {
      case "collected":
        params.set("collected", "true");
        break;
      case "uncollected":
        params.set("collected", "false");
        break;
      case "grails":
        params.set("isGrail", "true");
        break;
      case "signed":
        params.set("signed", "true");
        break;
    }
  }

  return params.toString();
};
