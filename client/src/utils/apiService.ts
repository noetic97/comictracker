import { Comic, FavoriteSeries } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/.netlify/functions";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new ApiError(response.status, error.error || "Request failed");
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
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

      // If no limit is specified, get ALL comics by setting a very high limit
      if (!params?.limit) {
        searchParams.set("limit", "50000"); // Set a high limit to get all comics
      }

      const url = `${API_BASE_URL}/comics${
        searchParams.toString() ? `?${searchParams}` : ""
      }`;
      const response = await fetch(url);
      return handleResponse(response);
    },

    getById: async (id: string): Promise<Comic> => {
      const response = await fetch(`${API_BASE_URL}/comics/${id}`);
      return handleResponse(response);
    },

    create: async (comic: Omit<Comic, "id">): Promise<Comic> => {
      const response = await fetch(`${API_BASE_URL}/comics`, {
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
      const response = await fetch(`${API_BASE_URL}/comics/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comics }),
      });
      return handleResponse(response);
    },

    update: async (id: string, updates: Partial<Comic>): Promise<Comic> => {
      const response = await fetch(`${API_BASE_URL}/comics/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return handleResponse(response);
    },

    toggleCollected: async (id: string): Promise<Comic> => {
      const response = await fetch(`${API_BASE_URL}/comics/${id}/collect`, {
        method: "PATCH",
      });
      return handleResponse(response);
    },

    toggleGrail: async (id: string): Promise<Comic> => {
      const response = await fetch(`${API_BASE_URL}/comics/${id}/grail`, {
        method: "PATCH",
      });
      return handleResponse(response);
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/comics/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/comics/stats/overview`);
      return handleResponse(response);
    },
  },

  // Favorites API - Now fully implemented
  favorites: {
    getAll: async (): Promise<FavoriteSeries[]> => {
      const response = await fetch(`${API_BASE_URL}/favorites`);
      return handleResponse(response);
    },

    add: async (
      series: Omit<FavoriteSeries, "id" | "dateAdded">
    ): Promise<FavoriteSeries> => {
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(series),
      });
      return handleResponse(response);
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/favorites/${id}`, {
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
      const params = new URLSearchParams({
        publisher,
        series,
        ...(volume && { volume }),
      });

      const response = await fetch(`${API_BASE_URL}/favorites/check?${params}`);
      return handleResponse(response);
    },
  },
};

// Health check utility
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/comics?limit=1`);
    return response.ok;
  } catch {
    return false;
  }
};

export { ApiError };
