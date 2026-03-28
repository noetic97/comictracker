/**
 * GET/PUT /api/hidden-series — per-user hidden series preferences.
 * POST /api/hidden-series/hide-collected — server-side fully-collected detection.
 */

import { PrismaClient } from "@prisma/client";
import { createResponse, createErrorResponse } from "../../utils/cors";
import {
  getHiddenSeriesState,
  putHiddenSeriesState,
  hideFullyCollectedSeries,
} from "../../services/hiddenSeries/hiddenSeriesService";

export const handleGetHiddenSeries = async (prisma: PrismaClient, userId: string) => {
  try {
    const state = await getHiddenSeriesState(prisma, userId);
    return createResponse(200, state);
  } catch (error: any) {
    console.error("Get hidden series error:", error);
    return createErrorResponse(500, error.message);
  }
};

export const handlePutHiddenSeries = async (
  prisma: PrismaClient,
  userId: string,
  body: unknown
) => {
  try {
    const state = await putHiddenSeriesState(prisma, userId, body);
    return createResponse(200, state);
  } catch (error: any) {
    console.error("Put hidden series error:", error);
    return createErrorResponse(500, error.message);
  }
};

export const handlePostHideCollectedSeries = async (
  prisma: PrismaClient,
  userId: string
) => {
  try {
    const { count } = await hideFullyCollectedSeries(prisma, userId);
    return createResponse(200, { count });
  } catch (error: any) {
    console.error("Post hide-collected series error:", error);
    return createErrorResponse(500, error.message);
  }
};
