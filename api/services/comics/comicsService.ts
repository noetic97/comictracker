/**
 * Comics service — CRUD and queries via Prisma (SQLite).
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
    type,
    minValue,
    maxValue,
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
  if (type !== undefined && type !== "") where.type = type;
  if (minValue !== undefined && minValue !== "") {
    const n = Number(minValue);
    if (!Number.isNaN(n)) {
      where.currentValue = { ...(where.currentValue as object || {}), gte: n };
    }
  }
  if (maxValue !== undefined && maxValue !== "") {
    const n = Number(maxValue);
    if (!Number.isNaN(n)) {
      where.currentValue = { ...(where.currentValue as object || {}), lte: n };
    }
  }
  if (storageLocation) {
    where.storageLocation = { contains: storageLocation };
  }

  const isSeriesScoped = exact === "true" && !!publisher && !!series;
  const orderTrimmed = order?.trim();
  const isTypeSort = orderTrimmed?.toLowerCase().startsWith("type.");

  if (isSeriesScoped && orderTrimmed) {
    // Series-scoped (detail view): single-field sort in memory with nulls last.
    const all = await prisma.comic.findMany({
      where,
      take: 10000,
      orderBy: { id: "asc" },
    });

    if (isTypeSort) {
      // Type: alphabetical with "Issue" (and empty) last, then by issue number asc.
      const typeOrderKey = (t: string | null): string => {
        const v = (t ?? "").trim();
        return v === "Issue" || v === "" ? "\uFFFF" + v : v;
      };
      all.sort((a, b) => {
        const ka = typeOrderKey(a.type);
        const kb = typeOrderKey(b.type);
        if (ka !== kb) return ka.localeCompare(kb);
        return (a.issueNumber ?? 0) - (b.issueNumber ?? 0);
      });
    } else {
      // Single field + direction; nulls last, then id tiebreaker.
      const [part] = orderTrimmed.split(",").map((s) => s.trim());
      const [col, dir] = (part ?? "").split(".");
      const asc = (dir ?? "asc").toLowerCase() !== "desc";
      const cmp = buildSingleFieldComparator(col, asc);
      all.sort(cmp);
    }

    const total = all.length;
    const page = all.slice(offsetNum, offsetNum + limitNum);
    const transformedComics = page.map((c) =>
      transformComicOutput({ ...c, user_id: c.userId })
    );
    return {
      comics: transformedComics,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    };
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

type ComicRow = {
  id: string;
  issueNumber: number | null;
  currentValue: number;
  pricePaid: number | null;
  grade: string | null;
  dateAdded: Date | null;
  collected: boolean;
  type: string | null;
  createdAt: Date;
  [key: string]: any;
};

/** True if value is null/empty for sort purposes (these go to end). */
function isNullish(v: any): boolean {
  if (v == null) return true;
  if (typeof v === "string" && v.trim() === "") return true;
  return false;
}

/** Compare two values; nulls last. Returns -1, 0, or 1. */
function compareWithNullsLast(a: any, b: any, asc: boolean): number {
  const aNull = isNullish(a);
  const bNull = isNullish(b);
  if (aNull && bNull) return 0;
  if (aNull) return 1;
  if (bNull) return -1;
  if (typeof a === "number" && typeof b === "number") {
    return asc ? a - b : b - a;
  }
  if (a instanceof Date && b instanceof Date) {
    const ta = a.getTime();
    const tb = b.getTime();
    return asc ? ta - tb : tb - ta;
  }
  if (typeof a === "boolean" && typeof b === "boolean") {
    const na = a ? 1 : 0;
    const nb = b ? 1 : 0;
    return asc ? na - nb : nb - na;
  }
  const sa = String(a);
  const sb = String(b);
  const c = sa.localeCompare(sb);
  return asc ? c : -c;
}

function buildSingleFieldComparator(
  col: string,
  asc: boolean
): (a: ComicRow, b: ComicRow) => number {
  return (a, b) => {
    const va = a[col];
    const vb = b[col];
    const c = compareWithNullsLast(va, vb, asc);
    if (c !== 0) return c;
    return a.id.localeCompare(b.id);
  };
}

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
    "dateAdded",
    "issue",
    "issueNumber",
    "collected",
    "isGrail",
    "id",
    "type",
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

/** Fields allowed to be updated via PUT; isGrail only changed via PATCH. collected allowed for "uncollect and clear" flow. */
const PUT_ALLOWED_FIELDS = new Set([
  "collected", "pricePaid", "grade", "datePurchased", "notes", "grailReason",
  "artist", "writer", "storageLocation", "firstAppearance", "variantDetails",
  "cert", "signed", "coverImageUrl", "issueDate", "certificationCompany",
  "gradeDetails", "storyTitle", "coverArtist", "letterer", "description", "dateAdded",
]);

/**
 * Update a comic (partial update). Only whitelisted fields are applied; isGrail
 * is only changed via PATCH. collected is allowed for "uncollect and clear" flow.
 */
export const updateComic = async (
  prisma: PrismaClient,
  userId: string,
  comicId: string,
  updates: any
): Promise<any> => {
  const data: any = {};
  for (const key of Object.keys(updates || {})) {
    if (PUT_ALLOWED_FIELDS.has(key)) {
      data[key] = updates[key];
    }
  }
  if (Object.keys(data).length === 0) {
    const comic = await prisma.comic.findFirst({
      where: { id: comicId, userId },
    });
    if (!comic) throw new Error("Comic not found");
    return transformComicOutput({ ...comic, user_id: comic.userId });
  }
  const updatedComic = await prisma.comic.updateMany({
    where: { id: comicId, userId },
    data,
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
