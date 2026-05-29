import { PrismaClient } from "@prisma/client";
import {
  HuntListDetail,
  HuntListSeriesData,
  HuntListSummary,
} from "../../types/services";

function normalizeSeries(input: any): HuntListSeriesData {
  return {
    publisher: String(input?.publisher ?? "").trim(),
    series: String(input?.series ?? "").trim(),
    volume: String(input?.volume ?? "").trim(),
  };
}

function validateSeries(s: HuntListSeriesData): string[] {
  const errors: string[] = [];
  if (!s.publisher) errors.push("publisher is required");
  if (!s.series) errors.push("series is required");
  return errors;
}

function toSummary(row: {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { series: number };
}): HuntListSummary {
  return {
    id: row.id,
    name: row.name,
    seriesCount: row._count.series,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listHuntLists(
  prisma: PrismaClient,
  userId: string
): Promise<HuntListSummary[]> {
  const rows = await prisma.huntList.findMany({
    where: { userId },
    include: { _count: { select: { series: true } } },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });
  return rows.map(toSummary);
}

export async function createHuntList(
  prisma: PrismaClient,
  userId: string,
  nameRaw: unknown
): Promise<HuntListSummary> {
  const name = String(nameRaw ?? "").trim();
  if (!name) throw new Error("Hunt list name is required");
  const row = await prisma.huntList.create({
    data: { userId, name },
    include: { _count: { select: { series: true } } },
  });
  return toSummary(row);
}

export async function renameHuntList(
  prisma: PrismaClient,
  userId: string,
  listId: string,
  nameRaw: unknown
): Promise<HuntListSummary> {
  const name = String(nameRaw ?? "").trim();
  if (!name) throw new Error("Hunt list name is required");

  const updated = await prisma.huntList.updateMany({
    where: { id: listId, userId },
    data: { name },
  });
  if (updated.count === 0) throw new Error("Hunt list not found");

  const row = await prisma.huntList.findFirst({
    where: { id: listId, userId },
    include: { _count: { select: { series: true } } },
  });
  if (!row) throw new Error("Hunt list not found");
  return toSummary(row);
}

export async function deleteHuntList(
  prisma: PrismaClient,
  userId: string,
  listId: string
): Promise<void> {
  const deleted = await prisma.huntList.deleteMany({
    where: { id: listId, userId },
  });
  if (deleted.count === 0) throw new Error("Hunt list not found");
}

export async function getHuntList(
  prisma: PrismaClient,
  userId: string,
  listId: string
): Promise<HuntListDetail> {
  const row = await prisma.huntList.findFirst({
    where: { id: listId, userId },
    include: {
      series: {
        orderBy: [{ publisher: "asc" }, { series: "asc" }, { volume: "asc" }],
      },
      _count: { select: { series: true } },
    },
  });
  if (!row) throw new Error("Hunt list not found");

  return {
    id: row.id,
    name: row.name,
    seriesCount: row._count.series,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    series: row.series.map((s) => ({
      publisher: s.publisher,
      series: s.series,
      volume: s.volume,
    })),
  };
}

export async function replaceHuntListSeries(
  prisma: PrismaClient,
  userId: string,
  listId: string,
  rawSeries: unknown
): Promise<HuntListDetail> {
  const exists = await prisma.huntList.findFirst({
    where: { id: listId, userId },
    select: { id: true },
  });
  if (!exists) throw new Error("Hunt list not found");

  const input = Array.isArray(rawSeries) ? rawSeries : [];
  const normalized = input.map(normalizeSeries);
  for (const s of normalized) {
    const errs = validateSeries(s);
    if (errs.length) throw new Error(`Invalid series entry: ${errs.join(", ")}`);
  }

  const uniq = new Map<string, HuntListSeriesData>();
  for (const s of normalized) {
    const key = `${s.publisher}|${s.series}|${s.volume}`;
    uniq.set(key, s);
  }

  await prisma.$transaction(async (tx) => {
    await tx.huntListSeries.deleteMany({ where: { huntListId: listId } });
    const values = [...uniq.values()];
    if (values.length > 0) {
      await tx.huntListSeries.createMany({
        data: values.map((s) => ({
          huntListId: listId,
          publisher: s.publisher,
          series: s.series,
          volume: s.volume,
        })),
      });
    }
  });

  return getHuntList(prisma, userId, listId);
}

export async function addHuntListSeries(
  prisma: PrismaClient,
  userId: string,
  listId: string,
  rawSeries: unknown
): Promise<HuntListDetail> {
  const s = normalizeSeries(rawSeries);
  const errs = validateSeries(s);
  if (errs.length) throw new Error(errs.join(", "));

  const list = await prisma.huntList.findFirst({
    where: { id: listId, userId },
    select: { id: true },
  });
  if (!list) throw new Error("Hunt list not found");

  await prisma.huntListSeries.upsert({
    where: {
      hunt_list_series_unique: {
        huntListId: listId,
        publisher: s.publisher,
        series: s.series,
        volume: s.volume,
      },
    },
    create: {
      huntListId: listId,
      publisher: s.publisher,
      series: s.series,
      volume: s.volume,
    },
    update: {},
  });

  return getHuntList(prisma, userId, listId);
}

export async function removeHuntListSeries(
  prisma: PrismaClient,
  userId: string,
  listId: string,
  rawSeries: unknown
): Promise<HuntListDetail> {
  const s = normalizeSeries(rawSeries);
  const errs = validateSeries(s);
  if (errs.length) throw new Error(errs.join(", "));

  const list = await prisma.huntList.findFirst({
    where: { id: listId, userId },
    select: { id: true },
  });
  if (!list) throw new Error("Hunt list not found");

  await prisma.huntListSeries.deleteMany({
    where: {
      huntListId: listId,
      publisher: s.publisher,
      series: s.series,
      volume: s.volume,
    },
  });

  return getHuntList(prisma, userId, listId);
}
