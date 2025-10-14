/**
 * Admin Handler - Business logic layer for admin operations
 * Extracted from functions/admin.ts for better separation of concerns
 * Handles HTTP request/response logic and delegates to services
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { createResponse, createErrorResponse } from "../../utils/cors";
import {
  clearAllDatabaseData,
  clearUserData,
  getDatabaseCounts,
} from "../../services/admin/adminService";
import { UserContext } from "../../types/handlers";

/**
 * Handle DELETE requests for clearing database
 * Currently supports clearing all data (single-tenant mode)
 * TODO: Add support for user-specific clearing when multi-user is implemented
 */
export const handleClearDatabase = async (
  supabase: SupabaseClient,
  userContext: UserContext,
  queryParams: any = {}
) => {
  try {
    // Verify admin permissions
    if (!userContext.isAdmin) {
      return createErrorResponse(
        403,
        "Admin privileges required for this operation"
      );
    }

    console.log("🗑️ Admin clear database requested by:", userContext.email);

    // Check for future multi-user safety parameter
    const confirmGlobalDelete = queryParams?.confirmGlobalDelete;
    const userOnly = queryParams?.userOnly;

    if (userOnly === "true") {
      // Future: Clear only user's data (safer for multi-user)
      const result = await clearUserData(supabase, userContext.userId);
      return createResponse(200, result);
    } else {
      // Current: Clear all data (single-tenant mode)
      const result = await clearAllDatabaseData(supabase);
      return createResponse(200, result);
    }
  } catch (error: any) {
    console.error("Clear database error:", error);
    return createErrorResponse(500, error.message);
  }
};

/**
 * Handle GET requests for database statistics (admin only)
 * Future enhancement: Could be useful for admin dashboard
 */
export const handleGetDatabaseStats = async (
  supabase: SupabaseClient,
  userContext: UserContext
) => {
  try {
    // Verify admin permissions
    if (!userContext.isAdmin) {
      return createErrorResponse(
        403,
        "Admin privileges required for this operation"
      );
    }

    const counts = await getDatabaseCounts(supabase);

    return createResponse(200, {
      counts,
      timestamp: new Date().toISOString(),
      adminUser: userContext.email,
    });
  } catch (error: any) {
    console.error("Get database stats error:", error);
    return createErrorResponse(500, error.message);
  }
};
