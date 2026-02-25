import { useState, useCallback, useEffect } from "react";
import {
  getHiddenPublishers,
  setHiddenPublishers,
  hidePublisher as hidePublisherStorage,
  unhidePublisher as unhidePublisherStorage,
  getShowHiddenPublishers,
  setShowHiddenPublishers as setShowHiddenPublishersStorage,
} from "../utils/hiddenPublishers";

export function useHiddenPublishers() {
  const [hiddenList, setHiddenList] = useState<string[]>(() =>
    getHiddenPublishers()
  );
  const [showHidden, setShowHiddenState] = useState(() =>
    getShowHiddenPublishers()
  );

  const hiddenSet = new Set(hiddenList);

  const hidePublisher = useCallback((name: string) => {
    hidePublisherStorage(name);
    setHiddenList(getHiddenPublishers());
  }, []);

  const unhidePublisher = useCallback((name: string) => {
    unhidePublisherStorage(name);
    setHiddenList(getHiddenPublishers());
  }, []);

  const setShowHidden = useCallback((show: boolean) => {
    setShowHiddenPublishersStorage(show);
    setShowHiddenState(show);
  }, []);

  // Sync from storage in case another tab or future persistence changes it
  useEffect(() => {
    setHiddenList(getHiddenPublishers());
    setShowHiddenState(getShowHiddenPublishers());
  }, []);

  return {
    hiddenSet,
    hiddenList,
    showHidden,
    setShowHidden,
    hidePublisher,
    unhidePublisher,
  };
}
