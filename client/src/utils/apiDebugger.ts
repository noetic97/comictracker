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

class ApiDebugger {
  private calls: ApiCallDebugInfo[] = [];
  private maxCalls: number = 50; // Keep last 50 calls
  private isEnabled: boolean = false;

  constructor() {
    // Enable debugging in development or when explicitly enabled
    this.isEnabled =
      process.env.NODE_ENV === "development" ||
      localStorage.getItem("apiDebugger") === "enabled";
  }

  enable() {
    this.isEnabled = true;
    localStorage.setItem("apiDebugger", "enabled");
    console.log("🔍 API Debugger enabled");
  }

  disable() {
    this.isEnabled = false;
    localStorage.removeItem("apiDebugger");
    console.log("🔍 API Debugger disabled");
  }

  logCall(info: Omit<ApiCallDebugInfo, "timestamp">) {
    if (!this.isEnabled) return;

    const debugInfo: ApiCallDebugInfo = {
      ...info,
      timestamp: Date.now(),
    };

    this.calls.push(debugInfo);

    // Keep only the most recent calls
    if (this.calls.length > this.maxCalls) {
      this.calls = this.calls.slice(-this.maxCalls);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.group(`🌐 API Call: ${info.method} ${info.url}`);
      console.log("Headers:", info.headers);
      if (info.body) console.log("Body:", info.body);
      if (info.status) console.log("Status:", info.status);
      if (info.response) console.log("Response:", info.response);
      if (info.error) console.error("Error:", info.error);
      if (info.duration) console.log("Duration:", `${info.duration}ms`);
      console.groupEnd();
    }
  }

  getRecentCalls(count: number = 10): ApiCallDebugInfo[] {
    return this.calls.slice(-count);
  }

  getAllCalls(): ApiCallDebugInfo[] {
    return [...this.calls];
  }

  getFailedCalls(): ApiCallDebugInfo[] {
    return this.calls.filter(
      (call) => call.error || (call.status && call.status >= 400)
    );
  }

  clearCalls() {
    this.calls = [];
    console.log("🔍 API Debug calls cleared");
  }

  generateDebugReport(): string {
    const report = [
      "API DEBUG REPORT",
      "=".repeat(50),
      `Generated: ${new Date().toISOString()}`,
      `Total calls: ${this.calls.length}`,
      `Failed calls: ${this.getFailedCalls().length}`,
      "",
      "RECENT CALLS:",
      "-".repeat(30),
    ];

    this.getRecentCalls(20).forEach((call, index) => {
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
    });

    if (this.getFailedCalls().length > 0) {
      report.push("");
      report.push("FAILED CALLS DETAILS:");
      report.push("-".repeat(30));

      this.getFailedCalls().forEach((call, index) => {
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
  }

  downloadDebugReport() {
    const report = this.generateDebugReport();
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
  }
}

// Global instance
export const apiDebugger = new ApiDebugger();

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
  report: () => console.log(apiDebugger.generateDebugReport()),
  download: () => apiDebugger.downloadDebugReport(),
};
