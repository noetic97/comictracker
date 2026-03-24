/**
 * Favorite series via Prisma (SQLite).
 */

import { PrismaClient } from "@prisma/client";
import {
  FavoriteSeries,
  FavoriteSeriesData,
  FavoriteCheckResult,
} from "../../types/services";

function toFavoriteSeries(row: {
  id: string;
  userId: string;
  publisher: string;
  series: string;
  volume: string;
  dateAdded: Date;
  createdAt: Date;
  updatedAt: Date;
}): FavoriteSeries {
  return {
    id: row.id,
    user_id: row.userId,
    publisher: row.publisher,
    series: row.series,
    volume: row.volume,
    dateAdded: row.dateAdded.toISOString(),
  };
}

/**
 * Get all favorite series for a user
 */
export const getAllFavorites = async (
  prisma: PrismaClient,
  userId: string
): Promise<FavoriteSeries[]> => {
  console.log(`📚 Getting all favorites for user ${userId}`);

  const rows = await prisma.favoriteSeries.findMany({
    where: { userId },
    orderBy: { dateAdded: "desc" },
  });

  console.log(`✅ Found ${rows.length} favorite series`);
  return rows.map(toFavoriteSeries);
};

/**
 * Add a favorite series
 */
export const addFavorite = async (
  prisma: PrismaClient,
  userId: string,
  favoriteData: FavoriteSeriesData
): Promise<FavoriteSeries> => {
  console.log(
    `⭐ Adding favorite: ${favoriteData.publisher} - ${favoriteData.series} (${favoriteData.volume ?? ""}) for user ${userId}`
  );

  const existing = await checkFavoriteExists(prisma, userId, favoriteData);
  if (existing.isFavorite && existing.favorite) {
    console.log(`⚠️ Favorite already exists`);
    return existing.favorite;
  }

  const volume = favoriteData.volume ?? "";
  const newFavorite = await prisma.favoriteSeries.create({
    data: {
      publisher: favoriteData.publisher,
      series: favoriteData.series,
      volume,
      userId,
    },
  });

  console.log(`✅ Successfully added favorite with ID: ${newFavorite.id}`);
  return toFavoriteSeries(newFavorite);
};

/**
 * Remove a favorite series by ID
 */
export const removeFavorite = async (
  prisma: PrismaClient,
  userId: string,
  favoriteId: string
): Promise<void> => {
  console.log(`🗑️ Removing favorite: ${favoriteId} for user ${userId}`);

  const result = await prisma.favoriteSeries.deleteMany({
    where: { id: favoriteId, userId },
  });

  if (result.count === 0) {
    throw new Error("Failed to remove favorite: not found");
  }

  console.log(`✅ Successfully removed favorite: ${favoriteId}`);
};

/**
 * Check if a series is favorited
 */
export const checkFavoriteExists = async (
  prisma: PrismaClient,
  userId: string,
  favoriteData: FavoriteSeriesData
): Promise<FavoriteCheckResult> => {
  console.log(
    `🔍 Checking favorite: ${favoriteData.publisher} - ${favoriteData.series} (${favoriteData.volume ?? ""}) for user ${userId}`
  );

  const volume = favoriteData.volume ?? "";
  const favorite = await prisma.favoriteSeries.findFirst({
    where: {
      userId,
      publisher: favoriteData.publisher,
      series: favoriteData.series,
      volume,
    },
  });

  const isFavorite = !!favorite;
  console.log(`✅ Favorite check result: ${isFavorite}`);

  return {
    isFavorite,
    favorite: favorite ? toFavoriteSeries(favorite) : undefined,
  };
};

/**
 * Remove favorite by series details
 */
export const removeFavoriteByDetails = async (
  prisma: PrismaClient,
  userId: string,
  favoriteData: FavoriteSeriesData
): Promise<void> => {
  console.log(
    `🗑️ Removing favorite by details: ${favoriteData.publisher} - ${favoriteData.series} (${favoriteData.volume ?? ""}) for user ${userId}`
  );

  const volume = favoriteData.volume ?? "";
  const result = await prisma.favoriteSeries.deleteMany({
    where: {
      userId,
      publisher: favoriteData.publisher,
      series: favoriteData.series,
      volume,
    },
  });

  if (result.count === 0) {
    throw new Error("Failed to remove favorite by details: not found");
  }

  console.log(`✅ Successfully removed favorite by details`);
};

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
