import { useState, useCallback, useEffect } from "react";
import {
  getHiddenSeries,
  setHiddenSeries,
  getShowHiddenSeries,
  setShowHiddenSeries as setShowHiddenSeriesStorage,
  clearHiddenSeriesLocalStorage,
} from "../utils/hiddenSeries";
import { apiService } from "../utils/apiService";
import { logger } from "../utils/logger";

async function persistToApi(hidden: string[], showHidden: boolean): Promise<void> {
  await apiService.hiddenSeries.put({ hidden, showHidden });
}

export function useHiddenSeries() {
  const [hiddenList, setHiddenList] = useState<string[]>(() => getHiddenSeries());
  const [showHidden, setShowHiddenState] = useState(() => getShowHiddenSeries());
  const [hydrated, setHydrated] = useState(false);

  const hiddenSet = new Set(hiddenList);

  const refresh = useCallback(async () => {
    try {
      const remote = await apiService.hiddenSeries.get();
      setHiddenList(remote.hidden);
      setShowHiddenState(remote.showHidden);
    } catch (e) {
      logger.warn("refresh hidden series failed", e);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const remote = await apiService.hiddenSeries.get();
        if (cancelled) return;

        const localHidden = getHiddenSeries();
        const localShow = getShowHiddenSeries();

        if (remote.hidden.length === 0 && localHidden.length > 0) {
          try {
            const merged = await apiService.hiddenSeries.put({
              hidden: localHidden,
              showHidden: localShow,
            });
            if (cancelled) return;
            setHiddenList(merged.hidden);
            setShowHiddenState(merged.showHidden);
            clearHiddenSeriesLocalStorage();
          } catch (e) {
            logger.warn("Hidden series migrate-to-API failed", e);
            setHiddenList(localHidden);
            setShowHiddenState(localShow);
          }
        } else {
          setHiddenList(remote.hidden);
          setShowHiddenState(remote.showHidden);
          if (remote.hidden.length > 0 || remote.showHidden) {
            clearHiddenSeriesLocalStorage();
          }
        }
      } catch (e) {
        logger.warn("Hidden series API unavailable; using localStorage", e);
        if (!cancelled) {
          setHiddenList(getHiddenSeries());
          setShowHiddenState(getShowHiddenSeries());
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const hideSeries = useCallback(
    async (storageKey: string) => {
      if (hiddenList.includes(storageKey)) return;
      const next = [...hiddenList, storageKey];
      setHiddenList(next);
      try {
        await persistToApi(next, showHidden);
        clearHiddenSeriesLocalStorage();
      } catch (e) {
        logger.warn("hideSeries API sync failed; using localStorage", e);
        setHiddenSeries(next);
      }
    },
    [hiddenList, showHidden]
  );

  const unhideSeries = useCallback(
    async (storageKey: string) => {
      if (!hiddenList.includes(storageKey)) return;
      const next = hiddenList.filter((k) => k !== storageKey);
      setHiddenList(next);
      try {
        await persistToApi(next, showHidden);
        clearHiddenSeriesLocalStorage();
      } catch (e) {
        logger.warn("unhideSeries API sync failed; using localStorage", e);
        setHiddenSeries(next);
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
        clearHiddenSeriesLocalStorage();
      } catch (e) {
        logger.warn("setShowHidden series API sync failed; using localStorage", e);
        setShowHiddenSeriesStorage(show);
      }
    },
    [hiddenList, showHidden]
  );

  return {
    hiddenSet,
    hiddenList,
    showHidden,
    setShowHidden,
    hideSeries,
    unhideSeries,
    hydrated,
    refresh,
  };
}
