import { Handler } from "@netlify/functions";
import { withSupabaseRLS } from "./utils/supabase";
import { handleCors, createResponse, createErrorResponse } from "./utils/cors";

export const handler: Handler = async (event) => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod } = event;

    if (httpMethod !== "DELETE") {
      return createErrorResponse(
        405,
        "Only DELETE method allowed for admin operations"
      );
    }

    return await withSupabaseRLS(event, async (supabase, userContext) => {
      // Verify admin permissions
      if (!userContext.isAdmin) {
        return createErrorResponse(
          403,
          "Admin privileges required for this operation"
        );
      }

      console.log("🗑️ Starting database clear operation for admin user");

      // TODO: CRITICAL - Multi-user safety update needed!
      // When adding multiple users, this function needs to be updated to either:
      // 1. Only delete the current admin user's data, OR
      // 2. Add an additional confirmation parameter like ?confirmGlobalDelete=true
      // 3. Split into separate endpoints: /admin/clear-my-data vs /admin/clear-all-data
      // Current behavior: DELETES ALL DATA FROM ALL USERS (single-tenant safe only)

      try {
        // Get counts before deletion for reporting
        const [comicsResult, favoritesResult, alertsResult] = await Promise.all(
          [
            supabase.from("comics").select("*", { count: "exact", head: true }),
            supabase
              .from("favorite_series")
              .select("*", { count: "exact", head: true }),
            supabase
              .from("alert_logs")
              .select("*", { count: "exact", head: true }),
          ]
        );

        const originalCounts = {
          comics: comicsResult.count || 0,
          favorites: favoritesResult.count || 0,
          alerts: alertsResult.count || 0,
        };

        console.log(
          `📊 Found ${originalCounts.comics} comics, ${originalCounts.favorites} favorites, ${originalCounts.alerts} alerts`
        );

        // Delete all data using service role (bypasses RLS)
        const [deleteComics, deleteFavorites, deleteAlerts] = await Promise.all(
          [
            supabase.from("comics").delete().neq("id", ""), // Delete all comics
            supabase.from("favorite_series").delete().neq("id", ""), // Delete all favorites
            supabase.from("alert_logs").delete().neq("id", ""), // Delete all alerts
          ]
        );

        // Check for errors
        if (deleteComics.error) {
          console.error("Error deleting comics:", deleteComics.error);
          throw new Error(
            `Failed to delete comics: ${deleteComics.error.message}`
          );
        }
        if (deleteFavorites.error) {
          console.error("Error deleting favorites:", deleteFavorites.error);
          throw new Error(
            `Failed to delete favorites: ${deleteFavorites.error.message}`
          );
        }
        if (deleteAlerts.error) {
          console.error("Error deleting alerts:", deleteAlerts.error);
          throw new Error(
            `Failed to delete alerts: ${deleteAlerts.error.message}`
          );
        }

        console.log(`✅ Successfully cleared database`);

        return createResponse(200, {
          message: "Successfully cleared entire database",
          deleted: {
            comics: originalCounts.comics,
            favorites: originalCounts.favorites,
            alerts: originalCounts.alerts,
            total:
              originalCounts.comics +
              originalCounts.favorites +
              originalCounts.alerts,
          },
          warning: "This operation deleted ALL data from ALL users",
        });
      } catch (error: any) {
        console.error("Database clear operation failed:", error);
        throw error;
      }
    });
  } catch (error: any) {
    console.error("❌ Admin clear database error:", error);
    return createErrorResponse(
      500,
      `Failed to clear database: ${error.message}`
    );
  }
};
