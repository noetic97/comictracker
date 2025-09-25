/**
 * Favorites Service - Core data access layer for favorite series operations
 * Extracted from functions/favorites.ts for better separation of concerns
 */

import { SupabaseClient } from "@supabase/supabase-js";

export interface FavoriteSeriesData {
  publisher: string;
  series: string;
  volume: string;
}

export interface FavoriteSeries extends FavoriteSeriesData {
  id: string;
  dateAdded: string; // Database returns ISO string
  user_id: string;
}

export interface FavoriteCheckResult {
  isFavorite: boolean;
  favorite?: FavoriteSeries;
}

/**
 * Get all favorite series for a user
 */
export const getAllFavorites = async (
  supabase: SupabaseClient,
  userId: string
): Promise<FavoriteSeries[]> => {
  console.log(`📚 Getting all favorites for user ${userId}`);

  const { data: favorites, error } = await supabase
    .from("favorite_series")
    .select("*")
    .eq("user_id", userId)
    .order("dateAdded", { ascending: false });

  if (error) {
    console.error("Get favorites error:", error);
    throw new Error(`Failed to get favorites: ${error.message}`);
  }

  console.log(`✅ Found ${favorites?.length || 0} favorite series`);
  return favorites || [];
};

/**
 * Add a favorite series
 */
export const addFavorite = async (
  supabase: SupabaseClient,
  userId: string,
  favoriteData: FavoriteSeriesData
): Promise<FavoriteSeries> => {
  console.log(
    `⭐ Adding favorite: ${favoriteData.publisher} - ${favoriteData.series} (${favoriteData.volume}) for user ${userId}`
  );

  // Check if it already exists
  const existingFavorite = await checkFavoriteExists(
    supabase,
    userId,
    favoriteData
  );
  if (existingFavorite.isFavorite) {
    console.log(`⚠️ Favorite already exists`);
    return existingFavorite.favorite!;
  }

  // Let PostgreSQL generate the ID using its default function
  const favoriteWithMetadata = {
    ...favoriteData,
    user_id: userId,
    // PostgreSQL will handle id and dateAdded with defaults
  };

  const { data: newFavorite, error: insertError } = await supabase
    .from("favorite_series")
    .insert([favoriteWithMetadata])
    .select()
    .single();

  if (insertError) {
    console.error("Insert favorite error:", insertError);
    throw new Error(`Failed to add favorite: ${insertError.message}`);
  }

  console.log(`✅ Successfully added favorite with ID: ${newFavorite.id}`);
  return newFavorite;
};

/**
 * Remove a favorite series by ID
 */
export const removeFavorite = async (
  supabase: SupabaseClient,
  userId: string,
  favoriteId: string
): Promise<void> => {
  console.log(`🗑️ Removing favorite: ${favoriteId} for user ${userId}`);

  const { error: deleteError } = await supabase
    .from("favorite_series")
    .delete()
    .eq("id", favoriteId)
    .eq("user_id", userId);

  if (deleteError) {
    console.error("Delete favorite error:", deleteError);
    throw new Error(`Failed to remove favorite: ${deleteError.message}`);
  }

  console.log(`✅ Successfully removed favorite: ${favoriteId}`);
};

/**
 * Check if a series is favorited
 */
export const checkFavoriteExists = async (
  supabase: SupabaseClient,
  userId: string,
  favoriteData: FavoriteSeriesData
): Promise<FavoriteCheckResult> => {
  console.log(
    `🔍 Checking favorite: ${favoriteData.publisher} - ${favoriteData.series} (${favoriteData.volume}) for user ${userId}`
  );

  const { data: favorite, error } = await supabase
    .from("favorite_series")
    .select("*")
    .eq("publisher", favoriteData.publisher)
    .eq("series", favoriteData.series)
    .eq("volume", favoriteData.volume)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found
    console.error("Error checking favorite:", error);
    throw new Error(`Database error: ${error.message}`);
  }

  const isFavorite = !!favorite;
  console.log(`✅ Favorite check result: ${isFavorite}`);

  return {
    isFavorite,
    favorite: favorite || undefined,
  };
};

/**
 * Remove favorite by series details (alternative to ID-based removal)
 */
export const removeFavoriteByDetails = async (
  supabase: SupabaseClient,
  userId: string,
  favoriteData: FavoriteSeriesData
): Promise<void> => {
  console.log(
    `🗑️ Removing favorite by details: ${favoriteData.publisher} - ${favoriteData.series} (${favoriteData.volume}) for user ${userId}`
  );

  const { error: deleteError } = await supabase
    .from("favorite_series")
    .delete()
    .eq("publisher", favoriteData.publisher)
    .eq("series", favoriteData.series)
    .eq("volume", favoriteData.volume)
    .eq("user_id", userId);

  if (deleteError) {
    console.error("Delete favorite by details error:", deleteError);
    throw new Error(`Failed to remove favorite: ${deleteError.message}`);
  }

  console.log(`✅ Successfully removed favorite by details`);
};

// Helper functions

/**
 * Validate favorite series input data
 */
export const validateFavoriteInput = (data: any): string[] => {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    errors.push("Body must be a JSON object");
    return errors;
  }

  if (
    !data.publisher ||
    typeof data.publisher !== "string" ||
    !data.publisher.trim()
  ) {
    errors.push("'publisher' is required and must be a non-empty string");
  }

  if (!data.series || typeof data.series !== "string" || !data.series.trim()) {
    errors.push("'series' is required and must be a non-empty string");
  }

  if (data.volume !== undefined && typeof data.volume !== "string") {
    errors.push("'volume' must be a string if provided");
  }

  return errors;
};
