// Supabase Edge Function: heartbeat
// Purpose: lightweight health probe that keeps the project warm and verifies DB reachability.
// Notes:
// - Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY provided by Supabase.
// - Prefers an RPC endpoint `public.heartbeat()` (POST /rest/v1/rpc/heartbeat).
// - Falls back to a minimal table query if RPC is missing.
// - Always returns 200; callers should interpret `ok`.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface HeartbeatResponse {
  ok: boolean;
  timestamp: string;
  latencyMs: number;
  database: {
    connected: boolean;
    latencyMs: number;
    method: "rpc" | "table";
    error?: string;
  };
  source: "supabase-edge";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const t0 = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    const resp: HeartbeatResponse = {
      ok: false,
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - t0,
      database: {
        connected: false,
        latencyMs: 0,
        method: "rpc",
        error: "Missing SUPABASE_URL or SERVICE_ROLE_KEY",
      },
      source: "supabase-edge",
    };
    return new Response(JSON.stringify(resp, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  // Helper to call RPC heartbeat
  const callRpc = async () => {
    const start = Date.now();
    const r = await fetch(`${supabaseUrl}/rest/v1/rpc/heartbeat`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    const latency = Date.now() - start;
    if (!r.ok)
      throw new Error(`RPC heartbeat failed: ${r.status} ${r.statusText}`);
    return { latency };
  };

  // Fallback to tiny table query if RPC not present
  const callTable = async () => {
    const start = Date.now();
    const r = await fetch(`${supabaseUrl}/rest/v1/comics?select=id&limit=1`, {
      method: "GET",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    const latency = Date.now() - start;
    if (!r.ok)
      throw new Error(`Table probe failed: ${r.status} ${r.statusText}`);
    return { latency };
  };

  let ok = false;
  let method: "rpc" | "table" = "rpc";
  let dbLatency = 0;
  let error: string | undefined;

  try {
    try {
      const { latency } = await callRpc();
      ok = true;
      dbLatency = latency;
      method = "rpc";
    } catch (e) {
      // Try fallback only if RPC missing/blocked
      const { latency } = await callTable();
      ok = true;
      dbLatency = latency;
      method = "table";
    }
  } catch (e) {
    ok = false;
    error = (e as Error).message;
  }

  const resp: HeartbeatResponse = {
    ok,
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - t0,
    database: {
      connected: ok,
      latencyMs: dbLatency,
      method,
      ...(error ? { error } : {}),
    },
    source: "supabase-edge",
  };

  return new Response(JSON.stringify(resp, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
