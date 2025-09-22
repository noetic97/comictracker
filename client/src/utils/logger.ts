type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

// Get initial log level
const getInitialLogLevel = (): LogLevel => {
  const envLevel = import.meta.env.VITE_LOG_LEVEL as LogLevel;
  const debugMode =
    import.meta.env.DEV || localStorage.getItem("debug") === "true";

  return envLevel || (debugMode ? "debug" : "info");
};

// Current log level (mutable for runtime changes)
let currentLogLevel: LogLevel = getInitialLogLevel();

// Core logging functions
const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
};

const setLogLevel = (level: LogLevel): void => {
  currentLogLevel = level;
};

// Base logging functions
const debug = (message: string, ...args: any[]): void => {
  if (shouldLog("debug")) {
    console.log(`🔍 ${message}`, ...args);
  }
};

const info = (message: string, ...args: any[]): void => {
  if (shouldLog("info")) {
    console.info(`ℹ️ ${message}`, ...args);
  }
};

const warn = (message: string, ...args: any[]): void => {
  if (shouldLog("warn")) {
    console.warn(`⚠️ ${message}`, ...args);
  }
};

const error = (message: string, ...args: any[]): void => {
  if (shouldLog("error")) {
    console.error(`❌ ${message}`, ...args);
  }
};

// Factory function for creating contextual loggers
const createContextualLogger = (context: string) => ({
  debug: (message: string, ...args: any[]) =>
    debug(`[${context}] ${message}`, ...args),
  info: (message: string, ...args: any[]) =>
    info(`[${context}] ${message}`, ...args),
  warn: (message: string, ...args: any[]) =>
    warn(`[${context}] ${message}`, ...args),
  error: (message: string, ...args: any[]) =>
    error(`[${context}] ${message}`, ...args),
});

// Main logger object
export const logger = {
  debug,
  info,
  warn,
  error,
  setLevel: setLogLevel,
  stats: createContextualLogger("Stats"),
  comics: createContextualLogger("Comics"),
  import: createContextualLogger("Import"),
  api: createContextualLogger("API"),
};

// Helper function to enable debug mode at runtime
export const enableDebugMode = () => {
  localStorage.setItem("debug", "true");
  logger.setLevel("debug");
  logger.info("Debug mode enabled. Refresh page for full effect.");
};

// Helper function to disable debug mode
export const disableDebugMode = () => {
  localStorage.removeItem("debug");
  logger.setLevel("info");
  logger.info("Debug mode disabled.");
};

// Make helpers available globally for easy console access
if (typeof window !== "undefined") {
  (window as any).enableDebugMode = enableDebugMode;
  (window as any).disableDebugMode = disableDebugMode;
}
