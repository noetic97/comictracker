import { Handler } from "@netlify/functions";
import { withPrisma } from "./utils/prisma";
import { handleCors, createResponse, createErrorResponse } from "./utils/cors";

export const handler: Handler = async (event) => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod } = event;

    return await withPrisma(async (prisma) => {
      switch (httpMethod) {
        case "GET":
          // Simple test - get all comics
          const comics = await prisma.comic.findMany({
            take: 10, // Limit to 10 for testing
            orderBy: { createdAt: "desc" },
          });

          return createResponse(200, {
            comics,
            count: comics.length,
            message: "Comics API is working!",
          });

        case "POST":
          // Simple test - create a comic
          const { publisher, series, issue, issueNumber, currentValue } =
            JSON.parse(event.body || "{}");

          if (!publisher || !series || !issue) {
            return createErrorResponse(
              400,
              "Missing required fields: publisher, series, issue"
            );
          }

          const newComic = await prisma.comic.create({
            data: {
              publisher,
              series,
              issue,
              issueNumber: parseInt(issueNumber) || 1,
              currentValue: parseFloat(currentValue) || 0,
              volume: "",
              years: "",
              type: "",
            },
          });

          return createResponse(201, newComic);

        default:
          return createErrorResponse(405, "Method not allowed");
      }
    });
  } catch (error: any) {
    console.error("Comics function error:", error);
    return createErrorResponse(500, `Internal server error: ${error.message}`);
  }
};
