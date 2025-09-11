import { Comic, FavoriteSeries } from "../types";
import { debugFetch, apiDebugger } from "./apiDebugger";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/.netlify/functions";

const createApiError = (
  status: number,
  message: string,
  response?: any
): Error => {
  const error = new Error(message);
  error.name = "ApiError";
  (error as any).status = status;
  (error as any).response = response;
  return error;
};

const handleResponse = async (response: Response) => {
  // Always log response details for debugging
  console.log(
    `📡 API Response: ${response.status} ${response.statusText} (${response.url})`
  );

  if (!response.ok) {
    let errorData: any = { error: "Unknown error" };

    try {
      const responseText = await response.text();
      if (responseText) {
        errorData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.warn("Failed to parse error response:", parseError);
      errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const errorMessage =
      errorData.error || errorData.message || `HTTP ${response.status}`;
    console.error(`❌ API Error:`, {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      error: errorMessage,
      fullResponse: errorData,
    });

    throw createApiError(response.status, errorMessage, errorData);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    console.log("✅ API Success: No content (204)");
    return null;
  }

  try {
    const data = await response.json();
    console.log(`✅ API Success:`, data);
    return data;
  } catch (parseError) {
    console.error("Failed to parse success response:", parseError);
    throw createApiError(500, "Failed to parse response from server");
  }
};

export const apiService = {
  // Comics API
  comics: {
    getAll: async (params?: {
      publisher?: string;
      series?: string;
      collected?: boolean;
      isGrail?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    }): Promise<{ comics: Comic[]; pagination: any }> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }

      // If no limit is specified, get ALL comics by setting a high limit
      if (!params?.limit) {
        searchParams.set("limit", "50000");
      }

      const url = `${API_BASE_URL}/comics${
        searchParams.toString() ? `?${searchParams}` : ""
      }`;

      console.log(`🔍 Fetching comics: ${url}`);
      const response = await debugFetch(url);
      console.log({ response });

      return handleResponse(response);
    },

    getById: async (id: string): Promise<Comic> => {
      if (!id) {
        throw createApiError(400, "Comic ID is required");
      }

      const url = `${API_BASE_URL}/comics/${encodeURIComponent(id)}`;
      console.log(`🔍 Fetching comic by ID: ${url}`);

      const response = await debugFetch(url);
      return handleResponse(response);
    },

    create: async (comic: Omit<Comic, "id">): Promise<Comic> => {
      if (!comic.publisher || !comic.series || !comic.issue) {
        throw createApiError(
          400,
          "Missing required fields: publisher, series, issue"
        );
      }

      const url = `${API_BASE_URL}/comics`;
      console.log(`➕ Creating comic: ${comic.series} #${comic.issue}`);

      const response = await debugFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comic),
      });
      return handleResponse(response);
    },

    bulkCreate: async (
      comics: Omit<Comic, "id">[]
    ): Promise<{
      processed: number;
      created: number;
      updated: number;
      errors: number;
      message: string;
      processingErrors?: string[];
      validationErrors?: string[];
      processingTime?: number;
      rate?: number;
    }> => {
      if (!Array.isArray(comics) || comics.length === 0) {
        throw createApiError(
          400,
          "Comics array is required and must not be empty"
        );
      }

      const url = `${API_BASE_URL}/comics/bulk`;
      console.log(`📦 Bulk creating ${comics.length} comics`);

      const response = await debugFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comics }),
      });
      return handleResponse(response);
    },

    update: async (id: string, updates: Partial<Comic>): Promise<Comic> => {
      if (!id) {
        throw createApiError(400, "Comic ID is required");
      }

      const url = `${API_BASE_URL}/comics/${encodeURIComponent(id)}`;
      console.log(`📝 Updating comic: ${id}`, updates);

      const response = await debugFetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return handleResponse(response);
    },

    toggleCollected: async (id: string): Promise<Comic> => {
      if (!id) {
        throw createApiError(400, "Comic ID is required");
      }

      const url = `${API_BASE_URL}/comics/${encodeURIComponent(id)}/collect`;
      console.log(`🔄 Toggling collected status for comic: ${id}`);

      const response = await debugFetch(url, {
        method: "PATCH",
      });
      return handleResponse(response);
    },

    toggleGrail: async (id: string): Promise<Comic> => {
      if (!id) {
        throw createApiError(400, "Comic ID is required");
      }

      const url = `${API_BASE_URL}/comics/${encodeURIComponent(id)}/grail`;
      console.log(`⭐ Toggling grail status for comic: ${id}`);

      const response = await debugFetch(url, {
        method: "PATCH",
      });
      return handleResponse(response);
    },

    delete: async (id: string): Promise<void> => {
      if (!id) {
        throw createApiError(400, "Comic ID is required");
      }

      const url = `${API_BASE_URL}/comics/${encodeURIComponent(id)}`;
      console.log(`🗑️ Deleting comic: ${id}`);

      const response = await debugFetch(url, {
        method: "DELETE",
      });
      await handleResponse(response);
    },

    getStats: async (): Promise<{
      total: number;
      collected: number;
      grails: number;
      totalValue: number;
      collectedValue: number;
      publishers: Array<{ publisher: string; count: number; value: number }>;
    }> => {
      const url = `${API_BASE_URL}/comics/stats/overview`;
      console.log(`📊 Fetching comic stats`);

      const response = await debugFetch(url);
      return handleResponse(response);
    },
  },

  // Favorites API
  favorites: {
    getAll: async (): Promise<FavoriteSeries[]> => {
      const url = `${API_BASE_URL}/favorites`;
      console.log(`🔍 Fetching all favorites`);

      const response = await debugFetch(url);
      return handleResponse(response);
    },

    add: async (
      series: Omit<FavoriteSeries, "id" | "dateAdded">
    ): Promise<FavoriteSeries> => {
      if (!series.publisher || !series.series) {
        throw createApiError(400, "Missing required fields: publisher, series");
      }

      const url = `${API_BASE_URL}/favorites`;
      console.log(`⭐ Adding favorite: ${series.publisher} - ${series.series}`);

      const response = await debugFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(series),
      });
      return handleResponse(response);
    },

    remove: async (id: string): Promise<void> => {
      if (!id) {
        throw createApiError(400, "Favorite ID is required");
      }

      const url = `${API_BASE_URL}/favorites/${encodeURIComponent(id)}`;
      console.log(`🗑️ Removing favorite: ${id}`);

      const response = await debugFetch(url, {
        method: "DELETE",
      });
      await handleResponse(response);
    },

    check: async (
      publisher: string,
      series: string,
      volume?: string
    ): Promise<{
      isFavorite: boolean;
      favorite?: FavoriteSeries;
    }> => {
      if (!publisher || !series) {
        throw createApiError(400, "Publisher and series are required");
      }

      const params = new URLSearchParams({
        publisher,
        series,
        ...(volume && { volume }),
      });

      const url = `${API_BASE_URL}/favorites/check?${params}`;
      console.log(`🔍 Checking favorite status: ${publisher} - ${series}`);

      const response = await debugFetch(url);
      return handleResponse(response);
    },
  },
  // Admin API (for development/testing only)
  admin: {
    clearDatabase: async (): Promise<{
      message: string;
      deletedCount: number;
    }> => {
      const url = `${API_BASE_URL}/admin`;
      console.log(`🗑️ Clearing entire database`);

      const response = await debugFetch(url, {
        method: "DELETE",
      });
      return handleResponse(response);
    },
  },
};

// Health check utility
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    console.log(`🏥 Checking API health`);
    const response = await debugFetch(`${API_BASE_URL}/comics?limit=1`);
    return response.ok;
  } catch {
    return false;
  }
};

export { apiDebugger };
