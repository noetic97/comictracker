/**
 * Bridges Express (req, res) to the JSON route handlers in `api/` (event → statusCode + body).
 */

import { Request, Response } from "express";

export type HandlerResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

/** Shape produced from `express.Request` and consumed by modules under `api/`. */
export type ApiRouteEvent = {
  httpMethod: string;
  path: string;
  queryStringParameters: Record<string, unknown>;
  body?: string;
  headers: Record<string, string | string[] | undefined>;
};

export type ApiRouteHandler = (event: ApiRouteEvent) => Promise<HandlerResponse>;

function toEvent(req: Request): ApiRouteEvent {
  return {
    httpMethod: req.method,
    path: req.originalUrl?.split("?")[0] || req.path,
    queryStringParameters: req.query || {},
    body:
      req.body !== undefined && req.body !== null
        ? JSON.stringify(req.body)
        : undefined,
    headers: req.headers as Record<string, string | string[] | undefined>,
  };
}

export function createRequestHandler(handler: ApiRouteHandler) {
  return async (req: Request, res: Response) => {
    try {
      const event = toEvent(req);
      const result = await handler(event);
      res.status(result.statusCode);
      if (result.headers) {
        Object.entries(result.headers).forEach(([k, v]) => res.set(k, v));
      }
      res.send(result.body);
    } catch (err: any) {
      console.error("Request handler error:", err);
      res.status(500).json({ error: err?.message ?? "Internal server error" });
    }
  };
}
