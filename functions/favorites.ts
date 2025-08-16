import { Handler } from "@netlify/functions";
import { withPrisma } from "./utils/prisma";
import { handleCors, createResponse, createErrorResponse } from "./utils/cors";

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
          const {
            publisher,
            series,
            volume = "",
          } = JSON.parse(event.body || "{}");

          if (!publisher || !series) {
            return createErrorResponse(
              400,
              "Missing required fields: publisher, series"
            );
          }

          // Check if already exists
          const existingFavorite = await prisma.favoriteSeries.findUnique({
            where: {
              publisher_series_volume: {
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
