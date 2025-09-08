import { withPrisma } from "./utils/prisma";

export default async (_req: Request): Promise<Response> => {
  const started = Date.now();
  try {
    // Minimal DB touch — cheap and fast.
    const result = await withPrisma(async (p) => {
      // Option A: low-cost raw select
      const r = (await p.$queryRaw`SELECT 1 as ok`) as Array<{ ok: number }>;
      return { ok: r?.[0]?.ok === 1 };
    });

    const payload = {
      ok: true,
      db: result.ok ? "up" : "unknown",
      latencyMs: Date.now() - started,
      time: new Date().toISOString(),
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (err: any) {
    const payload = {
      ok: false,
      error: err?.message || "unknown error",
      latencyMs: Date.now() - started,
      time: new Date().toISOString(),
    };
    return new Response(JSON.stringify(payload), {
      status: 503,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
};
