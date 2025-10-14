/**
 * Comics Service - Core data access layer for comic CRUD operations
 * Extracted from functions/comics.ts for better separation of concerns
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { validateComic, transformComicOutput } from "./validationService";
import { ComicQueryOptions, ComicQueryResult } from "../../types/services";

/**
 * Get comics with filtering, pagination, and sorting
 */
export const queryComics = async (
  supabase: SupabaseClient,
  userId: string,
  options: ComicQueryOptions = {}
): Promise<ComicQueryResult> => {
  const {
    publisher,
    series,
    volume,
    collected,
    isGrail,
    signed,
    grade,
    storageLocation,
    search,
    exact,
    page = "1",
    limit = "25",
    offset,
    order,
    favoriteSeriesOnly,
  } = options;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offsetNum =
    offset !== undefined
      ? parseInt(offset as string, 10)
      : (pageNum - 1) * limitNum;

  console.log(
    `📋 Getting comics for user ${userId}, page ${pageNum}, limit ${limitNum}`
  );

  // Base query with user filter
  let query = supabase
    .from("comics")
    .select("*", { count: "exact" })
    .eq("user_id", userId);

  // Apply filters
  query = applyComicFilters(query, {
    publisher,
    series,
    volume,
    collected,
    isGrail,
    signed,
    grade,
    storageLocation,
    search,
    exact,
  });

  // Handle favorite series filter
  if (favoriteSeriesOnly === "true") {
    const favoritesQuery = await buildFavoriteSeriesFilter(supabase, userId);
    if (favoritesQuery === null) {
      // No favorites found, return empty result
      return {
        comics: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          pages: 0,
        },
      };
    }
    // Apply the favorites filter
    query = query.or(favoritesQuery);
  }

  // Apply ordering
  query = applyComicOrdering(query, order);

  // Apply pagination
  query = query.range(offsetNum, offsetNum + limitNum - 1);

  const { data: comics, error, count } = await query;

  if (error) {
    console.error("Supabase query error:", error);
    throw new Error(`Database error: ${error.message}`);
  }

  // Transform comics for frontend
  const transformedComics = (comics || []).map(transformComicOutput);

  console.log(`✅ Found ${transformedComics.length} comics (${count} total)`);

  return {
    comics: transformedComics,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      pages: Math.ceil((count || 0) / limitNum),
    },
  };
};

/**
 * Create a new comic
 */
export const createComic = async (
  supabase: SupabaseClient,
  userId: string,
  comicData: any
): Promise<any> => {
  const validation = validateComic(comicData);

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
  }

  // Add user_id (snake_case in DB) to the validated data
  const dataWithUserId = {
    ...validation.data,
    user_id: userId,
  };

  const { data: newComic, error: createError } = await supabase
    .from("comics")
    .insert([dataWithUserId])
    .select()
    .single();

  if (createError) {
    console.error("Create comic error:", createError);
    throw new Error(`Failed to create comic: ${createError.message}`);
  }

  return transformComicOutput(newComic);
};

/**
 * Update a comic
 */
export const updateComic = async (
  supabase: SupabaseClient,
  userId: string,
  comicId: string,
  updates: any
): Promise<any> => {
  const { data: updatedComic, error: updateError } = await supabase
    .from("comics")
    .update(updates)
    .eq("id", comicId)
    .eq("user_id", userId)
    .select()
    .single();

  if (updateError) {
    console.error("Update comic error:", updateError);
    throw new Error(`Failed to update comic: ${updateError.message}`);
  }

  return transformComicOutput(updatedComic);
};

/**
 * Toggle a comic's boolean field (collected, isGrail)
 */
