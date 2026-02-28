import { useCallback, useEffect, useState } from "react";
import { apiService } from "../utils/apiService";
import { replaceAllComics } from "../utils/db";
import { logger } from "../utils/logger";

const LAST_SYNC_KEY = "offlineLastSyncAt";

export const useOfflineSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(LAST_SYNC_KEY);
    if (saved) {
      setLastSyncedAt(saved);
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setError(null);

    try {
      logger.comics.info("Starting full offline sync of comics collection");

      const { comics } = await apiService.comics.getAll();

      logger.comics.info("Fetched comics for offline sync", {
        count: comics.length,
      });

      await replaceAllComics(comics);

      const timestamp = new Date().toISOString();
      window.localStorage.setItem(LAST_SYNC_KEY, timestamp);
      setLastSyncedAt(timestamp);

      logger.comics.info("Offline sync completed successfully", {
        syncedAt: timestamp,
      });
    } catch (err: any) {
      const message = err?.message || "Failed to sync collection for offline use";
      logger.comics.error("Offline sync failed", err);
      setError(message);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  return {
    isSyncing,
    error,
    lastSyncedAt,
    syncNow,
  };
};

