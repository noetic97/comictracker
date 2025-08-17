import { Comic } from "../types";
import { apiService } from "./apiService";

export interface StateChangeResult {
  success: boolean;
  comic?: Comic;
  error?: string;
  originalComic: Comic;
}

export interface StateChangeOptions {
  optimisticUpdate?: boolean;
  retryCount?: number;
  onProgress?: (status: string) => void;
}

/**
 * Safely toggle a comic's collected status
 */
export const toggleComicCollected = async (
  comic: Comic,
  options: StateChangeOptions = {}
): Promise<StateChangeResult> => {
  const { optimisticUpdate = true, retryCount = 2, onProgress } = options;

  try {
    onProgress?.(`Updating ${comic.series} #${comic.issue}...`);

    // Validate comic has required fields
    if (!comic.id) {
      throw new Error("Comic missing ID - cannot update");
    }

    console.log(`🔄 Toggling collected status for comic:`, {
      id: comic.id,
      series: comic.series,
      issue: comic.issue,
      currentStatus: comic.collected,
    });

    // Make API call with retry logic
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const updatedComic = await apiService.comics.toggleCollected(comic.id);

        // Validate response
        if (!updatedComic || typeof updatedComic !== "object") {
          throw new Error("Invalid response from server");
        }

        if (updatedComic.id !== comic.id) {
          throw new Error("Server returned wrong comic");
        }

        console.log(`✅ Successfully toggled collected status:`, {
          id: updatedComic.id,
          series: updatedComic.series,
          issue: updatedComic.issue,
          newStatus: updatedComic.collected,
        });

        onProgress?.(`Updated ${comic.series} #${comic.issue}`);

        return {
          success: true,
          comic: updatedComic,
          originalComic: comic,
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `⚠️ Attempt ${attempt} failed for collected toggle:`,
          error
        );

        if (attempt < retryCount) {
          onProgress?.(`Retry ${attempt + 1}/${retryCount}...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      }
    }

    throw lastError || new Error("All retry attempts failed");
  } catch (error: any) {
    console.error(`❌ Failed to toggle collected status:`, error);

    onProgress?.(`Failed to update ${comic.series} #${comic.issue}`);

    return {
      success: false,
      error: error.message || "Unknown error occurred",
      originalComic: comic,
    };
  }
};

/**
 * Safely toggle a comic's grail status
 */
export const toggleComicGrail = async (
  comic: Comic,
  options: StateChangeOptions = {}
): Promise<StateChangeResult> => {
  const { optimisticUpdate = true, retryCount = 2, onProgress } = options;

  try {
    onProgress?.(
      `Updating grail status for ${comic.series} #${comic.issue}...`
    );

    // Validate comic has required fields
    if (!comic.id) {
      throw new Error("Comic missing ID - cannot update");
    }

    console.log(`⭐ Toggling grail status for comic:`, {
      id: comic.id,
      series: comic.series,
      issue: comic.issue,
      currentStatus: comic.isGrail,
    });

    // Make API call with retry logic
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const updatedComic = await apiService.comics.toggleGrail(comic.id);

        // Validate response
        if (!updatedComic || typeof updatedComic !== "object") {
          throw new Error("Invalid response from server");
        }

        if (updatedComic.id !== comic.id) {
          throw new Error("Server returned wrong comic");
        }

        console.log(`✅ Successfully toggled grail status:`, {
          id: updatedComic.id,
          series: updatedComic.series,
          issue: updatedComic.issue,
          newStatus: updatedComic.isGrail,
        });

        onProgress?.(`Updated ${comic.series} #${comic.issue}`);

        return {
          success: true,
          comic: updatedComic,
          originalComic: comic,
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Attempt ${attempt} failed for grail toggle:`, error);

        if (attempt < retryCount) {
          onProgress?.(`Retry ${attempt + 1}/${retryCount}...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error("All retry attempts failed");
  } catch (error: any) {
    console.error(`❌ Failed to toggle grail status:`, error);

    onProgress?.(`Failed to update ${comic.series} #${comic.issue}`);

    return {
      success: false,
      error: error.message || "Unknown error occurred",
      originalComic: comic,
    };
  }
};

/**
 * Batch update multiple comics (for bulk operations)
 */
export const batchUpdateComics = async (
  updates: Array<{
    comic: Comic;
    operation: "toggleCollected" | "toggleGrail";
  }>,
  options: StateChangeOptions = {}
): Promise<StateChangeResult[]> => {
  const results: StateChangeResult[] = [];

  for (let i = 0; i < updates.length; i++) {
    const { comic, operation } = updates[i];
    const progress = `Processing ${i + 1}/${updates.length}: ${comic.series} #${
      comic.issue
    }`;

    options.onProgress?.(progress);

    let result: StateChangeResult;
    if (operation === "toggleCollected") {
      result = await toggleComicCollected(comic, {
        ...options,
        onProgress: undefined,
      });
    } else {
      result = await toggleComicGrail(comic, {
        ...options,
        onProgress: undefined,
      });
    }

    results.push(result);

    // Small delay between operations to be nice to the server
    if (i < updates.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
};

/**
 * Create an optimistic update for immediate UI feedback
 */
export const createOptimisticUpdate = (
  comic: Comic,
  operation: "collected" | "grail"
): Comic => {
  return {
    ...comic,
    [operation === "collected" ? "collected" : "isGrail"]:
      !comic[operation === "collected" ? "collected" : "isGrail"],
  };
};

/**
 * Validate comic state change response
 */
export const validateStateChangeResponse = (
  response: any,
  originalComic: Comic,
  operation: "collected" | "grail"
): { isValid: boolean; error?: string } => {
  if (!response) {
    return { isValid: false, error: "Empty response from server" };
  }

  if (typeof response !== "object") {
    return { isValid: false, error: "Invalid response format" };
  }

  if (!response.id || response.id !== originalComic.id) {
    return { isValid: false, error: "Response ID mismatch" };
  }

  const expectedField = operation === "collected" ? "collected" : "isGrail";
  if (response[expectedField] === originalComic[expectedField]) {
    return { isValid: false, error: `${operation} status was not changed` };
  }

  return { isValid: true };
};
