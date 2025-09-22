import { Handler } from "@netlify/functions";
import { handleCors, createResponse, createErrorResponse } from "./utils/cors";
import { withSupabaseRLS } from "./utils/supabase";
import {
  handleGetStats,
  handleGetPublishers,
  handleGetSeries,
} from "./comics/aggregations";
import { handleBulkImport } from "./comics/bulkOperations";
import { validateComic, transformComicOutput } from "./comics/validation";

/**
 * Parse URL to extract comic ID and action
 */
const parseComicRoute = (path: string) => {
  const segments = path?.split("/").filter(Boolean) || [];

  // Handle different URL patterns:
  // /api/comics/stats
  // /api/comics/publishers
  // /api/comics/series
  // /api/comics/bulk
  // /api/comics/123
  // /api/comics/123/collect
  // /api/comics/123/grail

  if (segments.includes("stats")) {
    return { isStats: true };
  }

  if (segments.includes("publishers")) {
    return { isPublishers: true };
  }

  if (segments.includes("series")) {
    return { isSeries: true };
  }

  if (segments.includes("bulk")) {
    return { isBulk: true };
  }

  const comicsIndex = segments.findIndex((seg) => seg === "comics");
  if (comicsIndex === -1) {
    return {};
  }

  const comicId = segments[comicsIndex + 1];
  const action = segments[comicsIndex + 2];

  return { comicId, action };
};

/**
 * Handle GET requests for comics
 * IMPORTANT: Uses correct database column names (camelCase)
 */
const handleGetComics = async (
  supabase: any,
  userId: string,
  queryParams: any
) => {
  const {
    publisher,
    series,
    volume,
    collected,
    isGrail,
    signed,
    grade,
    storageLocation,
    search,
    exact,
    page = "1",
    limit = "25",
    offset,
    order,
    favoriteSeriesOnly,
  } = queryParams || {};

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offsetNum =
    offset !== undefined
      ? parseInt(offset as string, 10)
      : (pageNum - 1) * limitNum;

  console.log(
    `📋 Getting comics for user ${userId}, page ${pageNum}, limit ${limitNum}`
  );

  // CORRECTED: Using actual database column names
  let query = supabase
    .from("comics")
    .select("*", { count: "exact" })
    .eq("user_id", userId);

  const applyOrder = (ord?: string) => {
    const whitelist = new Set([
      "series",
      "publisher",
      "currentValue",
      "pricePaid",
      "grade",
      "createdAt",
      "issue",
      "issueNumber",
      "collected",
      "isGrail",
      "id",
    ]);

    if (!ord) {
      query = query
        .order("series", { ascending: true })
        .order("issueNumber", { ascending: true })
        .order("id", { ascending: true });
      return;
    }

    const parts = ord.split(",").map((s) => s.trim());
    for (const p of parts) {
      const [col, dir] = p.split("."); // e.g., series.asc
      if (whitelist.has(col)) {
        query = query.order(col, {
          ascending: (dir ?? "asc").toLowerCase() !== "desc",
        });
      }
    }
    // Ensure deterministic tiebreaker
    query = query.order("id", { ascending: true });
  };
  applyOrder(order as string | undefined);

  // Apply filters using CORRECT database column names
  if (publisher) {
    if (exact === "true") {
      query = query.eq("publisher", publisher);
    } else {
      query = query.ilike("publisher", `%${publisher}%`);
    }
  }
  if (series) {
    if (exact === "true") {
      query = query.eq("series", series);
    } else {
      query = query.ilike("series", `%${series}%`);
    }
  }
  if (volume) {
    if (exact === "true") {
      query = query.eq("volume", volume);
    } else {
      query = query.ilike("volume", `%${volume}%`);
    }
  }
  if (collected === "true") query = query.eq("collected", true);
  if (collected === "false") query = query.eq("collected", false);
  if (isGrail === "true") query = query.eq("isGrail", true); // CORRECTED: isGrail is camelCase in DB
  if (signed === "true") query = query.eq("signed", true);
  if (grade) query = query.eq("grade", grade);
  if (storageLocation) {
    query = query.ilike("storageLocation", `%${storageLocation}%`); // CORRECTED: storageLocation is camelCase in DB
  }

  if (search) {
    query = query.or(
      `publisher.ilike.%${search}%,series.ilike.%${search}%,issue.ilike.%${search}%`
    );
  }

  // Apply favorites filter (server-side)
  if (favoriteSeriesOnly === "true") {
    // Load user's favorite series triplets
    const { data: favs, error: favErr } = await supabase
      .from("favorite_series")
      .select("publisher,series,volume")
      .eq("user_id", userId);

    if (favErr) {
      console.error("Favorites fetch error:", favErr);
      return createErrorResponse(
        500,
        `Failed to load favorites: ${favErr.message}`
      );
    }

    if (!favs || favs.length === 0) {
      return createResponse(200, {
        comics: [],
        pagination: { page: pageNum, limit: limitNum, total: 0, pages: 0 },
      });
    }

    // Build OR expression of favored series (publisher/series[/volume])
    const groups = favs.map((f: any) => {
      const parts = [`publisher.eq.${f.publisher}`, `series.eq.${f.series}`];
      if (f.volume && String(f.volume).length > 0) {
        parts.push(`volume.eq.${f.volume}`);
      }
      return `and(${parts.join(",")})`;
    });
    const orExpression = groups.join(",");
    // Apply server-side favorites filter
    query = query.or(orExpression);
  }

  // Apply pagination
  query = query.range(offsetNum, offsetNum + limitNum - 1);

  const { data: comics, error, count } = await query;

  if (error) {
    console.error("Supabase query error:", error);
    return createErrorResponse(500, `Database error: ${error.message}`);
  }

  // Transform comics for frontend (minimal transformation needed since DB uses camelCase)
  const transformedComics = (comics || []).map(transformComicOutput);

  console.log(`✅ Found ${transformedComics.length} comics (${count} total)`);

  return createResponse(200, {
    comics: transformedComics,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      pages: Math.ceil((count || 0) / limitNum),
    },
  });
};

