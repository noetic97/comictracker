/**
 * Comics Service - Core data access layer for comic CRUD operations
 * Uses Prisma (SQLite) instead of Supabase.
 */

import { PrismaClient } from "@prisma/client";
import { validateComic, transformComicOutput } from "./validationService";
import { ComicQueryOptions, ComicQueryResult } from "../../types/services";

type ComicWhere = Parameters<PrismaClient["comic"]["findMany"]>[0]["where"];
type ComicOrderBy = Parameters<PrismaClient["comic"]["findMany"]>[0]["orderBy"];

/**
 * Get comics with filtering, pagination, and sorting
 */
export const queryComics = async (
  prisma: PrismaClient,
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

  const andClauses: ComicWhere[] = [];

  // Favorite series filter: restrict to (publisher, series, volume) in user's favorites
  if (favoriteSeriesOnly === "true") {
    const favs = await prisma.favoriteSeries.findMany({
      where: { userId },
      select: { publisher: true, series: true, volume: true },
    });
    if (favs.length === 0) {
      return {
        comics: [],
        pagination: { page: pageNum, limit: limitNum, total: 0, pages: 0 },
      };
    }
    andClauses.push({
      OR: favs.map((f) => ({
        publisher: f.publisher,
        series: f.series,
        volume: f.volume ?? "",
      })),
    });
  }

  if (search) {
    andClauses.push({
      OR: [
        { publisher: { contains: search } },
        { series: { contains: search } },
        { issue: { contains: search } },
      ],
    });
  }

  const where: ComicWhere = { userId };
  if (andClauses.length) {
    where.AND = andClauses;
  }

  // Apply filters
  if (publisher) {
    if (exact === "true") {
      where.publisher = publisher;
    } else {
      where.publisher = { contains: publisher };
    }
  }
  if (series) {
    if (exact === "true") {
      where.series = series;
    } else {
      where.series = { contains: series };
    }
  }
  if (volume) {
    if (exact === "true") {
      where.volume = volume;
    } else {
      where.volume = { contains: volume };
    }
  }
  if (collected === "true") where.collected = true;
  if (collected === "false") where.collected = false;
  if (isGrail === "true") where.isGrail = true;
  if (signed === "true") where.signed = true;
  if (grade) where.grade = grade;
  if (storageLocation) {
    where.storageLocation = { contains: storageLocation };
  }

  const orderBy = buildOrderBy(order);

  const [comics, total] = await Promise.all([
    prisma.comic.findMany({
      where,
      orderBy,
      skip: offsetNum,
      take: limitNum,
    }),
    prisma.comic.count({ where }),
  ]);

  const transformedComics = comics.map((c) =>
    transformComicOutput({ ...c, user_id: c.userId })
  );

  console.log(`✅ Found ${transformedComics.length} comics (${total} total)`);

  return {
    comics: transformedComics,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

function buildOrderBy(order?: string): ComicOrderBy {
  const defaultOrder: ComicOrderBy = [
    { series: "asc" },
    { issueNumber: "asc" },
    { id: "asc" },
  ];
  if (!order) return defaultOrder;

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
  const parts = order.split(",").map((s) => s.trim());
  const out: ComicOrderBy = [];
  for (const part of parts) {
    const [col, dir] = part.split(".");
    if (whitelist.has(col)) {
      out.push({ [col]: (dir ?? "asc") === "asc" ? "asc" : "desc" });
    }
  }
  return out.length ? out : defaultOrder;
}

/**
 * Create a new comic
 */
export const createComic = async (
  prisma: PrismaClient,
  userId: string,
  comicData: any
): Promise<any> => {
  const validation = validateComic(comicData);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
  }

  const data = validation.data as any;
  const newComic = await prisma.comic.create({
    data: {
      ...data,
      userId,
    },
  });
  return transformComicOutput({ ...newComic, user_id: newComic.userId });
};

/**
 * Update a comic
 */
export const updateComic = async (
  prisma: PrismaClient,
  userId: string,
  comicId: string,
  updates: any
): Promise<any> => {
  const updatedComic = await prisma.comic.updateMany({
    where: { id: comicId, userId },
    data: updates,
  });
  if (updatedComic.count === 0) {
    throw new Error("Comic not found");
  }
  const comic = await prisma.comic.findUniqueOrThrow({
    where: { id: comicId, userId },
  });
  return transformComicOutput({ ...comic, user_id: comic.userId });
};

/**
 * Toggle a comic's boolean field (collected, isGrail)
 */
export const toggleComicField = async (
  prisma: PrismaClient,
  userId: string,
  comicId: string,
  field: "collected" | "isGrail"
): Promise<any> => {
  const comic = await prisma.comic.findFirst({
    where: { id: comicId, userId },
  });
  if (!comic) throw new Error("Comic not found");

  const updateData: any =
    field === "collected"
      ? { collected: !comic.collected }
      : { isGrail: !comic.isGrail };

  const updated = await prisma.comic.update({
    where: { id: comicId },
    data: updateData,
  });
  return transformComicOutput({ ...updated, user_id: updated.userId });
};

/**
 * Delete a comic
 */
export const deleteComic = async (
  prisma: PrismaClient,
  userId: string,
  comicId: string
): Promise<void> => {
  const result = await prisma.comic.deleteMany({
    where: { id: comicId, userId },
  });
  if (result.count === 0) {
    throw new Error(`Failed to delete comic: Comic not found`);
  }
};

/**
 * Get a single comic by ID
 */
export const getComicById = async (
  prisma: PrismaClient,
  userId: string,
  comicId: string
): Promise<any | null> => {
  const comic = await prisma.comic.findFirst({
    where: { id: comicId, userId },
  });
  if (!comic) return null;
  return transformComicOutput({ ...comic, user_id: comic.userId });
};
