/**
 * Pull list HTTP handlers.
 */

import { PrismaClient } from "@prisma/client";
import { createErrorResponse, createResponse } from "../../utils/cors";
import {
  addPullListSeries,
  createPullList,
  deletePullList,
  getPullList,
  listPullLists,
  removePullListSeries,
  renamePullList,
  replacePullListSeries,
} from "../../services/pullLists/pullListsService";

export const handleGetPullLists = async (prisma: PrismaClient, userId: string) => {
  try {
    const rows = await listPullLists(prisma, userId);
    return createResponse(200, rows);
  } catch (error: any) {
    return createErrorResponse(500, error.message);
  }
};

export const handleCreatePullList = async (
  prisma: PrismaClient,
  userId: string,
  body: any
) => {
  try {
    const created = await createPullList(prisma, userId, body?.name);
    return createResponse(201, created);
  } catch (error: any) {
    if (String(error?.message ?? "").includes("Unique constraint")) {
      return createErrorResponse(409, "A pull list with this name already exists");
    }
    return createErrorResponse(400, error.message);
  }
};

export const handleRenamePullList = async (
  prisma: PrismaClient,
  userId: string,
  listId: string,
  body: any
) => {
  try {
    const updated = await renamePullList(prisma, userId, listId, body?.name);
    return createResponse(200, updated);
  } catch (error: any) {
    if (String(error?.message ?? "").includes("not found")) {
      return createErrorResponse(404, "Pull list not found");
    }
    if (String(error?.message ?? "").includes("Unique constraint")) {
      return createErrorResponse(409, "A pull list with this name already exists");
    }
    return createErrorResponse(400, error.message);
  }
};

export const handleDeletePullList = async (
  prisma: PrismaClient,
  userId: string,
  listId: string
) => {
  try {
    await deletePullList(prisma, userId, listId);
    return createResponse(204, null);
  } catch (error: any) {
    if (String(error?.message ?? "").includes("not found")) {
      return createErrorResponse(404, "Pull list not found");
    }
    return createErrorResponse(400, error.message);
  }
};

export const handleGetPullListSeries = async (
  prisma: PrismaClient,
  userId: string,
  listId: string
) => {
  try {
    const row = await getPullList(prisma, userId, listId);
    return createResponse(200, row);
  } catch (error: any) {
    if (String(error?.message ?? "").includes("not found")) {
      return createErrorResponse(404, "Pull list not found");
    }
    return createErrorResponse(400, error.message);
  }
};

export const handlePutPullListSeries = async (
  prisma: PrismaClient,
  userId: string,
  listId: string,
  body: any
) => {
  try {
    const row = await replacePullListSeries(prisma, userId, listId, body?.series);
    return createResponse(200, row);
  } catch (error: any) {
    if (String(error?.message ?? "").includes("not found")) {
      return createErrorResponse(404, "Pull list not found");
    }
    return createErrorResponse(400, error.message);
  }
};

export const handleAddPullListSeries = async (
  prisma: PrismaClient,
  userId: string,
  listId: string,
  body: any
) => {
  try {
    const row = await addPullListSeries(prisma, userId, listId, body);
    return createResponse(200, row);
  } catch (error: any) {
    if (String(error?.message ?? "").includes("not found")) {
      return createErrorResponse(404, "Pull list not found");
    }
    return createErrorResponse(400, error.message);
  }
};

export const handleRemovePullListSeries = async (
  prisma: PrismaClient,
  userId: string,
  listId: string,
  body: any
) => {
  try {
    const row = await removePullListSeries(prisma, userId, listId, body);
    return createResponse(200, row);
  } catch (error: any) {
    if (String(error?.message ?? "").includes("not found")) {
      return createErrorResponse(404, "Pull list not found");
    }
    return createErrorResponse(400, error.message);
  }
};
