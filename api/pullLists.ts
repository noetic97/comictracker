import { createErrorResponse, handleCors, HandlerResponse } from "./utils/cors";
import { withPrisma } from "./utils/db";
import {
  handleAddPullListSeries,
  handleCreatePullList,
  handleDeletePullList,
  handleGetPullListSeries,
  handleGetPullLists,
  handlePutPullListSeries,
  handleRemovePullListSeries,
  handleRenamePullList,
} from "./handlers/pullLists";

function parseRoute(path: string) {
  const segments = path?.split("/").filter(Boolean) ?? [];
  const idx = segments.findIndex((seg) => seg === "pull-lists");
  if (idx === -1) return { listId: undefined, isSeries: false };
  const listId = segments[idx + 1];
  const isSeries = segments[idx + 2] === "series";
  return { listId, isSeries };
}

function parseBody(raw: any) {
  if (!raw) return {};
  return JSON.parse(raw);
}

export const handler = async (event: any): Promise<HandlerResponse> => {
  const cors = handleCors(event);
  if (cors) return cors;

  try {
    const { httpMethod, path } = event;
    const { listId, isSeries } = parseRoute(path || "");

    return await withPrisma(event, async (prisma, userContext) => {
      if (!listId) {
        if (httpMethod === "GET") return handleGetPullLists(prisma, userContext.userId);
        if (httpMethod === "POST")
          return handleCreatePullList(prisma, userContext.userId, parseBody(event.body));
        return createErrorResponse(405, "Method not allowed");
      }

      if (!isSeries) {
        if (httpMethod === "PATCH")
          return handleRenamePullList(prisma, userContext.userId, listId, parseBody(event.body));
        if (httpMethod === "DELETE")
          return handleDeletePullList(prisma, userContext.userId, listId);
        return createErrorResponse(405, "Method not allowed");
      }

      if (httpMethod === "GET")
        return handleGetPullListSeries(prisma, userContext.userId, listId);
      if (httpMethod === "PUT")
        return handlePutPullListSeries(prisma, userContext.userId, listId, parseBody(event.body));
      if (httpMethod === "POST")
        return handleAddPullListSeries(prisma, userContext.userId, listId, parseBody(event.body));
      if (httpMethod === "DELETE")
        return handleRemovePullListSeries(prisma, userContext.userId, listId, parseBody(event.body));

      return createErrorResponse(405, "Method not allowed");
    });
  } catch (error: any) {
    return createErrorResponse(500, `Internal server error: ${error.message}`);
  }
};