/**
 * Handle POST requests for creating comics
 */
const handleCreateComic = async (supabase: any, userId: string, body: any) => {
  const validation = validateComic(body);

  if (!validation.isValid) {
    return createResponse(422, {
      error: "Validation failed",
      errors: validation.errors,
    });
  }

  // Add user_id (snake_case in DB) to the validated data
  const comicData = {
    ...validation.data,
    user_id: userId, // CORRECTED: user_id is snake_case in DB
  };

  const { data: newComic, error: createError } = await supabase
    .from("comics")
    .insert([comicData])
    .select()
    .single();

  if (createError) {
    console.error("Create comic error:", createError);
    return createErrorResponse(
      500,
      `Failed to create comic: ${createError.message}`
    );
  }

  return createResponse(201, transformComicOutput(newComic));
};

/**
 * Handle PATCH requests for toggle operations
 * IMPORTANT: Uses correct database column names
 */
const handleToggleAction = async (
  supabase: any,
  userId: string,
  comicId: string,
  action: string
) => {
  console.log(`🔄 Toggling ${action} for comic ${comicId} (user ${userId})`);

  // Get the comic first using correct column names
  const { data: comic, error: fetchError } = await supabase
    .from("comics")
    .select("*")
    .eq("id", comicId)
    .eq("user_id", userId) // CORRECTED: user_id is snake_case in DB
    .single();

  if (fetchError || !comic) {
    console.error("Fetch comic error:", fetchError);
    return createErrorResponse(404, "Comic not found");
  }

  let updateData: any = {};

  if (action === "collect") {
    updateData.collected = !comic.collected;
  } else if (action === "grail") {
    updateData.isGrail = !comic.isGrail; // CORRECTED: isGrail is camelCase in DB
  } else {
    return createErrorResponse(400, "Invalid action. Use 'collect' or 'grail'");
  }

  const { data: updatedComic, error: updateError } = await supabase
    .from("comics")
    .update(updateData)
    .eq("id", comicId)
    .eq("user_id", userId) // CORRECTED: user_id is snake_case in DB
    .select()
    .single();

  if (updateError) {
    console.error("Update comic error:", updateError);
    return createErrorResponse(
      500,
      `Failed to update comic: ${updateError.message}`
    );
  }

  return createResponse(200, transformComicOutput(updatedComic));
};

