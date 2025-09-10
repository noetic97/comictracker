// Supabase Edge Function
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
    recordCount?: number;
    error?: string;
  };
  supabase: {
    region: string;
    version: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Simple database health check - use a public endpoint or basic query
    const dbStartTime = Date.now();
    let dbResult = {
      connected: false,
      latencyMs: 0,
      recordCount: undefined as number | undefined,
      error: undefined as string | undefined,
    };

    try {
      // Use a simpler approach - just test if we can connect to the database
      // This uses the service role key to bypass RLS
      const response = await fetch(
        `${supabaseUrl}/rest/v1/comics?select=count&limit=1`,
        {
          method: "GET",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        dbResult.connected = true;
        dbResult.latencyMs = Date.now() - dbStartTime;

        // Try to get record count from response
        try {
          const data = await response.json();
          if (Array.isArray(data)) {
            dbResult.recordCount = data.length;
          }
        } catch {
          // Count failed but connection worked
          dbResult.recordCount = -1;
        }
      } else {
        const errorText = await response.text();
        throw new Error(
          `Database query failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
    } catch (error: any) {
      dbResult.connected = false;
      dbResult.latencyMs = Date.now() - dbStartTime;
      dbResult.error = error.message;
    }

    const totalLatency = Date.now() - startTime;

    const heartbeatResponse: HeartbeatResponse = {
      ok: dbResult.connected,
      timestamp: new Date().toISOString(),
      latencyMs: totalLatency,
      database: dbResult,
      supabase: {
        region: Deno.env.get("SUPABASE_REGION") || "unknown",
        version: "1.0.0",
      },
    };

    return new Response(JSON.stringify(heartbeatResponse, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200, // Always return 200, let caller check the 'ok' field
    });
  } catch (error: any) {
    console.error("Heartbeat error:", error);

    const errorResponse: HeartbeatResponse = {
      ok: false,
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      database: {
        connected: false,
        latencyMs: 0,
        error: error.message,
      },
      supabase: {
        region: Deno.env.get("SUPABASE_REGION") || "unknown",
        version: "1.0.0",
      },
    };

    return new Response(JSON.stringify(errorResponse, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200, // Still return 200 with error details
    });
  }
});
