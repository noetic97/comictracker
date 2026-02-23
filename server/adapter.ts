/**
 * Adapts Netlify-style handler(event) => Promise<{ statusCode, headers, body }>
 * to Express (req, res).
 */

import { Request, Response } from "express";

export type HandlerResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

export type NetlifyHandler = (event: any) => Promise<HandlerResponse>;

function toEvent(req: Request): any {
  return {
    httpMethod: req.method,
    path: req.originalUrl?.split("?")[0] || req.path,
    queryStringParameters: req.query || {},
    body: req.body !== undefined && req.body !== null ? JSON.stringify(req.body) : undefined,
    headers: req.headers as Record<string, string>,
  };
}

export function createRequestHandler(handler: NetlifyHandler) {
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
