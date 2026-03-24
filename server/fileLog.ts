/**
 * Optional append-only file logging for the Node process (tee console) and client ingress.
 */

import fs from "fs";
import path from "path";
import util from "util";
import type { Request, Response } from "express";
import { appendFile, mkdir } from "fs/promises";

let logStream: fs.WriteStream | null = null;

function iso(): string {
  return new Date().toISOString();
}

function formatArg(a: unknown): string {
  if (a instanceof Error) return a.stack || a.message;
  if (typeof a === "string") return a;
  try {
    return util.inspect(a, { depth: 4, maxStringLength: 800, breakLength: 120 });
  } catch {
    return String(a);
  }
}

function formatLine(args: unknown[]): string {
  return args.map(formatArg).join(" ");
}

/**
 * When LOG_FILE is set, append every console.log/info/warn/error line (in addition to normal stdout/stderr).
 * Path is relative to project root if not absolute.
 */
export function setupFileLogging(projectRoot: string): void {
  const raw = process.env.LOG_FILE?.trim();
  if (!raw) return;

  const abs = path.isAbsolute(raw) ? raw : path.join(projectRoot, raw);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  logStream = fs.createWriteStream(abs, { flags: "a" });

  const write = (level: string, line: string) => {
    try {
      logStream?.write(`[${iso()}] [server] [${level}] ${line}\n`);
    } catch {
      // avoid throwing from logger
    }
  };

  const wrap = (
    orig: (...args: unknown[]) => void,
    level: string
  ): ((...args: unknown[]) => void) => {
    return (...args: unknown[]) => {
      orig(...args);
      write(level, formatLine(args));
    };
  };

  console.log = wrap(console.log.bind(console), "log");
  console.info = wrap(console.info.bind(console), "info");
  console.warn = wrap(console.warn.bind(console), "warn");
  console.error = wrap(console.error.bind(console), "error");

  console.log(`[fileLog] Mirroring console to ${abs}`);
}

function resolveClientLogPath(projectRoot: string): string | null {
  const ingest =
    process.env.ENABLE_CLIENT_LOG_INGEST === "true" ||
    process.env.ENABLE_CLIENT_LOG_INGEST === "1";
  if (!ingest) return null;

  const explicit = process.env.CLIENT_LOG_FILE?.trim();
  if (explicit) {
    return path.isAbsolute(explicit) ? explicit : path.join(projectRoot, explicit);
  }
  const shared = process.env.LOG_FILE?.trim();
  if (shared) {
    return path.isAbsolute(shared) ? shared : path.join(projectRoot, shared);
  }
  return path.join(projectRoot, "logs", "client-ingress.log");
}

function sanitizeClientEntry(raw: unknown, maxLen: number): string {
  let s: string;
  try {
    s = typeof raw === "string" ? raw : JSON.stringify(raw);
  } catch {
    s = String(raw);
  }
  if (s.length > maxLen) return `${s.slice(0, maxLen)}…[truncated]`;
  return s;
}

/**
 * POST /api/debug/client-log — body: { entries: unknown[] } (max 80 entries, each serialized ≤ 16kb).
 */
export function createClientLogPostHandler(projectRoot: string) {
  return async (req: Request, res: Response): Promise<void> => {
    const abs = resolveClientLogPath(projectRoot);
    if (!abs) {
      res.status(404).json({ error: "Client log ingest disabled" });
      return;
    }

    const body = req.body as { entries?: unknown[] } | undefined;
    const entries = body?.entries;
    if (!Array.isArray(entries) || entries.length === 0 || entries.length > 80) {
      res.status(400).json({ error: "Expected { entries: [...] } with 1–80 items" });
      return;
    }

    const lines = entries.map((e) => {
      const line = sanitizeClientEntry(e, 16_000);
      return `[${iso()}] [client] ${line}\n`;
    });
    const chunk = lines.join("");

    try {
      await mkdir(path.dirname(abs), { recursive: true });
      await appendFile(abs, chunk, "utf8");
    } catch (err) {
      console.error("[fileLog] Failed to append client log:", err);
      res.status(500).json({ error: "Write failed" });
      return;
    }

    res.status(204).end();
  };
}
