// functions/favorites.ts - Updated with Supabase RLS
import { Handler } from "@netlify/functions";
import { handleCors, createResponse, createErrorResponse } from "./utils/cors";
import {
  withSupabaseRLS,
  transformFromDatabase,
  transformToDatabase,
} from "./utils/supabase";

// Simple runtime validation (no external deps)
const validateFavoriteInput = (data: any) => {
  const errors: string[] = [];
  if (!data || typeof data !== "object") {
    errors.push("Body must be a JSON object");
    return errors;
  }
  if (
    !data.publisher ||
    typeof data.publisher !== "string" ||
    !data.publisher.trim()
  ) {
    errors.push("'publisher' is required and must be a non-empty string");
  }
  if (!data.series || typeof data.series !== "string" || !data.series.trim()) {
    errors.push("'series' is required and must be a non-empty string");
  }
  if (data.volume !== undefined && typeof data.volume !== "string") {
    errors.push("'volume' must be a string if provided");
  }
  return errors;
};

export const handler: Handler = async (event) => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod, path, queryStringParameters } = event;
    const segments = path?.split("/").filter(Boolean) || [];
    const favoriteId = segments[segments.length - 1];
    const isCheckEndpoint = path?.includes("/check");

    return await withSupabaseRLS(event, async (supabase, userContext) => {
      switch (httpMethod) {
        case "GET":
          if (isCheckEndpoint) {
            // Check if a series is favorited
            const {
              publisher,
              series,
              volume = "",
            } = queryStringParameters || {};

            if (!publisher || !series) {
              return createErrorResponse(
                400,
                "Publisher and series parameters required for check"
              );
            }

            console.log(
              `🔍 Checking favorite: ${publisher} - ${series} (${volume}) for user ${userContext.userId}`
            );

            const { data: favorite, error } = await supabase
              .from("favorite_series")
              .select("*")
              .eq("publisher", publisher)
              .eq("series", series)
              .eq("volume", volume)
              .eq("user_id", userContext.userId)
              .single();

            if (error && error.code !== "PGRST116") {
              // PGRST116 = no rows found
              console.error("Error checking favorite:", error);
              return createErrorResponse(
                500,
                `Database error: ${error.message}`
              );
            }

            const isFavorite = !!favorite;
            console.log(`✅ Favorite check result: ${isFavorite}`);

            return createResponse(200, {
              isFavorite,
              favorite: favorite ? transformFromDatabase(favorite) : undefined,
            });
          }

          // Get all favorite series for the user
          console.log(
            `📋 Getting all favorites for user ${userContext.userId}`
          );

          const { data: favorites, error: listError } = await supabase
            .from("favorite_series")
            .select("*")
            .eq("user_id", userContext.userId)
            .order("dateAdded", { ascending: false });

          if (listError) {
            console.error("Error fetching favorites:", listError);
            return createErrorResponse(
              500,
              `Database error: ${listError.message}`
            );
          }

          // Transform snake_case to camelCase for frontend
          const transformedFavorites = (favorites || []).map(
            transformFromDatabase
          );

          console.log(`✅ Found ${transformedFavorites.length} favorites`);
          return createResponse(200, transformedFavorites);

        case "POST":
          // Add new favorite series
          let parsedBody: any = {};
          try {
            parsedBody = event.body ? JSON.parse(event.body) : {};
          } catch {
            return createErrorResponse(400, "Invalid JSON body");
          }

          const { publisher, series, volume = "" } = parsedBody;

          const favoriteErrors = validateFavoriteInput({
            publisher,
            series,
            volume,
          });
          if (favoriteErrors.length) {
            return createResponse(422, {
              error: "Validation failed",
              errors: favoriteErrors,
            });
          }

          console.log(
            `➕ Adding favorite: ${publisher} - ${series} (${volume}) for user ${userContext.userId}`
          );

          // Check if already exists
          const { data: existingFavorite, error: existsError } = await supabase
            .from("favorite_series")
            .select("id")
            .eq("publisher", publisher)
            .eq("series", series)
            .eq("volume", volume)
            .eq("user_id", userContext.userId)
            .single();

          if (existsError && existsError.code !== "PGRST116") {
            console.error("Error checking existing favorite:", existsError);
            return createErrorResponse(
              500,
              `Database error: ${existsError.message}`
            );
          }

          if (existingFavorite) {
            return createErrorResponse(409, "Series is already favorited");
          }

          // Create the new favorite
          const favoriteData = transformToDatabase({
            publisher,
            series,
            volume,
            userId: userContext.userId,
          });

          const { data: newFavorite, error: createError } = await supabase
            .from("favorite_series")
            .insert([favoriteData])
            .select()
            .single();

          if (createError) {
            console.error("Error creating favorite:", createError);
            return createErrorResponse(
              500,
              `Failed to create favorite: ${createError.message}`
            );
          }

          const transformedNewFavorite = {
            ...newFavorite,
            userId: newFavorite.user_id,
          };
          console.log(`✅ Created favorite:`, transformedNewFavorite);

          return createResponse(201, transformedNewFavorite);

        case "DELETE":
          if (!favoriteId) {
            return createErrorResponse(
              400,
              "Favorite ID required for DELETE operations"
            );
          }

          console.log(
            `🗑️ Deleting favorite ${favoriteId} for user ${userContext.userId}`
          );

          // Check if favorite exists and belongs to user
          const { data: favoriteToDelete, error: fetchError } = await supabase
            .from("favorite_series")
            .select("id")
            .eq("id", favoriteId)
            .eq("user_id", userContext.userId)
            .single();

          if (fetchError || !favoriteToDelete) {
            return createErrorResponse(404, "Favorite series not found");
          }

          // Delete the favorite
          const { error: deleteError } = await supabase
            .from("favorite_series")
            .delete()
            .eq("id", favoriteId)
            .eq("user_id", userContext.userId);

          if (deleteError) {
            console.error("Error deleting favorite:", deleteError);
            return createErrorResponse(
              500,
              `Failed to delete favorite: ${deleteError.message}`
            );
          }

          console.log(`✅ Deleted favorite ${favoriteId}`);
          return createResponse(204, null);

        default:
          return createErrorResponse(405, "Method not allowed");
      }
    });
  } catch (error: any) {
    console.error("Favorites function error:", error);
    return createErrorResponse(500, `Internal server error: ${error.message}`);
  }
};
