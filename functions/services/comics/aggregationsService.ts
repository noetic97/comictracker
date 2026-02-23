/**
 * Aggregations Service - handles complex comic data aggregations
 * Uses Prisma (SQLite) instead of Supabase.
 */

import { PrismaClient } from "@prisma/client";
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

type ComicWhere = Parameters<PrismaClient["comic"]["findMany"]>[0]["where"];

function buildWhere(
  prisma: PrismaClient,
  userId: string,
  filters: Record<string, any>,
  favoriteSeriesOnly?: boolean
): ComicWhere {
  const where: ComicWhere = { userId };

  if (filters.publisher) {
    where.publisher =
      filters.exact === "true"
        ? filters.publisher
        : { contains: filters.publisher };
  }
  if (filters.series) {
    where.series =
      filters.exact === "true"
        ? filters.series
        : { contains: filters.series };
  }
  if (filters.volume) {
    where.volume =
      filters.exact === "true"
        ? filters.volume
        : { contains: filters.volume };
  }
  if (filters.collected === "true") where.collected = true;
  if (filters.collected === "false") where.collected = false;
  if (filters.isGrail === "true") where.isGrail = true;
  if (filters.signed === "true") where.signed = true;
  if (filters.grade) where.grade = filters.grade;
  if (filters.storageLocation) {
    where.storageLocation = { contains: filters.storageLocation };
  }
  if (filters.search) {
    where.OR = [
      { publisher: { contains: filters.search } },
      { series: { contains: filters.search } },
      { issue: { contains: filters.search } },
    ];
  }

  if (favoriteSeriesOnly === "true") {
    // Will be filled by caller after fetching favs
  }

  return where;
}

/**
 * Get aggregated statistics for comics
 */
export const getComicStats = async (
  prisma: PrismaClient,
  userId: string,
  queryParams: any
): Promise<any> => {
  console.log(`📊 Getting stats for user ${userId}`);

  try {
    const filters = queryParams || {};
    let where: ComicWhere = buildWhere(prisma, userId, filters);

    if (filters.favoriteSeriesOnly === "true") {
      const favs = await prisma.favoriteSeries.findMany({
        where: { userId },
        select: { publisher: true, series: true, volume: true },
      });
      if (favs.length === 0) {
        return createResponse(200, {
          total: 0,
          collected: 0,
          grails: 0,
          totalValue: 0,
          collectedValue: 0,
        } as ComicStats);
      }
      where = {
        ...where,
        AND: [
          ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
          {
            OR: favs.map((f) => ({
              publisher: f.publisher,
              series: f.series,
              volume: f.volume ?? "",
            })),
          },
        ],
      };
    }

    const comics = await prisma.comic.findMany({
      where,
      select: { collected: true, isGrail: true, currentValue: true },
    });

    const stats: ComicStats = {
      total: comics.length,
      collected: comics.filter((c) => c.collected).length,
      grails: comics.filter((c) => c.isGrail).length,
      totalValue: comics.reduce((sum, c) => sum + (c.currentValue || 0), 0),
      collectedValue: comics
        .filter((c) => c.collected)
        .reduce((sum, c) => sum + (c.currentValue || 0), 0),
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
  prisma: PrismaClient,
  userId: string,
  queryParams: any
): Promise<any> => {
  console.log(`📚 Getting publishers for user ${userId}`);

  try {
    const filters = queryParams || {};
    let where: ComicWhere = buildWhere(prisma, userId, filters);

    if (filters.favoriteSeriesOnly === "true") {
      const favs = await prisma.favoriteSeries.findMany({
        where: { userId },
        select: { publisher: true, series: true, volume: true },
      });
      if (favs.length === 0) {
        return createResponse(200, []);
      }
      where = {
        ...where,
        AND: [
          ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
          {
            OR: favs.map((f) => ({
              publisher: f.publisher,
              series: f.series,
              volume: f.volume ?? "",
            })),
          },
        ],
      };
    }

    const comics = await prisma.comic.findMany({
      where,
      select: {
        publisher: true,
        series: true,
        volume: true,
        collected: true,
        isGrail: true,
        currentValue: true,
      },
    });

    const publisherMap = new Map<string, PublisherSummary>();
    const seriesMap = new Map<string, Set<string>>();

    for (const comic of comics) {
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

      const seriesKey = `${comic.series}|${comic.volume ?? ""}`;
      if (!seriesMap.has(pub)) seriesMap.set(pub, new Set());
      seriesMap.get(pub)!.add(seriesKey);
    }

    seriesMap.forEach((set, publisher) => {
      const summary = publisherMap.get(publisher);
      if (summary) summary.seriesCount = set.size;
    });

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
  prisma: PrismaClient,
  userId: string,
  queryParams: any
): Promise<any> => {
  const { publisher, ...otherFilters } = queryParams || {};

  if (!publisher) {
    return createErrorResponse(400, "Publisher parameter required for series");
  }

  console.log(`📖 Getting series for publisher ${publisher}, user ${userId}`);

  try {
    let where: ComicWhere = { userId, publisher };

    if (otherFilters.series) {
      where.series =
        otherFilters.exact === "true"
          ? otherFilters.series
          : { contains: otherFilters.series };
    }
    if (otherFilters.volume) {
      where.volume =
        otherFilters.exact === "true"
          ? otherFilters.volume
          : { contains: otherFilters.volume };
    }
    if (otherFilters.collected === "true") where.collected = true;
    if (otherFilters.collected === "false") where.collected = false;
    if (otherFilters.isGrail === "true") where.isGrail = true;
    if (otherFilters.signed === "true") where.signed = true;
    if (otherFilters.grade) where.grade = otherFilters.grade;
    if (otherFilters.storageLocation) {
      where.storageLocation = { contains: otherFilters.storageLocation };
    }
    if (otherFilters.search) {
      where.OR = [
        { publisher: { contains: otherFilters.search } },
        { series: { contains: otherFilters.search } },
        { issue: { contains: otherFilters.search } },
      ];
    }

    if (otherFilters.favoriteSeriesOnly === "true") {
      const favs = await prisma.favoriteSeries.findMany({
        where: { userId, publisher },
        select: { series: true, volume: true },
      });
      if (favs.length === 0) {
        return createResponse(200, []);
      }
      where.AND = [
        ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
        {
          OR: favs.map((f) => ({
            series: f.series,
            volume: f.volume ?? "",
          })),
        },
      ];
    }

    const comics = await prisma.comic.findMany({
      where,
      select: {
        publisher: true,
        series: true,
        volume: true,
        collected: true,
        isGrail: true,
        currentValue: true,
      },
    });

    const seriesMap = new Map<string, SeriesSummary>();

    for (const comic of comics) {
      const seriesKey = `${comic.series}|${comic.volume ?? ""}`;
      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, {
          publisher: comic.publisher,
          series: comic.series,
          volume: comic.volume ?? "",
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
    }

    const sortField = otherFilters.sortBy as SeriesSortField;
    const series = sortSeries(Array.from(seriesMap.values()), sortField);

    console.log(`✅ Found ${series.length} series for publisher ${publisher}`);
    return createResponse(200, series);
  } catch (error: any) {
    console.error("Series aggregation error:", error);
    return createErrorResponse(500, `Failed to get series: ${error.message}`);
  }
};
