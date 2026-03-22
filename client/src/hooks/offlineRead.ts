/**
 * True when the browser reports offline or fetch likely failed for network reasons.
 */
export const isLikelyOfflineFetchFailure = (err: unknown): boolean => {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }
  if (err instanceof TypeError) {
    return true;
  }
  const msg = String((err as Error)?.message ?? err ?? "");
  if (/failed to fetch|network error|load failed|net::err/i.test(msg)) {
    return true;
  }
  return false;
};
