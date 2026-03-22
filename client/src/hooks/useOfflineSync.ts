import { useCallback, useEffect, useState } from "react";
import {
  OFFLINE_LAST_SYNC_KEY,
  syncCollectionToIndexedDB,
} from "../utils/offlineFullSync";
import { logger } from "../utils/logger";

export const useOfflineSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(OFFLINE_LAST_SYNC_KEY);
    if (saved) {
      setLastSyncedAt(saved);
    }
  }, []);

  useEffect(() => {
    const onSynced = (e: Event) => {
      const syncedAt = (e as CustomEvent<{ syncedAt: string }>).detail
        ?.syncedAt;
      if (syncedAt) {
        setLastSyncedAt(syncedAt);
      }
    };
    const onSyncFailed = (e: Event) => {
      const message = (e as CustomEvent<{ message: string }>).detail?.message;
      if (message) {
        setError(message);
      }
    };
    window.addEventListener("comictracker-offline-collection-synced", onSynced);
    window.addEventListener("comictracker-offline-sync-failed", onSyncFailed);
    return () => {
      window.removeEventListener(
        "comictracker-offline-collection-synced",
        onSynced,
      );
      window.removeEventListener(
        "comictracker-offline-sync-failed",
        onSyncFailed,
      );
    };
  }, []);

  const syncNow = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setError(null);

    try {
      await syncCollectionToIndexedDB();
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