export const toggleComicField = async (
  supabase: SupabaseClient,
  userId: string,
  comicId: string,
  field: "collected" | "isGrail"
): Promise<any> => {
  console.log(`🔄 Toggling ${field} for comic ${comicId} (user ${userId})`);

  // Get the comic first
  const { data: comic, error: fetchError } = await supabase
    .from("comics")
    .select("*")
    .eq("id", comicId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !comic) {
    console.error("Fetch comic error:", fetchError);
    throw new Error("Comic not found");
  }

  // Build update data
  const updateData: any = {};
  if (field === "collected") {
    updateData.collected = !comic.collected;
  } else if (field === "isGrail") {
    updateData.isGrail = !comic.isGrail;
  } else {
    throw new Error(`Invalid field: ${field}. Use 'collected' or 'isGrail'`);
  }

  const { data: updatedComic, error: updateError } = await supabase
    .from("comics")
    .update(updateData)
    .eq("id", comicId)
    .eq("user_id", userId)
    .select()
    .single();

  if (updateError) {
    console.error("Toggle comic error:", updateError);
    throw new Error(`Failed to toggle ${field}: ${updateError.message}`);
  }

  return transformComicOutput(updatedComic);
};

/**
 * Delete a comic
 */
export const deleteComic = async (
  supabase: SupabaseClient,
  userId: string,
  comicId: string
): Promise<void> => {
  const { error: deleteError } = await supabase
    .from("comics")
    .delete()
    .eq("id", comicId)
    .eq("user_id", userId);

  if (deleteError) {
    console.error("Delete comic error:", deleteError);
    throw new Error(`Failed to delete comic: ${deleteError.message}`);
  }
};

// Helper functions

/**
 * Apply common filters to a comic query
 */
const applyComicFilters = (query: any, filters: any) => {
  const {
    publisher,
    series,
    volume,
    collected,
    isGrail,
    signed,
    grade,
    storageLocation,
    search,
    exact,
  } = filters;

  if (publisher) {
    if (exact === "true") {
      query = query.eq("publisher", publisher);
    } else {
      query = query.ilike("publisher", `%${publisher}%`);
    }
  }

  if (series) {
    if (exact === "true") {
      query = query.eq("series", series);
    } else {
      query = query.ilike("series", `%${series}%`);
    }
  }

  if (volume) {
    if (exact === "true") {
      query = query.eq("volume", volume);
    } else {
      query = query.ilike("volume", `%${volume}%`);
    }
  }

  if (collected === "true") query = query.eq("collected", true);
  if (collected === "false") query = query.eq("collected", false);
  if (isGrail === "true") query = query.eq("isGrail", true);
  if (signed === "true") query = query.eq("signed", true);
  if (grade) query = query.eq("grade", grade);
  if (storageLocation) {
    query = query.ilike("storageLocation", `%${storageLocation}%`);
  }

  if (search) {
    query = query.or(
      `publisher.ilike.%${search}%,series.ilike.%${search}%,issue.ilike.%${search}%`
    );
  }

  return query;
};

/**
 * Build favorite series filter expression (without modifying query)
 */
const buildFavoriteSeriesFilter = async (
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> => {
  const { data: favs, error: favErr } = await supabase
    .from("favorite_series")
    .select("publisher, series, volume")
    .eq("user_id", userId);

  if (favErr) {
    console.error("Favorites fetch error:", favErr);
    throw new Error(`Failed to load favorites: ${favErr.message}`);
  }

  if (!favs || favs.length === 0) {
    return null; // Signal no favorites
  }

  // Build OR expression of favored series (publisher/series[/volume])
  const groups = favs.map((f: any) => {
    const parts = [`publisher.eq.${f.publisher}`, `series.eq.${f.series}`];
    if (f.volume && String(f.volume).length > 0) {
      parts.push(`volume.eq.${f.volume}`);
    }
    return `and(${parts.join(",")})`;
  });

  return groups.join(",");
};

/**
 * Apply ordering to comic query
 */
const applyComicOrdering = (query: any, order?: string) => {
  const whitelist = new Set([
    "series",
    "publisher",
    "currentValue",
    "pricePaid",
    "grade",
    "createdAt",
    "issue",
    "issueNumber",
    "collected",
    "isGrail",
    "id",
  ]);

  if (!order) {
    // Default ordering: series → issue number → id
    return query
      .order("series", { ascending: true })
      .order("issueNumber", { ascending: true })
      .order("id", { ascending: true });
  }

  const parts = order.split(",").map((s) => s.trim());
  for (const part of parts) {
    const [col, dir] = part.split(".");
    if (whitelist.has(col)) {
      query = query.order(col, {
        ascending: (dir ?? "asc") === "asc",
      });
    }
  }

  return query;
};
