/**
 * Admin Service - Core data access layer for admin operations
 * Extracted from functions/admin.ts for better separation of concerns
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseCounts, ClearDatabaseResult } from "../../types/services";

/**
 * Get counts of all data in the database
 */
export const getDatabaseCounts = async (
  supabase: SupabaseClient
): Promise<DatabaseCounts> => {
  console.log("📊 Getting database counts for admin user");

  // Get counts before deletion for reporting
  const [comicsResult, favoritesResult, alertsResult] = await Promise.all([
    supabase.from("comics").select("*", { count: "exact", head: true }),
    supabase
      .from("favorite_series")
      .select("*", { count: "exact", head: true }),
    supabase.from("alert_logs").select("*", { count: "exact", head: true }),
  ]);

  const counts = {
    comics: comicsResult.count || 0,
    favorites: favoritesResult.count || 0,
    alerts: alertsResult.count || 0,
    total: 0,
  };

  counts.total = counts.comics + counts.favorites + counts.alerts;

  console.log(
    `📊 Found ${counts.comics} comics, ${counts.favorites} favorites, ${counts.alerts} alerts (${counts.total} total)`
  );

  return counts;
};

/**
 * Clear all data from the database
 * WARNING: This deletes ALL data from ALL users (single-tenant safe only)
 */
export const clearAllDatabaseData = async (
  supabase: SupabaseClient
): Promise<ClearDatabaseResult> => {
  console.log("🗑️ Starting database clear operation");

  // TODO: CRITICAL - Multi-user safety update needed!
  // When adding multiple users, this function needs to be updated to either:
  // 1. Only delete the current admin user's data, OR
  // 2. Add an additional confirmation parameter like ?confirmGlobalDelete=true
  // 3. Split into separate endpoints: /admin/clear-my-data vs /admin/clear-all-data
  // Current behavior: DELETES ALL DATA FROM ALL USERS (single-tenant safe only)

  // Get counts before deletion for reporting
  const originalCounts = await getDatabaseCounts(supabase);

  // Delete all data using service role (bypasses RLS)
  const [deleteComics, deleteFavorites, deleteAlerts] = await Promise.all([
    supabase.from("comics").delete().neq("id", ""), // Delete all comics
    supabase.from("favorite_series").delete().neq("id", ""), // Delete all favorites
    supabase.from("alert_logs").delete().neq("id", ""), // Delete all alerts
  ]);

  // Check for errors
  if (deleteComics.error) {
    console.error("Error deleting comics:", deleteComics.error);
    throw new Error(`Failed to delete comics: ${deleteComics.error.message}`);
  }

  if (deleteFavorites.error) {
    console.error("Error deleting favorites:", deleteFavorites.error);
    throw new Error(
      `Failed to delete favorites: ${deleteFavorites.error.message}`
    );
  }

  if (deleteAlerts.error) {
    console.error("Error deleting alerts:", deleteAlerts.error);
    throw new Error(`Failed to delete alerts: ${deleteAlerts.error.message}`);
  }

  console.log(`✅ Successfully cleared database`);

  return {
    message: "Successfully cleared entire database",
    deleted: originalCounts,
    warning: "This operation deleted ALL data from ALL users",
  };
};

/**
 * Clear only the current user's data (safer multi-user approach)
 * TODO: Implement when multi-user support is added
 */
export const clearUserData = async (
  supabase: SupabaseClient,
  userId: string
): Promise<ClearDatabaseResult> => {
  console.log(`🗑️ Starting user data clear operation for user ${userId}`);

  // Get user's counts before deletion
  const [comicsResult, favoritesResult, alertsResult] = await Promise.all([
    supabase
      .from("comics")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("favorite_series")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("alert_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const userCounts = {
    comics: comicsResult.count || 0,
    favorites: favoritesResult.count || 0,
    alerts: alertsResult.count || 0,
    total: 0,
  };

  userCounts.total =
    userCounts.comics + userCounts.favorites + userCounts.alerts;

  // Delete user's data only
  const [deleteComics, deleteFavorites, deleteAlerts] = await Promise.all([
    supabase.from("comics").delete().eq("user_id", userId),
    supabase.from("favorite_series").delete().eq("user_id", userId),
    supabase.from("alert_logs").delete().eq("user_id", userId),
  ]);

  // Check for errors
  if (deleteComics.error) {
    console.error("Error deleting user comics:", deleteComics.error);
    throw new Error(`Failed to delete comics: ${deleteComics.error.message}`);
  }

  if (deleteFavorites.error) {
    console.error("Error deleting user favorites:", deleteFavorites.error);
    throw new Error(
      `Failed to delete favorites: ${deleteFavorites.error.message}`
    );
  }

  if (deleteAlerts.error) {
    console.error("Error deleting user alerts:", deleteAlerts.error);
    throw new Error(`Failed to delete alerts: ${deleteAlerts.error.message}`);
  }

  console.log(`✅ Successfully cleared user data for ${userId}`);

  return {
    message: `Successfully cleared all data for user ${userId}`,
    deleted: userCounts,
    warning: "This operation deleted only your data, not other users' data",
  };
};