/**
 * Handle PUT requests for updating comics
 */
const handleUpdateComic = async (
  supabase: any,
  userId: string,
  comicId: string,
  body: any
) => {
  const { data: updatedComic, error: putError } = await supabase
    .from("comics")
    .update(body)
    .eq("id", comicId)
    .eq("user_id", userId) // CORRECTED: user_id is snake_case in DB
    .select()
    .single();

  if (putError) {
    console.error("Put comic error:", putError);
    return createErrorResponse(
      500,
      `Failed to update comic: ${putError.message}`
    );
  }

  return createResponse(200, transformComicOutput(updatedComic));
};

/**
 * Handle DELETE requests for deleting comics
 */
const handleDeleteComic = async (
  supabase: any,
  userId: string,
  comicId: string
) => {
  const { error: deleteError } = await supabase
    .from("comics")
    .delete()
    .eq("id", comicId)
    .eq("user_id", userId); // CORRECTED: user_id is snake_case in DB

  if (deleteError) {
    console.error("Delete comic error:", deleteError);
    return createErrorResponse(
      500,
      `Failed to delete comic: ${deleteError.message}`
    );
  }

  return createResponse(204, null);
};

/**
 * Main handler - routing only
 */
export const handler: Handler = async (event) => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod, path } = event;
    const route = parseComicRoute(path || "");

    console.log(`📡 Comics API: ${httpMethod} ${path}`);

    return await withSupabaseRLS(event, async (supabase, userContext) => {
      // Handle aggregation endpoints
      if (route.isStats && httpMethod === "GET") {
        return await handleGetStats(
          supabase,
          userContext.userId,
          event.queryStringParameters
        );
      }

      if (route.isPublishers && httpMethod === "GET") {
        return await handleGetPublishers(
          supabase,
          userContext.userId,
          event.queryStringParameters
        );
      }

      if (route.isSeries && httpMethod === "GET") {
        return await handleGetSeries(
          supabase,
          userContext.userId,
          event.queryStringParameters
        );
      }
      // Handle bulk operations
      if (route.isBulk && httpMethod === "POST") {
        let body: any = {};
        try {
          body = event.body ? JSON.parse(event.body) : {};
        } catch {
          return createErrorResponse(400, "Invalid JSON body");
        }
        return await handleBulkImport(body, supabase, userContext.userId);
      }

      // Handle regular operations
      switch (httpMethod) {
        case "GET":
          return await handleGetComics(
            supabase,
            userContext.userId,
            event.queryStringParameters
          );

        case "POST":
          // Single comic creation
          let body: any = {};
          try {
            body = event.body ? JSON.parse(event.body) : {};
          } catch {
            return createErrorResponse(400, "Invalid JSON body");
          }
          return await handleCreateComic(supabase, userContext.userId, body);

        case "PATCH":
          // Toggle operations
          if (!route.comicId) {
            return createErrorResponse(
              400,
              "Comic ID required for PATCH operations"
            );
          }
          return await handleToggleAction(
            supabase,
            userContext.userId,
            route.comicId,
            route.action || ""
          );

        case "PUT":
          // Update comic
          if (!route.comicId) {
            return createErrorResponse(
              400,
              "Comic ID required for PUT operations"
            );
          }
          let updateBody: any = {};
          try {
            updateBody = event.body ? JSON.parse(event.body) : {};
          } catch {
            return createErrorResponse(400, "Invalid JSON body");
          }
          return await handleUpdateComic(
            supabase,
            userContext.userId,
            route.comicId,
            updateBody
          );

        case "DELETE":
          // Delete comic
          if (!route.comicId) {
            return createErrorResponse(
              400,
              "Comic ID required for DELETE operations"
            );
          }
          return await handleDeleteComic(
            supabase,
            userContext.userId,
            route.comicId
          );

        default:
          return createErrorResponse(405, "Method not allowed");
      }
    });
  } catch (error: any) {
    console.error("Comics function error:", error);
    return createErrorResponse(500, `Internal server error: ${error.message}`);
  }
};
