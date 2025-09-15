import { SupabaseClient } from "@supabase/supabase-js";
import { createResponse, createErrorResponse } from "../utils/cors";

export interface ComicStats {
  total: number;
  collected: number;
  grails: number;
  totalValue: number;
  collectedValue: number;
}

export interface PublisherSummary {
  publisher: string;
  seriesCount: number;
  totalComics: number;
  collectedComics: number;
  grailComics: number;
  totalValue: number;
}

export interface SeriesSummary {
  publisher: string;
  series: string;
  volume: string;
  issueCount: number;
  collectedCount: number;
  grailCount: number;
  totalValue: number;
  collectedValue: number;
  isFavorite?: boolean;
}

/**
 * Get aggregated statistics for comics
 * Uses Supabase query builder with in-memory aggregation
 */
export const handleGetStats = async (
  supabase: SupabaseClient,
  userId: string,
  queryParams: any
) => {
  console.log(`📊 Getting stats for user ${userId}`);

  try {
    // Build base query with filters
    let query = supabase
      .from("comics")
      .select("collected, isGrail, currentValue")
      .eq("user_id", userId);

    // Apply filters using the same logic as the main comics endpoint
    const {
      publisher,
      series,
      collected,
      isGrail,
      signed,
      grade,
      storageLocation,
      search,
      exact,
    } = queryParams || {};

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

    console.log("📋 Executing stats query with pagination...");

    // Get ALL comics by paginating through results
    let allComics: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: comics, error } = await query.range(
        page * pageSize,
        (page + 1) * pageSize - 1
      );

      if (error) {
        console.error("Stats query error:", error);
        return createErrorResponse(500, `Stats query failed: ${error.message}`);
      }

      if (comics && comics.length > 0) {
        allComics = [...allComics, ...comics];
        console.log(
          `📄 Loaded page ${page + 1}: ${comics.length} comics (total: ${
            allComics.length
          })`
        );

        // Check if we got a full page (meaning there might be more)
        hasMore = comics.length === pageSize;
        page++;
      } else {
        hasMore = false;
      }

      // Safety check to avoid infinite loops
      if (page > 50) {
        console.warn("⚠️ Hit pagination safety limit of 50 pages");
        break;
      }
    }

    console.log(`✅ Loaded all comics: ${allComics.length} total`);
    const comics = allComics;

    // Calculate stats in memory (since we need the data anyway for aggregations)
    const stats: ComicStats = {
      total: comics?.length || 0,
      collected: comics?.filter((c) => c.collected).length || 0,
      grails: comics?.filter((c) => c.isGrail).length || 0,
      totalValue:
        comics?.reduce((sum, c) => sum + (c.currentValue || 0), 0) || 0,
      collectedValue:
        comics
          ?.filter((c) => c.collected)
          .reduce((sum, c) => sum + (c.currentValue || 0), 0) || 0,
    };

    console.log(`✅ Stats computed:`, stats);
    return createResponse(200, stats);
  } catch (error: any) {
    console.error("Stats aggregation error:", error);
    return createErrorResponse(
      500,
      `Failed to compute stats: ${error.message}`
    );
  }
};

/**
 * Get aggregated publisher summaries
 * Uses Supabase query builder and in-memory aggregation
 */
export const handleGetPublishers = async (
  supabase: SupabaseClient,
  userId: string,
  queryParams: any
) => {
  console.log(`📚 Getting publishers for user ${userId}`);

  try {
    // Build base query with filters
    let query = supabase
      .from("comics")
      .select("publisher, series, volume, collected, isGrail, currentValue")
      .eq("user_id", userId);

    // Apply the same filters as stats
    const {
      publisher,
      series,
      collected,
      isGrail,
      signed,
      grade,
      storageLocation,
      search,
      exact,
    } = queryParams || {};

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

    query = query.order("id", { ascending: true });

    console.log("📋 Executing publishers query with pagination...");

    // Get ALL comics by paginating through results to avoid the 1000-row cap
    let allComics: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: comics, error } = await query.range(
        page * pageSize,
        (page + 1) * pageSize - 1
      );

      if (error) {
        console.error("Publishers query error:", error);
        return createErrorResponse(
          500,
          `Publishers query failed: ${error.message}`
        );
      }

      if (comics && comics.length > 0) {
        allComics = [...allComics, ...comics];
        console.log(
          `📄 Loaded page ${page + 1}: ${comics.length} comics (total: ${
            allComics.length
          })`
        );
        hasMore = comics.length === pageSize;
        page++;
      } else {
        hasMore = false;
      }

      // Safety check
      if (page > 50) {
        console.warn("⚠️ Hit pagination safety limit of 50 pages");
        break;
      }
    }

    console.log(
      `✅ Loaded all comics for publishers: ${allComics.length} total`
    );
    const comics = allComics;

    // Group and aggregate by publisher in memory
    const publisherMap = new Map<string, PublisherSummary>();

    comics?.forEach((comic) => {
      const pub = comic.publisher;
      if (!publisherMap.has(pub)) {
        publisherMap.set(pub, {
          publisher: pub,
          seriesCount: 0,
          totalComics: 0,
          collectedComics: 0,
          grailComics: 0,
          totalValue: 0,
        });
      }

      const summary = publisherMap.get(pub)!;
      summary.totalComics++;
      if (comic.collected) summary.collectedComics++;
      if (comic.isGrail) summary.grailComics++;
      summary.totalValue += comic.currentValue || 0;
    });

    // Calculate unique series count for each publisher
    const seriesMap = new Map<string, Set<string>>();
    comics?.forEach((comic) => {
      const pub = comic.publisher;
      const seriesKey = `${comic.series}|${comic.volume || ""}`;

      if (!seriesMap.has(pub)) {
        seriesMap.set(pub, new Set());
      }
      seriesMap.get(pub)!.add(seriesKey);
    });

    // Update series counts
    seriesMap.forEach((seriesSet, publisher) => {
      const summary = publisherMap.get(publisher);
      if (summary) {
        summary.seriesCount = seriesSet.size;
      }
    });

    const publishers = Array.from(publisherMap.values()).sort((a, b) =>
      a.publisher.localeCompare(b.publisher)
    );

    console.log(`✅ Found ${publishers.length} publishers`);
    return createResponse(200, publishers);
  } catch (error: any) {
    console.error("Publishers aggregation error:", error);
    return createErrorResponse(
      500,
      `Failed to get publishers: ${error.message}`
    );
  }
};

