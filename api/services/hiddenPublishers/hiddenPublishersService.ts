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
