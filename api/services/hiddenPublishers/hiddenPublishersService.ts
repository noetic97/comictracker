/**
 * Persist hidden publisher list + "show hidden" UI flag per user (SQLite / Prisma).
 */

import { PrismaClient } from "@prisma/client";

export type HiddenPublishersState = {
  hidden: string[];
  showHidden: boolean;
};

const MAX_PUBLISHERS = 2000;

export async function getHiddenPublisherState(
  prisma: PrismaClient,
  userId: string
): Promise<HiddenPublishersState> {
  const [rows, user] = await Promise.all([
    prisma.hiddenPublisher.findMany({
      where: { userId },
      select: { publisher: true },
      orderBy: { publisher: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { showHiddenPublishers: true },
    }),
  ]);

  return {
    hidden: rows.map((r) => r.publisher),
    showHidden: user?.showHiddenPublishers ?? false,
  };
}

export async function putHiddenPublisherState(
  prisma: PrismaClient,
  userId: string,
  raw: unknown
): Promise<HiddenPublishersState> {
  const body = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const hiddenIn = Array.isArray(body.hidden) ? body.hidden : [];
  const hidden = hiddenIn
    .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    .map((p) => p.trim())
    .slice(0, MAX_PUBLISHERS);
  const showHidden = Boolean(body.showHidden);

  await prisma.$transaction(async (tx) => {
    await tx.hiddenPublisher.deleteMany({ where: { userId } });
    if (hidden.length > 0) {
      await tx.hiddenPublisher.createMany({
        data: hidden.map((publisher) => ({ userId, publisher })),
      });
    }
    await tx.user.update({
      where: { id: userId },
      data: { showHiddenPublishers: showHidden },
    });
  });

  return getHiddenPublisherState(prisma, userId);
}

/** Mark publishers as hidden when every comic row in that publisher group is collected (all comics for user). */
export async function hideFullyCollectedPublishers(
  prisma: PrismaClient,
  userId: string
): Promise<{ count: number }> {
  const rows = await prisma.$queryRaw<{ publisher: string }[]>`
    SELECT publisher
    FROM comics
    WHERE user_id = ${userId}
    GROUP BY publisher
    HAVING COUNT(*) > 0
      AND SUM(CASE WHEN collected = 1 THEN 1 ELSE 0 END) = COUNT(*)
  `;
  if (rows.length === 0) return { count: 0 };
  const publishers = [...new Set(rows.map((r) => r.publisher))];
  const already = await prisma.hiddenPublisher.findMany({
    where: { userId, publisher: { in: publishers } },
    select: { publisher: true },
  });
  const have = new Set(already.map((a) => a.publisher));
  const missing = publishers.filter((p) => !have.has(p));
  if (missing.length > 0) {
    await prisma.hiddenPublisher.createMany({
      data: missing.map((publisher) => ({ userId, publisher })),
    });
  }
  return { count: rows.length };
}
