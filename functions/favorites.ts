import { Handler } from "@netlify/functions";
import { withPrisma } from "./utils/prisma";
import { handleCors, createResponse, createErrorResponse } from "./utils/cors";

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

    return await withPrisma(async (prisma) => {
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

            const favorite = await prisma.favoriteSeries.findUnique({
              where: {
                publisher_series_volume: {
                  publisher,
                  series,
                  volume,
                },
              },
            });

            return createResponse(200, {
              isFavorite: !!favorite,
              favorite: favorite || undefined,
            });
          }

          // Get all favorite series
          const favorites = await prisma.favoriteSeries.findMany({
            orderBy: { dateAdded: "desc" },
          });

          return createResponse(200, favorites);

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

          // Check if already exists
          const existingFavorite = await prisma.favoriteSeries.findUnique({
            where: {
              publisher_series_volume_volume: {
                publisher,
                series,
                volume,
              },
            },
          });

          if (existingFavorite) {
            return createErrorResponse(409, "Series is already favorited");
          }

          const newFavorite = await prisma.favoriteSeries.create({
            data: {
              publisher,
              series,
              volume,
            },
          });

          return createResponse(201, newFavorite);

        case "DELETE":
          if (!favoriteId) {
            return createErrorResponse(
              400,
              "Favorite ID required for DELETE operations"
            );
          }

          // Check if favorite exists
          const favoriteToDelete = await prisma.favoriteSeries.findUnique({
            where: { id: favoriteId },
          });

          if (!favoriteToDelete) {
            return createErrorResponse(404, "Favorite series not found");
          }

          await prisma.favoriteSeries.delete({
            where: { id: favoriteId },
          });

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
