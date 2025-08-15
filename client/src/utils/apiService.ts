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
    ): Promise<{ count: number; message: string }> => {
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

  // Favorites API (placeholder for now - we'll implement this next)
  favorites: {
    getAll: async (): Promise<FavoriteSeries[]> => {
      // For now, return empty array until we implement favorites function
      return [];
    },

    add: async (
      series: Omit<FavoriteSeries, "id" | "dateAdded">
    ): Promise<FavoriteSeries> => {
      // Placeholder - will implement when favorites function is ready
      const newFavorite: FavoriteSeries = {
        ...series,
        id: `temp-${Date.now()}`,
        dateAdded: Date.now(),
      };
      return newFavorite;
    },

    remove: async (id: string): Promise<void> => {
      // Placeholder
      console.log("Remove favorite:", id);
    },

    check: async (
      publisher: string,
      series: string,
      volume?: string
    ): Promise<{
      isFavorite: boolean;
      favorite?: FavoriteSeries;
    }> => {
      // Placeholder
      return { isFavorite: false };
    },
  },
};

// Health check utility
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/comics`);
    return response.ok;
  } catch {
    return false;
  }
};

export { ApiError };
