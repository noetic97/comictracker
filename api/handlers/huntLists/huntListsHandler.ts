import { PrismaClient } from "@prisma/client";
import { createErrorResponse, createResponse } from "../../utils/cors";
import {
  addHuntListSeries,
  createHuntList,
  deleteHuntList,
  getHuntList,
  listHuntLists,
  removeHuntListSeries,
  renameHuntList,
  replaceHuntListSeries,
} from "../../services/huntLists/huntListsService";

export const handleGetHuntLists = async (prisma: PrismaClient, userId: string) => {
  try {
    const rows = await listHuntLists(prisma, userId);
    return createResponse(200, rows);
  } catch (error: any) {
    return createErrorResponse(500, error.message);
  }
};

export const handleCreateHuntList = async (
  prisma: PrismaClient,
  userId: string,
  body: any
) => {
  try {
    const created = await createHuntList(prisma, userId, body?.name);
    return createResponse(201, created);
  } catch (error: any) {
    if (String(error?.message ?? "").includes("Unique constraint")) {
      return createErrorResponse(409, "A hunt list with this name already exists");
    }
    return createErrorResponse(400, error.message);
  }
};

export const handleRenameHuntList = async (
  prisma: PrismaClient,
  userId: string,
  listId: string,
  body: any
) => {
  try {
    const updated = await renameHuntList(prisma, userId, listId, body?.name);
    return createResponse(200, updated);
  } catch (error: any) {
    if (String(error?.message ?? "").includes("not found")) {
      return createErrorResponse(404, "Hunt list not found");
    }
    if (String(error?.message ?? "").includes("Unique constraint")) {
      return createErrorResponse(409, "A hunt list with this name already exists");
    }
    return createErrorResponse(400, error.message);
  }
};

export const handleDeleteHuntList = async (
  prisma: PrismaClient,
  userId: string,
  listId: string
) => {
  try {
    await deleteHuntList(prisma, userId, listId);
    return createResponse(204, null);
  } catch (error: any) {
    if (String(error?.message ?? "").includes("not found")) {
      return createErrorResponse(404, "Hunt list not found");
    }
    return createErrorResponse(400, error.message);
  }
};

export const handleGetHuntListSeries = async (
  prisma: PrismaClient,
  userId: string,
  listId: string
) => {
  try {
    const row = await getHuntList(prisma, userId, listId);
    return createResponse(200, row);
  } catch (error: any) {
    if (String(error?.message ?? "").includes("not found")) {
      return createErrorResponse(404, "Hunt list not found");
    }
    return createErrorResponse(400, error.message);
  }
};

export const handlePutHuntListSeries = async (
  prisma: PrismaClient,
  userId: string,
  listId: string,
  body: any
) => {
  try {
    const row = await replaceHuntListSeries(prisma, userId, listId, body?.series);
    return createResponse(200, row);
  } catch (error: any) {
    if (String(error?.message ?? "").includes("not found")) {
      return createErrorResponse(404, "Hunt list not found");
    }
    return createErrorResponse(400, error.message);
  }
};

export const handleAddHuntListSeries = async (
  prisma: PrismaClient,
  userId: string,
  listId: string,
  body: any
) => {
  try {
    const row = await addHuntListSeries(prisma, userId, listId, body);
    return createResponse(200, row);
  } catch (error: any) {
    if (String(error?.message ?? "").includes("not found")) {
      return createErrorResponse(404, "Hunt list not found");
    }
    return createErrorResponse(400, error.message);
  }
};

export const handleRemoveHuntListSeries = async (
  prisma: PrismaClient,
  userId: string,
  listId: string,
  body: any
) => {
  try {
    const row = await removeHuntListSeries(prisma, userId, listId, body);
    return createResponse(200, row);
  } catch (error: any) {
    if (String(error?.message ?? "").includes("not found")) {
      return createErrorResponse(404, "Hunt list not found");
    }
    return createErrorResponse(400, error.message);
  }
};
