import { useState, useEffect, useCallback } from "react";
import { getApiBaseUrl } from "../utils";

/**
 * Fetches distinct comic type values from the API (from the user's data).
 * Use when the filter panel is open to populate the Type dropdown.
 */
export function useDistinctTypes(enabled: boolean) {
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTypes = useCallback(async () => {
    if (!enabled) {
      setTypes([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const url = `${getApiBaseUrl()}/comics/types`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch types: ${response.status}`);
      const data: string[] = await response.json();
      setTypes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
      setTypes([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  return { types, loading, error, refetch: fetchTypes };
}
