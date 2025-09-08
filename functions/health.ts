import { Handler } from "@netlify/functions";
import { withPrisma } from "./utils/prisma";
import { handleCors, createResponse } from "./utils/cors";

interface HealthCheckResult {
  ok: boolean;
  status: "healthy" | "degraded" | "down";
  timestamp: string;
  latencyMs: number;
  database: {
    connected: boolean;
    latencyMs: number;
    error?: string;
  };
  debug?: {
    environment: string;
    databaseUrl: string; // Masked for security
    prismaVersion: string;
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
    // Database health check
    const dbStartTime = Date.now();
    let dbResult = {
      connected: false,
      latencyMs: 0,
      error: undefined as string | undefined,
    };

    try {
      await withPrisma(async (prisma) => {
        // Simple ping - SELECT 1
        const result = await prisma.$queryRaw`SELECT 1 as ping`;
        dbResult.connected = true;
        dbResult.latencyMs = Date.now() - dbStartTime;

        // Additional health checks in debug mode
        if (debug) {
          // Check if we can actually query comics table
          await prisma.comic.count();
        }
      });
    } catch (error: any) {
      dbResult.connected = false;
      dbResult.latencyMs = Date.now() - dbStartTime;
      dbResult.error = error.message;
    }

    const totalLatency = Date.now() - startTime;

    // Determine overall health status
    let status: "healthy" | "degraded" | "down";
    let ok: boolean;

    if (!dbResult.connected) {
      status = "down";
      ok = false;
    } else if (dbResult.latencyMs > 5000) {
      // >5s is degraded
      status = "degraded";
      ok = true; // Still OK, just slow
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
        prismaVersion: "5.17.0", // From your package.json
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
      };
    }

    // Return appropriate status code
    if (ok) {
      return createResponse(200, healthResult);
    } else {
      // Still return 200 for health checks, but indicate down status
      // External monitors will check the 'ok' field in response
      return createResponse(200, healthResult);
    }
  } catch (error: any) {
    console.error("Health check failed:", error);

    const errorResult: HealthCheckResult = {
      ok: false,
      status: "down",
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      database: {
        connected: false,
        latencyMs: 0,
        error: error.message,
      },
    };

    if (debug) {
      errorResult.debug = {
        environment: process.env.NODE_ENV || "unknown",
        databaseUrl: "error_retrieving",
        prismaVersion: "5.17.0",
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
      };
    }

    // Return 200 with error details for monitoring systems
    return createResponse(200, errorResult);
  }
};
