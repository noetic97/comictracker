/**
 * Admin maintenance via Prisma (SQLite).
 */

import { PrismaClient } from "@prisma/client";
import { DatabaseCounts, ClearDatabaseResult } from "../../types/services";

/**
 * Get counts of all data in the database
 */
export const getDatabaseCounts = async (
  prisma: PrismaClient
): Promise<DatabaseCounts> => {
  console.log("📊 Getting database counts for admin user");

  const [comics, favorites, alerts, hiddenPublishers, hiddenSeries, pullLists, pullListSeries] = await Promise.all([
    prisma.comic.count(),
    prisma.favoriteSeries.count(),
    prisma.alertLog.count(),
    prisma.hiddenPublisher.count(),
    prisma.hiddenSeries.count(),
    prisma.pullList.count(),
    prisma.pullListSeries.count(),
  ]);

  const counts: DatabaseCounts = {
    comics,
    favorites,
    alerts,
    hiddenPublishers,
    hiddenSeries,
    pullLists,
    pullListSeries,
    total: comics + favorites + alerts + hiddenPublishers + hiddenSeries + pullLists + pullListSeries,
  };

  console.log(
    `📊 Found ${counts.comics} comics, ${counts.favorites} favorites, ${counts.alerts} alerts, ${counts.hiddenPublishers} hidden publisher rows, ${counts.hiddenSeries} hidden series rows, ${counts.pullLists} pull lists, ${counts.pullListSeries} pull list rows (${counts.total} total)`
  );

  return counts;
};

/**
 * Clear all data from the database
 */
export const clearAllDatabaseData = async (
  prisma: PrismaClient
): Promise<ClearDatabaseResult> => {
  console.log("🗑️ Starting database clear operation");

  const originalCounts = await getDatabaseCounts(prisma);

  await prisma.alertLog.deleteMany({});
  await prisma.comic.deleteMany({});
  await prisma.favoriteSeries.deleteMany({});
  await prisma.hiddenPublisher.deleteMany({});
  await prisma.hiddenSeries.deleteMany({});
  await prisma.pullListSeries.deleteMany({});
  await prisma.pullList.deleteMany({});
  await prisma.user.deleteMany({});

  console.log(`✅ Successfully cleared database`);

  return {
    message: "Successfully cleared entire database",
    deleted: originalCounts,
    warning: "This operation deleted ALL data from ALL users",
  };
};

/**
 * Clear only the current user's data
 */
export const clearUserData = async (
  prisma: PrismaClient,
  userId: string
): Promise<ClearDatabaseResult> => {
  console.log(`🗑️ Starting user data clear operation for user ${userId}`);

  const [comics, favorites, alerts, hiddenPublishers, hiddenSeries, pullLists, pullListSeries] = await Promise.all([
    prisma.comic.count({ where: { userId } }),
    prisma.favoriteSeries.count({ where: { userId } }),
    prisma.alertLog.count({ where: { userId } }),
    prisma.hiddenPublisher.count({ where: { userId } }),
    prisma.hiddenSeries.count({ where: { userId } }),
    prisma.pullList.count({ where: { userId } }),
    prisma.pullListSeries.count({ where: { pullList: { userId } } }),
  ]);

  const userCounts: DatabaseCounts = {
    comics,
    favorites,
    alerts,
    hiddenPublishers,
    hiddenSeries,
    pullLists,
    pullListSeries,
    total: comics + favorites + alerts + hiddenPublishers + hiddenSeries + pullLists + pullListSeries,
  };

  await prisma.alertLog.deleteMany({ where: { userId } });
  await prisma.comic.deleteMany({ where: { userId } });
  await prisma.favoriteSeries.deleteMany({ where: { userId } });
  await prisma.hiddenPublisher.deleteMany({ where: { userId } });
  await prisma.hiddenSeries.deleteMany({ where: { userId } });
  await prisma.pullList.deleteMany({ where: { userId } });

  console.log(`✅ Successfully cleared user data for ${userId}`);

  return {
    message: `Successfully cleared all data for user ${userId}`,
    deleted: userCounts,
    warning: "This operation deleted only your data, not other users' data",
  };
};
