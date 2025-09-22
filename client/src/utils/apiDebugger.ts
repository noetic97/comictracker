import { logger } from "./logger";

export interface ApiCallDebugInfo {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  duration?: number;
  status?: number;
  response?: any;
  error?: any;
}

// State management for API debugger
let calls: ApiCallDebugInfo[] = [];
const maxCalls: number = 50; // Keep last 50 calls
let isEnabled: boolean = false;

// Initialize debugger state
const initializeDebugger = () => {
  isEnabled =
    process.env.NODE_ENV === "development" ||
    localStorage.getItem("apiDebugger") === "enabled";
};

// Initialize on module load
initializeDebugger();

export const apiDebugger = {
  enable() {
    isEnabled = true;
    localStorage.setItem("apiDebugger", "enabled");
    logger.api.info("API Debugger enabled");
  },

  disable() {
    isEnabled = false;
    localStorage.removeItem("apiDebugger");
    logger.api.info("API Debugger disabled");
  },

  logCall(info: Omit<ApiCallDebugInfo, "timestamp">) {
    if (!isEnabled) return;

    const debugInfo: ApiCallDebugInfo = {
      ...info,
      timestamp: Date.now(),
    };

    calls.push(debugInfo);

    // Keep only the most recent calls
    if (calls.length > maxCalls) {
      calls = calls.slice(-maxCalls);
    }

    // Use our logger for debug output (only when logger debug is enabled)
    logger.api.debug(`API Call: ${info.method} ${info.url}`, {
      duration: info.duration ? `${info.duration}ms` : undefined,
      status: info.status,
      hasBody: !!info.body,
      hasResponse: !!info.response,
      hasError: !!info.error,
    });
  },

  getRecentCalls(count: number = 10): ApiCallDebugInfo[] {
    return calls.slice(-count);
  },

  getAllCalls(): ApiCallDebugInfo[] {
    return [...calls];
  },

  getFailedCalls(): ApiCallDebugInfo[] {
    return calls.filter(
      (call) => call.error || (call.status && call.status >= 400)
    );
  },

  clearCalls() {
    calls = [];
    logger.api.info("API Debug calls cleared");
  },

  generateDebugReport(): string {
    const report = [
      "API DEBUG REPORT",
      "=".repeat(50),
      `Generated: ${new Date().toISOString()}`,
      `Total calls: ${calls.length}`,
      `Failed calls: ${apiDebugger.getFailedCalls().length}`,
      "",
      "RECENT CALLS:",
      "-".repeat(30),
    ];

    apiDebugger.getRecentCalls(20).forEach((call, index) => {
      const duration = call.duration ? ` (${call.duration}ms)` : "";
      const status = call.status ? ` [${call.status}]` : "";
      const error = call.error
        ? ` ERROR: ${call.error.message || call.error}`
        : "";

      report.push(
        `${index + 1}. ${call.method} ${call.url}${status}${duration}${error}`
      );

      if (call.body && Object.keys(call.body).length > 0) {
        report.push(
          `   Body: ${JSON.stringify(call.body, null, 2).slice(0, 200)}...`
        );
      }

      if (call.response && Object.keys(call.response).length > 0) {
        report.push(
          `   Response: ${JSON.stringify(call.response, null, 2).slice(
            0,
            200
          )}...`
        );
      }

      report.push("");
    });

    // Add failed calls section if there are any
    const failedCalls = apiDebugger.getFailedCalls();
    if (failedCalls.length > 0) {
      report.push("FAILED CALLS DETAILS:");
      report.push("-".repeat(30));

      failedCalls.forEach((call, index) => {
        report.push(`${index + 1}. ${call.method} ${call.url}`);
        report.push(`   Status: ${call.status || "N/A"}`);
        report.push(
          `   Error: ${call.error?.message || call.error || "Unknown"}`
        );
        report.push(`   Timestamp: ${new Date(call.timestamp).toISOString()}`);
        report.push("");
      });
    }

    return report.join("\n");
  },

  downloadDebugReport() {
    const report = apiDebugger.generateDebugReport();
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `api-debug-report-${
      new Date().toISOString().split("T")[0]
    }.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  },
};

/**
 * Enhanced fetch wrapper with debugging
 */
export const debugFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const startTime = Date.now();
  const method = options.method || "GET";
  const headers = (options.headers as Record<string, string>) || {};

  let body: any = undefined;
  try {
    if (options.body && typeof options.body === "string") {
      body = JSON.parse(options.body);
    } else {
      body = options.body;
    }
  } catch {
    // Body is not JSON, that's okay
  }

  const debugInfo: Omit<ApiCallDebugInfo, "timestamp"> = {
    url,
    method,
    headers,
    body,
  };

  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;

    let responseData: any = undefined;
    try {
      // Try to parse response as JSON for debugging
      const responseText = await response.clone().text();
      if (responseText) {
        responseData = JSON.parse(responseText);
      }
    } catch {
      // Response is not JSON, that's okay
    }

    apiDebugger.logCall({
      ...debugInfo,
      duration,
      status: response.status,
      response: responseData,
    });

    return response;
  } catch (error: any) {
    const duration = Date.now() - startTime;

    apiDebugger.logCall({
      ...debugInfo,
      duration,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    });

    throw error;
  }
};

/**
 * Console helper functions for debugging
 */
(window as any).apiDebugger = {
  enable: () => apiDebugger.enable(),
  disable: () => apiDebugger.disable(),
  getCalls: () => apiDebugger.getAllCalls(),
  getFailedCalls: () => apiDebugger.getFailedCalls(),
  clear: () => apiDebugger.clearCalls(),
  download: () => apiDebugger.downloadDebugReport(),
  report: () => {
    console.log(apiDebugger.generateDebugReport());
  },
};
