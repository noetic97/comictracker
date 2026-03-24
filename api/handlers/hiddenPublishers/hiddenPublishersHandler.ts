/**
 * GET/PUT /api/hidden-publishers — per-user hidden publisher preferences.
 */

import { PrismaClient } from "@prisma/client";
import { createResponse, createErrorResponse } from "../../utils/cors";
import {
  getHiddenPublisherState,
  putHiddenPublisherState,
} from "../../services/hiddenPublishers/hiddenPublishersService";

export const handleGetHiddenPublishers = async (
  prisma: PrismaClient,
  userId: string
) => {
  try {
    const state = await getHiddenPublisherState(prisma, userId);
    return createResponse(200, state);
  } catch (error: any) {
    console.error("Get hidden publishers error:", error);
    return createErrorResponse(500, error.message);
  }
};

export const handlePutHiddenPublishers = async (
  prisma: PrismaClient,
  userId: string,
  body: unknown
) => {
  try {
    const state = await putHiddenPublisherState(prisma, userId, body);
    return createResponse(200, state);
  } catch (error: any) {
    console.error("Put hidden publishers error:", error);
    return createErrorResponse(500, error.message);
  }
};
