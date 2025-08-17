import { useState, useEffect, useCallback } from "react";

export interface PersistenceState<T> {
  data: T | null;
  timestamp: string | null;
  isLoaded: boolean;
}

export const usePersistence = <T = any>(
  dataKey: string,
  timestampKey: string,
  expirationHours: number = 24
) => {
  const [state, setState] = useState<PersistenceState<T>>({
    data: null,
    timestamp: null,
    isLoaded: false,
  });

  // Load persisted data on mount
  useEffect(() => {
    loadPersistedData();
  }, [dataKey, timestampKey, expirationHours]);

  const loadPersistedData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(dataKey);
      const savedTimestamp = localStorage.getItem(timestampKey);

      if (savedData && savedTimestamp) {
        const data = JSON.parse(savedData);
        const timestamp = new Date(savedTimestamp);

        // Check if data is still valid (within expiration period)
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() - expirationHours);

        if (timestamp > expirationTime && data) {
          setState({
            data,
            timestamp: timestamp.toLocaleString(),
            isLoaded: true,
          });

          console.log(
            `📁 Restored ${
              Array.isArray(data) ? data.length : "data"
            } from ${dataKey} at ${timestamp.toLocaleString()}`
          );
          return;
        } else {
          // Data expired, clean it up
          console.log(`🗑️ Removing expired data from ${dataKey}`);
          localStorage.removeItem(dataKey);
          localStorage.removeItem(timestampKey);
        }
      }

      setState({
        data: null,
        timestamp: null,
        isLoaded: true,
      });
    } catch (error) {
      console.error(`Failed to load persisted data from ${dataKey}:`, error);

      // Clean up corrupted data
      localStorage.removeItem(dataKey);
      localStorage.removeItem(timestampKey);

      setState({
        data: null,
        timestamp: null,
        isLoaded: true,
      });
    }
  }, [dataKey, timestampKey, expirationHours]);

  const persistData = useCallback(
    (data: T) => {
      try {
        const timestamp = new Date().toISOString();

        localStorage.setItem(dataKey, JSON.stringify(data));
        localStorage.setItem(timestampKey, timestamp);

        setState({
          data,
          timestamp: new Date(timestamp).toLocaleString(),
          isLoaded: true,
        });

        console.log(
          `💾 Persisted ${
            Array.isArray(data) ? data.length : "data"
          } to ${dataKey}`
        );
      } catch (error) {
        console.error(`Failed to persist data to ${dataKey}:`, error);

        // If localStorage is full or unavailable, continue without persistence
        setState((prev) => ({
          ...prev,
          data,
          timestamp: new Date().toLocaleString(),
        }));
      }
    },
    [dataKey, timestampKey]
  );

  const clearData = useCallback(() => {
    try {
      localStorage.removeItem(dataKey);
      localStorage.removeItem(timestampKey);

      setState({
        data: null,
        timestamp: null,
        isLoaded: true,
      });

      console.log(`🗑️ Cleared persisted data from ${dataKey}`);
    } catch (error) {
      console.error(`Failed to clear persisted data from ${dataKey}:`, error);
    }
  }, [dataKey, timestampKey]);

  const refreshData = useCallback(() => {
    loadPersistedData();
  }, [loadPersistedData]);

  const isExpired = useCallback(() => {
    if (!state.timestamp) return true;

    const timestamp = new Date(state.timestamp);
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() - expirationHours);

    return timestamp <= expirationTime;
  }, [state.timestamp, expirationHours]);

  return {
    // State
    data: state.data,
    timestamp: state.timestamp,
    isLoaded: state.isLoaded,

    // Actions
    persistData,
    clearData,
    refreshData,

    // Computed properties
    hasData: !!state.data,
    isExpired: isExpired(),
    dataCount: Array.isArray(state.data) ? state.data.length : 0,

    // Utilities
    updateData: (updater: (current: T | null) => T) => {
      const updatedData = updater(state.data);
      persistData(updatedData);
    },
  };
};
