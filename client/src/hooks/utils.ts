import { openDB, type DBSchema, type IDBPDatabase } from "idb";
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

// --- Simple IndexedDB-backed API response cache for offline reads ---

interface ApiCacheDB extends DBSchema {
  responses: {
    key: string;
    value: {
      key: string;
      data: unknown;
      timestamp: number;
    };
    indexes: {};
  };
}

const API_CACHE_DB_NAME = "comictracker-api-cache";
const API_CACHE_DB_VERSION = 1;
const API_CACHE_STORE = "responses";

let apiCacheDbPromise: Promise<IDBPDatabase<ApiCacheDB>> | null = null;

const getApiCacheDb = async (): Promise<IDBPDatabase<ApiCacheDB>> => {
  if (!apiCacheDbPromise) {
    apiCacheDbPromise = openDB<ApiCacheDB>(
      API_CACHE_DB_NAME,
      API_CACHE_DB_VERSION,
      {
        upgrade(db) {
          if (!db.objectStoreNames.contains(API_CACHE_STORE)) {
            db.createObjectStore(API_CACHE_STORE, { keyPath: "key" });
          }
        },
      }
    );
  }
  return apiCacheDbPromise;
};

export const setCachedApiResponse = async (
  key: string,
  data: unknown
): Promise<void> => {
  try {
    const db = await getApiCacheDb();
    await db.put(API_CACHE_STORE, {
      key,
      data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Failed to cache API response", error);
  }
};

export const getCachedApiResponse = async <T>(
  key: string,
  maxAgeMs: number = 1000 * 60 * 60 * 24 // default: 24h
): Promise<T | null> => {
  try {
    const db = await getApiCacheDb();
    const record = await db.get(API_CACHE_STORE, key);
    if (!record) return null;
    if (Date.now() - record.timestamp > maxAgeMs) {
      return null;
    }
    return record.data as T;
  } catch (error) {
    console.error("Failed to read cached API response", error);
    return null;
  }
};

