import { HandlerResponse } from "@netlify/functions";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Will be more restrictive in production
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

export const handleCors = (event: any): HandlerResponse | null => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }
  return null;
};

export const createResponse = (
  statusCode: number,
  body: any,
  additionalHeaders: Record<string, string> = {}
): HandlerResponse => ({
  statusCode,
  headers: { ...corsHeaders, ...additionalHeaders },
  body: typeof body === "string" ? body : JSON.stringify(body),
});

export const createErrorResponse = (
  statusCode: number,
  message: string
): HandlerResponse => createResponse(statusCode, { error: message });
