import { useState, useCallback, useEffect } from "react";
import {
  getHiddenSeries,
  hideSeries as hideSeriesStorage,
  unhideSeries as unhideSeriesStorage,
  getShowHiddenSeries,
  setShowHiddenSeries as setShowHiddenSeriesStorage,
} from "../utils/hiddenSeries";

export function useHiddenSeries() {
  const [hiddenList, setHiddenList] = useState<string[]>(() => getHiddenSeries());
  const [showHidden, setShowHiddenState] = useState(() => getShowHiddenSeries());

  const hiddenSet = new Set(hiddenList);

  const hideSeries = useCallback((storageKey: string) => {
    hideSeriesStorage(storageKey);
    setHiddenList(getHiddenSeries());
  }, []);

  const unhideSeries = useCallback((storageKey: string) => {
    unhideSeriesStorage(storageKey);
    setHiddenList(getHiddenSeries());
  }, []);

  const setShowHidden = useCallback((show: boolean) => {
    setShowHiddenSeriesStorage(show);
    setShowHiddenState(show);
  }, []);

  useEffect(() => {
    setHiddenList(getHiddenSeries());
    setShowHiddenState(getShowHiddenSeries());
  }, []);

  return {
    hiddenSet,
    hiddenList,
    showHidden,
    setShowHidden,
    hideSeries,
    unhideSeries,
  };
}
