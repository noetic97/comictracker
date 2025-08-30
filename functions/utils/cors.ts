import { HandlerResponse } from "@netlify/functions";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Will be more restrictive in production
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
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
  body: unknown,
  additionalHeaders: Record<string, string> = {}
): HandlerResponse => {
  // 204 must not have a body
  if (statusCode === 204) {
    return {
      statusCode,
      headers: { ...corsHeaders, ...additionalHeaders },
      body: "",
    };
  }

  const isString = typeof body === "string";
  const payload = isString ? (body as string) : JSON.stringify(body);

  return {
    statusCode,
    headers: {
      ...corsHeaders,
      "Content-Type": isString
        ? "text/plain; charset=utf-8"
        : "application/json; charset=utf-8",
      ...additionalHeaders,
    },
    body: payload,
  };
};

export const createErrorResponse = (
  statusCode: number,
  message: string
): HandlerResponse => createResponse(statusCode, { error: message });
