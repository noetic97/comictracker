import { useState, useCallback, useEffect } from "react";
import {
  getHiddenPublishers,
  setHiddenPublishers,
  getShowHiddenPublishers,
  setShowHiddenPublishers as setShowHiddenPublishersStorage,
  clearHiddenPublishersLocalStorage,
} from "../utils/hiddenPublishers";
import { apiService } from "../utils/apiService";
import { logger } from "../utils/logger";

async function persistToApi(
  hidden: string[],
  showHidden: boolean
): Promise<void> {
  await apiService.hiddenPublishers.put({ hidden, showHidden });
}

export function useHiddenPublishers() {
  const [hiddenList, setHiddenList] = useState<string[]>(() =>
    getHiddenPublishers()
  );
  const [showHidden, setShowHiddenState] = useState(() =>
    getShowHiddenPublishers()
  );
  const [hydrated, setHydrated] = useState(false);

  const hiddenSet = new Set(hiddenList);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const remote = await apiService.hiddenPublishers.get();
        if (cancelled) return;

        const localHidden = getHiddenPublishers();
        const localShow = getShowHiddenPublishers();

        if (remote.hidden.length === 0 && localHidden.length > 0) {
          try {
            const merged = await apiService.hiddenPublishers.put({
              hidden: localHidden,
              showHidden: localShow,
            });
            if (cancelled) return;
            setHiddenList(merged.hidden);
            setShowHiddenState(merged.showHidden);
            clearHiddenPublishersLocalStorage();
          } catch (e) {
            logger.warn("Hidden publishers migrate-to-API failed", e);
            setHiddenList(localHidden);
            setShowHiddenState(localShow);
          }
        } else {
          setHiddenList(remote.hidden);
          setShowHiddenState(remote.showHidden);
          if (remote.hidden.length > 0 || remote.showHidden) {
            clearHiddenPublishersLocalStorage();
          }
        }
      } catch (e) {
        logger.warn("Hidden publishers API unavailable; using localStorage", e);
        if (!cancelled) {
          setHiddenList(getHiddenPublishers());
          setShowHiddenState(getShowHiddenPublishers());
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const hidePublisher = useCallback(
    async (name: string) => {
      if (hiddenList.includes(name)) return;
      const next = [...hiddenList, name];
      setHiddenList(next);
      try {
        await persistToApi(next, showHidden);
        clearHiddenPublishersLocalStorage();
      } catch (e) {
        logger.warn("hidePublisher API sync failed; using localStorage", e);
        setHiddenPublishers(next);
      }
    },
    [hiddenList, showHidden]
  );

  const unhidePublisher = useCallback(
    async (name: string) => {
      if (!hiddenList.includes(name)) return;
      const next = hiddenList.filter((p) => p !== name);
      setHiddenList(next);
      try {
        await persistToApi(next, showHidden);
        clearHiddenPublishersLocalStorage();
      } catch (e) {
        logger.warn("unhidePublisher API sync failed; using localStorage", e);
        setHiddenPublishers(next);
      }
    },
    [hiddenList, showHidden]
  );

  const setShowHidden = useCallback(
    async (show: boolean) => {
      if (show === showHidden) return;
      setShowHiddenState(show);
      try {
        await persistToApi(hiddenList, show);
        clearHiddenPublishersLocalStorage();
      } catch (e) {
        logger.warn("setShowHidden API sync failed; using localStorage", e);
        setShowHiddenPublishersStorage(show);
      }
    },
    [hiddenList, showHidden]
  );

  const refresh = useCallback(async () => {
    try {
      const remote = await apiService.hiddenPublishers.get();
      setHiddenList(remote.hidden);
      setShowHiddenState(remote.showHidden);
    } catch (e) {
      logger.warn("refresh hidden publishers failed", e);
    }
  }, []);

  return {
    hiddenSet,
    hiddenList,
    showHidden,
    setShowHidden,
    hidePublisher,
    unhidePublisher,
    hydrated,
    refresh,
  };
}
