/**
 * Sends errors, console noise, and optional heartbeats to POST /api/debug/client-log
 * when the server sets ENABLE_CLIENT_LOG_INGEST and this client is opted in.
 *
 * Opt-in: VITE_ENABLE_CLIENT_LOG=true in repo-root .env (Vite envDir) or client/.env*, then rebuild;
 *   or in the browser: localStorage.setItem("comictracker_remote_log", "1"); location.reload();
 */

const STORAGE_KEY = "comictracker_remote_log";
const CRITICAL_BACKUP_KEY = "comictracker_remote_log_critical";
const MAX_QUEUE = 200;
/** Low-priority lines (log/info/heartbeat) batch this long. Errors flush immediately. */
const FLUSH_VERBOSE_MS = 25_000;
const HEARTBEAT_MS = 60_000;
const MAX_BACKUP = 120;

const queue: unknown[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let started = false;

function isEnabled(): boolean {
  try {
    if (localStorage.getItem(STORAGE_KEY) === "1") return true;
  } catch {
    /* private mode */
  }
  return import.meta.env.VITE_ENABLE_CLIENT_LOG === "true";
}

function loadCriticalBackup(): unknown[] {
  try {
    const raw = sessionStorage.getItem(CRITICAL_BACKUP_KEY);
    if (!raw) return [];
    const a = JSON.parse(raw);
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

function saveCriticalBackup(items: unknown[]): void {
  try {
    sessionStorage.setItem(CRITICAL_BACKUP_KEY, JSON.stringify(items.slice(-MAX_BACKUP)));
  } catch {
    /* quota / private */
  }
}

function appendCriticalBackup(entry: unknown): void {
  const cur = loadCriticalBackup();
  cur.push(entry);
  saveCriticalBackup(cur);
}

function removeSentFromBackup(sent: unknown[]): void {
  if (sent.length === 0) return;
  const sig = new Set(sent.map((e) => JSON.stringify(e)));
  const cur = loadCriticalBackup().filter((e) => !sig.has(JSON.stringify(e)));
  saveCriticalBackup(cur);
}

function scheduleVerboseFlush(): void {
  if (flushTimer != null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushNow();
  }, FLUSH_VERBOSE_MS);
}

/** Console noise and heartbeats — batched (see FLUSH_VERBOSE_MS). */
function pushVerbose(entry: unknown): void {
  queue.push(entry);
  if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
  scheduleVerboseFlush();
}

/** Errors and warnings — sent ASAP + mirrored to sessionStorage until the server ACKs. */
function pushCritical(entry: unknown): void {
  queue.push(entry);
  if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
  appendCriticalBackup(entry);
  void flushNow();
}

async function flushNow(): Promise<void> {
  if (queue.length === 0) return;
  const entries = queue.splice(0, 50);
  try {
    const res = await fetch("/api/debug/client-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
      keepalive: true,
    });
    if (res.ok) {
      removeSentFromBackup(entries);
    } else if (queue.length < MAX_QUEUE) {
      queue.unshift(...entries);
    }
  } catch {
    if (queue.length < MAX_QUEUE) queue.unshift(...entries);
  }
}

function flushBeacon(): void {
  if (queue.length === 0) return;
  const entries = queue.splice(0, 50);
  try {
    const ok = navigator.sendBeacon(
      "/api/debug/client-log",
      new Blob([JSON.stringify({ entries })], { type: "application/json" })
    );
    if (ok) {
      removeSentFromBackup(entries);
    } else if (queue.length < MAX_QUEUE) {
      queue.unshift(...entries);
    }
  } catch {
    if (queue.length < MAX_QUEUE) queue.unshift(...entries);
  }
}

/** Drain as much as possible on tab close (mobile kills the tab aggressively). */
function flushBeaconDrain(): void {
  let n = 0;
  while (queue.length > 0 && n < 12) {
    flushBeacon();
    n += 1;
  }
}

function heapSnapshot(): Record<string, number> | undefined {
  const m = (performance as unknown as { memory?: Record<string, number> }).memory;
  if (!m) return undefined;
  return {
    usedJSHeapSize: m.usedJSHeapSize,
    totalJSHeapSize: m.totalJSHeapSize,
    jsHeapSizeLimit: m.jsHeapSizeLimit,
  };
}

function wrapConsole(): void {
  const levels = ["log", "info", "warn", "error"] as const;
  const c = console as unknown as Record<
    (typeof levels)[number],
    (...args: unknown[]) => void
  >;
  for (const level of levels) {
    const orig = c[level].bind(console);
    c[level] = (...args: unknown[]) => {
      orig(...args);
      try {
        const entry = {
          t: new Date().toISOString(),
          type: `console.${level}`,
          args: args.map((a) =>
            a instanceof Error ? a.stack || a.message : typeof a === "string" ? a : String(a)
          ),
        };
        if (level === "warn" || level === "error") {
          pushCritical(entry);
        } else {
          pushVerbose(entry);
        }
      } catch {
        /* ignore */
      }
    };
  }
}

export function initRemoteDebugLogging(): void {
  if (started) return;
  if (!isEnabled()) return;
  started = true;

  const bootstrap = loadCriticalBackup();
  for (const e of bootstrap) {
    queue.push(e);
    if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
  }
  if (bootstrap.length > 0) void flushNow();

  wrapConsole();

  window.addEventListener("error", (ev) => {
    pushCritical({
      t: new Date().toISOString(),
      type: "window.error",
      message: ev.message,
      filename: ev.filename,
      lineno: ev.lineno,
      colno: ev.colno,
      stack: ev.error instanceof Error ? ev.error.stack : undefined,
    });
  });

  window.addEventListener("unhandledrejection", (ev) => {
    const reason = ev.reason;
    pushCritical({
      t: new Date().toISOString(),
      type: "unhandledrejection",
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });

  document.addEventListener("visibilitychange", () => {
    pushVerbose({
      t: new Date().toISOString(),
      type: "visibility",
      state: document.visibilityState,
    });
    if (document.visibilityState === "hidden") void flushNow();
  });

  window.setInterval(() => {
    pushVerbose({
      t: new Date().toISOString(),
      type: "heartbeat",
      href: window.location.href,
      memory: heapSnapshot(),
    });
  }, HEARTBEAT_MS);

  window.addEventListener("pagehide", flushBeaconDrain);
  window.addEventListener("beforeunload", flushBeaconDrain);

  console.info(
    "[comictracker] Remote debug log enabled → POST /api/debug/client-log (see .env.example)"
  );
}
