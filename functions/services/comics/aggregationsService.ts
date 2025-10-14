/**
 * Aggregations Service - handles complex comic data aggregations
 * Clean version extracted from functions/comics/aggregations.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { createResponse, createErrorResponse } from "../../utils/cors";
import {
  sortPublishers,
  sortSeries,
  PublisherSortField,
  SeriesSortField,
} from "./sortingService";
import {
  ComicStats,
  PublisherSummary,
  SeriesSummary,
} from "../../types/services";

/**
 * Apply common filters to a Supabase query
 */
const applyCommonFilters = (query: any, filters: any) => {
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
 * Paginate through all comics to avoid 1000-row Supabase limit
 */
const getAllComicsWithPagination = async (
  query: any,
  operationName: string
): Promise<any[]> => {
  let allComics: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  console.log(`📋 Executing ${operationName} query with pagination...`);

  while (hasMore) {
    const { data: comics, error } = await query.range(
      page * pageSize,
      (page + 1) * pageSize - 1
    );

    if (error) {
      console.error(`${operationName} query error:`, error);
      throw new Error(`${operationName} query failed: ${error.message}`);
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

    // Safety check to avoid infinite loops
    if (page > 50) {
      console.warn("⚠️ Hit pagination safety limit of 50 pages");
      break;
    }
  }

  console.log(
    `✅ Loaded all comics for ${operationName}: ${allComics.length} total`
  );
  return allComics;
};

/**
 * Get aggregated statistics for comics
 */
export const getComicStats = async (
  supabase: SupabaseClient,
  userId: string,
  queryParams: any
): Promise<any> => {
  console.log(`📊 Getting stats for user ${userId}`);

  try {
    let query = supabase
      .from("comics")
      .select("collected, isGrail, currentValue")
      .eq("user_id", userId);

    const filters = queryParams || {};
    query = applyCommonFilters(query, filters);

    // Apply favorites filter inline
    if (filters.favoriteSeriesOnly === "true") {
      const { data: favs, error: favErr } = await supabase
        .from("favorite_series")
        .select("publisher,series,volume")
        .eq("user_id", userId);

      if (favErr) {
        console.error("Stats favorites fetch error:", favErr);
        return createErrorResponse(
          500,
          `Failed to load favorites: ${favErr.message}`
        );
      }

      if (!favs || favs.length === 0) {
        const emptyStats: ComicStats = {
          total: 0,
          collected: 0,
          grails: 0,
          totalValue: 0,
          collectedValue: 0,
        };
        return createResponse(200, emptyStats);
      }

      const groups = favs.map((f: any) => {
        const parts = [`publisher.eq.${f.publisher}`, `series.eq.${f.series}`];
        if (f.volume && String(f.volume).length > 0) {
          parts.push(`volume.eq.${f.volume}`);
        }
        return `and(${parts.join(",")})`;
      });
      const orExpression = groups.join(",");
      query = query.or(orExpression);
    }

    const comics = await getAllComicsWithPagination(query, "Stats");

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
 */
export const getPublisherSummaries = async (
  supabase: SupabaseClient,
  userId: string,
  queryParams: any
): Promise<any> => {
  console.log(`📚 Getting publishers for user ${userId}`);

  try {
    let query = supabase
      .from("comics")
      .select("publisher, series, volume, collected, isGrail, currentValue")
      .eq("user_id", userId);

    const filters = queryParams || {};
    query = applyCommonFilters(query, filters);

    // Apply favorites filter inline
    if (filters.favoriteSeriesOnly === "true") {
      const { data: favs, error: favErr } = await supabase
        .from("favorite_series")
        .select("publisher,series,volume")
        .eq("user_id", userId);

      if (favErr) {
        console.error("Publishers favorites fetch error:", favErr);
        return createErrorResponse(
          500,
          `Failed to load favorites: ${favErr.message}`
        );
      }

      if (!favs || favs.length === 0) {
        return createResponse(200, []);
      }

      const groups = favs.map((f: any) => {
        const parts = [`publisher.eq.${f.publisher}`, `series.eq.${f.series}`];
        if (f.volume && String(f.volume).length > 0) {
          parts.push(`volume.eq.${f.volume}`);
        }
        return `and(${parts.join(",")})`;
      });
      const orExpression = groups.join(",");
      query = query.or(orExpression);
    }

    const comics = await getAllComicsWithPagination(query, "Publishers");

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

    // Apply sorting using the new sorting service
    const sortField = filters.sortBy as PublisherSortField;
    const publishers = sortPublishers(
      Array.from(publisherMap.values()),
      sortField
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
 */
export const getSeriesSummaries = async (
  supabase: SupabaseClient,
  userId: string,
  queryParams: any
): Promise<any> => {
  const { publisher, ...otherFilters } = queryParams || {};

  if (!publisher) {
    return createErrorResponse(400, "Publisher parameter required for series");
  }

  console.log(`📖 Getting series for publisher ${publisher}, user ${userId}`);

  try {
    let query = supabase
      .from("comics")
      .select("publisher, series, volume, collected, isGrail, currentValue")
      .eq("user_id", userId)
      .eq("publisher", publisher);

    query = applyCommonFilters(query, otherFilters);

    // Apply favorites filter inline
    if (otherFilters.favoriteSeriesOnly === "true") {
      const { data: favs, error: favErr } = await supabase
        .from("favorite_series")
        .select("publisher,series,volume")
        .eq("user_id", userId);

      if (favErr) {
        console.error("Series favorites fetch error:", favErr);
        return createErrorResponse(
          500,
          `Failed to load favorites: ${favErr.message}`
        );
      }

      if (!favs || favs.length === 0) {
        return createResponse(200, []);
      }

      const groups = favs
        .filter((f: any) => f.publisher === publisher)
        .map((f: any) => {
          const parts = [`series.eq.${f.series}`];
          if (f.volume && String(f.volume).length > 0) {
            parts.push(`volume.eq.${f.volume}`);
          }
          return `and(${parts.join(",")})`;
        });

      if (groups.length > 0) {
        const orExpression = groups.join(",");
        query = query.or(orExpression);
      } else {
        return createResponse(200, []);
      }
    }

    const comics = await getAllComicsWithPagination(query, "Series");

    // Group and aggregate by series in memory
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

    // Apply sorting using the article-aware sorting service
    const sortField = otherFilters.sortBy as SeriesSortField;
    const series = sortSeries(Array.from(seriesMap.values()), sortField);

    console.log(`✅ Found ${series.length} series for publisher ${publisher}`);
    return createResponse(200, series);
  } catch (error: any) {
    console.error("Series aggregation error:", error);
    return createErrorResponse(500, `Failed to get series: ${error.message}`);
  }
};
