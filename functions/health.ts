import { Handler } from "@netlify/functions";
import { handleCors, createResponse } from "./utils/cors";
import { createClient } from "@supabase/supabase-js";

interface HealthCheckResult {
  ok: boolean;
  status: "healthy" | "degraded" | "down";
  timestamp: string;
  latencyMs: number;
  database: {
    supabase: {
      connected: boolean;
      latencyMs: number;
      rlsEnabled: boolean;
      userCount: number;
      error?: string;
    };
  };
  debug?: {
    environment: string;
    databaseUrl: string;
    supabaseUrl: string;
    nodeVersion: string;
    memoryUsage: NodeJS.MemoryUsage;
  };
}

export const handler: Handler = async (event) => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  const startTime = Date.now();
  const debug = event.queryStringParameters?.debug === "true";

  try {
    // Initialize results
    const dbResult = {
      supabase: {
        connected: false,
        latencyMs: 0,
        rlsEnabled: false,
        userCount: 0,
        error: undefined as string | undefined,
      },
    };

    // Test Supabase connection
    const supabaseStartTime = Date.now();
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      // Test basic connection with a simple query
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .limit(1);

      if (userError) throw userError;
      console.log(
        "Supabase connection test successful, found users:",
        userData?.length || 0
      );

      // Get user count to verify service role access
      const { count: userCount, error: countError } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      // Try to check if RLS is working by testing access
      let rlsEnabled = false;
      try {
        // This should work with service role even with RLS enabled
        const { count: comicCount, error: comicError } = await supabase
          .from("comics")
          .select("*", { count: "exact", head: true });

        if (!comicError && comicCount !== null) {
          rlsEnabled = true; // If we can access comics with service role, RLS is configured
          console.log(
            "RLS test: Service role can access comics, count:",
            comicCount
          );
        }
      } catch (rlsTestError: any) {
        console.log("RLS test failed:", rlsTestError.message);
      }

      dbResult.supabase = {
        connected: true,
        latencyMs: Date.now() - supabaseStartTime,
        rlsEnabled,
        userCount: userCount || 0,
        error: undefined, // No error since we succeeded
      };
    } catch (error: any) {
      dbResult.supabase.connected = false;
      dbResult.supabase.latencyMs = Date.now() - supabaseStartTime;
      dbResult.supabase.error = error.message;
    }

    const totalLatency = Date.now() - startTime;

    // Determine overall health status
    let status: "healthy" | "degraded" | "down";
    let ok: boolean;

    if (!dbResult.supabase.connected) {
      status = "down";
      ok = false;
    } else if (!dbResult.supabase.connected) {
      status = "degraded";
      ok = true; // One connection working
    } else if (dbResult.supabase.latencyMs > 5000) {
      status = "degraded";
      ok = true;
    } else {
      status = "healthy";
      ok = true;
    }

    const healthResult: HealthCheckResult = {
      ok,
      status,
      timestamp: new Date().toISOString(),
      latencyMs: totalLatency,
      database: dbResult,
    };

    // Add debug info if requested
    if (debug) {
      healthResult.debug = {
        environment: process.env.NODE_ENV || "unknown",
        databaseUrl: process.env.DATABASE_URL
          ? `${process.env.DATABASE_URL.split("@")[1] || "masked"}`
          : "not_set",
        supabaseUrl: process.env.SUPABASE_URL || "not_set",
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
      };
    }

    return createResponse(200, healthResult);
  } catch (error: any) {
    console.error("Health check failed:", error);

    const errorResult: HealthCheckResult = {
      ok: false,
      status: "down",
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      database: {
        supabase: {
          connected: false,
          latencyMs: 0,
          rlsEnabled: false,
          userCount: 0,
          error: error.message,
        },
      },
    };

    if (debug) {
      errorResult.debug = {
        environment: process.env.NODE_ENV || "unknown",
        databaseUrl: "error_retrieving",
        supabaseUrl: process.env.SUPABASE_URL || "not_set",
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
      };
    }

    return createResponse(200, errorResult);
  }
};