/**
 * Get aggregated series summaries for a specific publisher
 * Uses Supabase query builder and in-memory aggregation
 */
export const handleGetSeries = async (
  supabase: SupabaseClient,
  userId: string,
  queryParams: any
) => {
  const { publisher, ...otherFilters } = queryParams || {};

  if (!publisher) {
    return createErrorResponse(400, "Publisher parameter required for series");
  }

  console.log(`📖 Getting series for publisher ${publisher}, user ${userId}`);

  try {
    // Build base query with exact publisher match and other filters
    let query = supabase
      .from("comics")
      .select("publisher, series, volume, collected, isGrail, currentValue")
      .eq("user_id", userId)
      .eq("publisher", publisher); // Force exact match for publisher

    // Apply additional filters
    const {
      series: filterSeries,
      collected,
      isGrail,
      signed,
      grade,
      storageLocation,
      search,
      exact,
    } = otherFilters;

    if (filterSeries) {
      if (exact === "true") {
        query = query.eq("series", filterSeries);
      } else {
        query = query.ilike("series", `%${filterSeries}%`);
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
      query = query.or(`series.ilike.%${search}%,issue.ilike.%${search}%`);
    }

    console.log("📋 Executing series query with pagination...");

    // Get ALL comics by paginating through results
    let allComics: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: comics, error } = await query.range(
        page * pageSize,
        (page + 1) * pageSize - 1
      );

      if (error) {
        console.error("Series query error:", error);
        return createErrorResponse(
          500,
          `Series query failed: ${error.message}`
        );
      }

      if (comics && comics.length > 0) {
        allComics = [...allComics, ...comics];
        console.log(
          `📄 Loaded page ${page + 1}: ${comics.length} comics (total: ${
            allComics.length
          })`
        );

        hasMore = comics.length === pageSize;
        page++;
      } else {
        hasMore = false;
      }

      if (page > 50) {
        console.warn("⚠️ Hit pagination safety limit of 50 pages");
        break;
      }
    }

    console.log(`✅ Loaded all comics: ${allComics.length} total`);
    const comics = allComics;

    // Group and aggregate by series + volume in memory
    const seriesMap = new Map<string, SeriesSummary>();

    comics?.forEach((comic) => {
      const seriesKey = `${comic.series}|${comic.volume || ""}`;

      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, {
          publisher: comic.publisher,
          series: comic.series,
          volume: comic.volume || "",
          issueCount: 0,
          collectedCount: 0,
          grailCount: 0,
          totalValue: 0,
          collectedValue: 0,
        });
      }

      const summary = seriesMap.get(seriesKey)!;
      summary.issueCount++;
      if (comic.collected) {
        summary.collectedCount++;
        summary.collectedValue += comic.currentValue || 0;
      }
      if (comic.isGrail) summary.grailCount++;
      summary.totalValue += comic.currentValue || 0;
    });

    const series = Array.from(seriesMap.values()).sort((a, b) => {
      const seriesCompare = a.series.localeCompare(b.series);
      if (seriesCompare !== 0) return seriesCompare;
      return a.volume.localeCompare(b.volume);
    });

    console.log(`✅ Found ${series.length} series for publisher ${publisher}`);
    return createResponse(200, series);
  } catch (error: any) {
    console.error("Series aggregation error:", error);
    return createErrorResponse(500, `Failed to get series: ${error.message}`);
  }
};
