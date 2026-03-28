/**
 * Persist hidden series (publisher + series + volume) + "show hidden" flag per user.
 */

import { PrismaClient } from "@prisma/client";

export type HiddenSeriesState = {
  hidden: string[];
  showHidden: boolean;
};

const MAX_SERIES_KEYS = 5000;

function toStorageKey(publisher: string, series: string, volume: string): string {
  return `${publisher}|${series}|${volume}`;
}

function parseSeriesStorageKey(
  key: string
): { publisher: string; series: string; volume: string } | null {
  const first = key.indexOf("|");
  if (first < 0) return null;
  const second = key.indexOf("|", first + 1);
  if (second < 0) return null;
  const publisher = key.slice(0, first).trim();
  const series = key.slice(first + 1, second).trim();
  const volume = key.slice(second + 1).trim();
  if (!publisher || !series) return null;
  return { publisher, series, volume };
}

export async function getHiddenSeriesState(
  prisma: PrismaClient,
  userId: string
): Promise<HiddenSeriesState> {
  const [rows, user] = await Promise.all([
    prisma.hiddenSeries.findMany({
      where: { userId },
      select: { publisher: true, series: true, volume: true },
      orderBy: [{ publisher: "asc" }, { series: "asc" }, { volume: "asc" }],
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { showHiddenSeries: true },
    }),
  ]);

  return {
    hidden: rows.map((r) => toStorageKey(r.publisher, r.series, r.volume ?? "")),
    showHidden: user?.showHiddenSeries ?? false,
  };
}

export async function putHiddenSeriesState(
  prisma: PrismaClient,
  userId: string,
  raw: unknown
): Promise<HiddenSeriesState> {
  const body = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const hiddenIn = Array.isArray(body.hidden) ? body.hidden : [];
  const parsed: { publisher: string; series: string; volume: string }[] = [];
  for (const item of hiddenIn) {
    if (typeof item !== "string") continue;
    const row = parseSeriesStorageKey(item);
    if (row) parsed.push(row);
  }
  const hidden = parsed.slice(0, MAX_SERIES_KEYS);
  const showHidden = Boolean(body.showHidden);

  await prisma.$transaction(async (tx) => {
    await tx.hiddenSeries.deleteMany({ where: { userId } });
    if (hidden.length > 0) {
      await tx.hiddenSeries.createMany({
        data: hidden.map((h) => ({
          userId,
          publisher: h.publisher,
          series: h.series,
          volume: h.volume,
        })),
      });
    }
    await tx.user.update({
      where: { id: userId },
      data: { showHiddenSeries: showHidden },
    });
  });

  return getHiddenSeriesState(prisma, userId);
}

/** Mark series/volume groups as hidden when every comic in the group is collected (all comics for user). */
export async function hideFullyCollectedSeries(
  prisma: PrismaClient,
  userId: string
): Promise<{ count: number }> {
  const rows = await prisma.$queryRaw<{ publisher: string; series: string; volume: string }[]>`
    SELECT publisher, series, volume
    FROM comics
    WHERE user_id = ${userId}
    GROUP BY publisher, series, volume
    HAVING COUNT(*) > 0
      AND SUM(CASE WHEN collected = 1 THEN 1 ELSE 0 END) = COUNT(*)
  `;
  if (rows.length === 0) return { count: 0 };
  const keys = rows.map((r) => ({
    publisher: r.publisher,
    series: r.series,
    volume: r.volume ?? "",
  }));
  const chunkSize = 80;
  const existingKeys = new Set<string>();
  for (let i = 0; i < keys.length; i += chunkSize) {
    const slice = keys.slice(i, i + chunkSize);
    const found = await prisma.hiddenSeries.findMany({
      where: {
        userId,
        OR: slice.map((k) => ({
          publisher: k.publisher,
          series: k.series,
          volume: k.volume,
        })),
      },
      select: { publisher: true, series: true, volume: true },
    });
    for (const e of found) {
      existingKeys.add(toStorageKey(e.publisher, e.series, e.volume ?? ""));
    }
  }
  const toAdd = keys.filter((k) => !existingKeys.has(toStorageKey(k.publisher, k.series, k.volume)));
  if (toAdd.length > 0) {
    await prisma.hiddenSeries.createMany({
      data: toAdd.map((k) => ({ userId, ...k })),
    });
  }
  return { count: rows.length };
}
