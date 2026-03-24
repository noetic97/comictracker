/**
 * Named pull lists + membership operations.
 */

import { PrismaClient } from "@prisma/client";
import {
  PullListDetail,
  PullListSeriesData,
  PullListSummary,
} from "../../types/services";

function normalizeSeries(input: any): PullListSeriesData {
  return {
    publisher: String(input?.publisher ?? "").trim(),
    series: String(input?.series ?? "").trim(),
    volume: String(input?.volume ?? "").trim(),
  };
}

function validateSeries(s: PullListSeriesData): string[] {
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
}): PullListSummary {
  return {
    id: row.id,
    name: row.name,
    seriesCount: row._count.series,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listPullLists(
  prisma: PrismaClient,
  userId: string
): Promise<PullListSummary[]> {
  const rows = await prisma.pullList.findMany({
    where: { userId },
    include: { _count: { select: { series: true } } },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });
  return rows.map(toSummary);
}

export async function createPullList(
  prisma: PrismaClient,
  userId: string,
  nameRaw: unknown
): Promise<PullListSummary> {
  const name = String(nameRaw ?? "").trim();
  if (!name) throw new Error("Pull list name is required");
  const row = await prisma.pullList.create({
    data: { userId, name },
    include: { _count: { select: { series: true } } },
  });
  return toSummary(row);
}

export async function renamePullList(
  prisma: PrismaClient,
  userId: string,
  listId: string,
  nameRaw: unknown
): Promise<PullListSummary> {
  const name = String(nameRaw ?? "").trim();
  if (!name) throw new Error("Pull list name is required");

  const updated = await prisma.pullList.updateMany({
    where: { id: listId, userId },
    data: { name },
  });
  if (updated.count === 0) throw new Error("Pull list not found");

  const row = await prisma.pullList.findFirst({
    where: { id: listId, userId },
    include: { _count: { select: { series: true } } },
  });
  if (!row) throw new Error("Pull list not found");
  return toSummary(row);
}

export async function deletePullList(
  prisma: PrismaClient,
  userId: string,
  listId: string
): Promise<void> {
  const deleted = await prisma.pullList.deleteMany({
    where: { id: listId, userId },
  });
  if (deleted.count === 0) throw new Error("Pull list not found");
}

export async function getPullList(
  prisma: PrismaClient,
  userId: string,
  listId: string
): Promise<PullListDetail> {
  const row = await prisma.pullList.findFirst({
    where: { id: listId, userId },
    include: {
      series: {
        orderBy: [{ publisher: "asc" }, { series: "asc" }, { volume: "asc" }],
      },
      _count: { select: { series: true } },
    },
  });
  if (!row) throw new Error("Pull list not found");

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

export async function replacePullListSeries(
  prisma: PrismaClient,
  userId: string,
  listId: string,
  rawSeries: unknown
): Promise<PullListDetail> {
  const exists = await prisma.pullList.findFirst({
    where: { id: listId, userId },
    select: { id: true },
  });
  if (!exists) throw new Error("Pull list not found");

  const input = Array.isArray(rawSeries) ? rawSeries : [];
  const normalized = input.map(normalizeSeries);
  for (const s of normalized) {
    const errs = validateSeries(s);
    if (errs.length) throw new Error(`Invalid series entry: ${errs.join(", ")}`);
  }

  const uniq = new Map<string, PullListSeriesData>();
  for (const s of normalized) {
    const key = `${s.publisher}|${s.series}|${s.volume}`;
    uniq.set(key, s);
  }

  await prisma.$transaction(async (tx) => {
    await tx.pullListSeries.deleteMany({ where: { pullListId: listId } });
    const values = [...uniq.values()];
    if (values.length > 0) {
      await tx.pullListSeries.createMany({
        data: values.map((s) => ({
          pullListId: listId,
          publisher: s.publisher,
          series: s.series,
          volume: s.volume,
        })),
      });
    }
  });

  return getPullList(prisma, userId, listId);
}

export async function addPullListSeries(
  prisma: PrismaClient,
  userId: string,
  listId: string,
  rawSeries: unknown
): Promise<PullListDetail> {
  const s = normalizeSeries(rawSeries);
  const errs = validateSeries(s);
  if (errs.length) throw new Error(errs.join(", "));

  const list = await prisma.pullList.findFirst({
    where: { id: listId, userId },
    select: { id: true },
  });
  if (!list) throw new Error("Pull list not found");

  await prisma.pullListSeries.upsert({
    where: {
      pull_list_series_unique: {
        pullListId: listId,
        publisher: s.publisher,
        series: s.series,
        volume: s.volume,
      },
    },
    create: {
      pullListId: listId,
      publisher: s.publisher,
      series: s.series,
      volume: s.volume,
    },
    update: {},
  });

  return getPullList(prisma, userId, listId);
}

export async function removePullListSeries(
  prisma: PrismaClient,
  userId: string,
  listId: string,
  rawSeries: unknown
): Promise<PullListDetail> {
  const s = normalizeSeries(rawSeries);
  const errs = validateSeries(s);
  if (errs.length) throw new Error(errs.join(", "));

  const list = await prisma.pullList.findFirst({
    where: { id: listId, userId },
    select: { id: true },
  });
  if (!list) throw new Error("Pull list not found");

  await prisma.pullListSeries.deleteMany({
    where: {
      pullListId: listId,
      publisher: s.publisher,
      series: s.series,
      volume: s.volume,
    },
  });

  return getPullList(prisma, userId, listId);
}
