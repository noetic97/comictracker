import { handleCors, createResponse, HandlerResponse } from "./utils/cors";
import { getPrisma } from "./utils/db";

interface HealthCheckResult {
  ok: boolean;
  status: "healthy" | "degraded" | "down";
  timestamp: string;
  latencyMs: number;
  database: {
    connected: boolean;
    latencyMs: number;
    userCount: number;
    error?: string;
  };
  debug?: {
    environment: string;
    databaseUrl: string;
    nodeVersion: string;
    memoryUsage: NodeJS.MemoryUsage;
  };
}

export const handler = async (event: any): Promise<HandlerResponse> => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  const startTime = Date.now();
  const debug = event.queryStringParameters?.debug === "true";

  const dbResult = {
    connected: false,
    latencyMs: 0,
    userCount: 0,
    error: undefined as string | undefined,
  };

  try {
    const dbStart = Date.now();
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();
    dbResult.connected = true;
    dbResult.latencyMs = Date.now() - dbStart;
    dbResult.userCount = userCount;
  } catch (error: any) {
    dbResult.error = error?.message ?? "Unknown error";
  }

  const totalLatency = Date.now() - startTime;
  const status: "healthy" | "degraded" | "down" = !dbResult.connected
    ? "down"
    : dbResult.latencyMs > 5000
      ? "degraded"
      : "healthy";
  const ok = dbResult.connected;

  const healthResult: HealthCheckResult = {
    ok,
    status,
    timestamp: new Date().toISOString(),
    latencyMs: totalLatency,
    database: dbResult,
  };

  if (debug) {
    healthResult.debug = {
      environment: process.env.NODE_ENV || "unknown",
      databaseUrl: process.env.DATABASE_URL
        ? (process.env.DATABASE_URL.startsWith("file:")
          ? "file:***"
          : "***")
        : "not_set",
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
    };
  }

  return createResponse(200, healthResult);
}
