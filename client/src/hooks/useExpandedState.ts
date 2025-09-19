import { useState, useCallback } from "react";
import { PublisherGroupedComics } from "../types";

interface ExpandedStateResult {
  expandedPublishers: string[];
  expandedSeries: string[];
  isAllExpanded: boolean;
  toggleAll: () => void;
  togglePublisher: (publisher: string) => void;
  toggleSeries: (seriesKey: string) => void;
}

export const useExpandedState = (
  groupedComics: PublisherGroupedComics
): ExpandedStateResult => {
  const [expandedPublishers, setExpandedPublishers] = useState<string[]>([]);
  const [expandedSeries, setExpandedSeries] = useState<string[]>([]);
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const toggleAll = useCallback(() => {
    setIsAllExpanded((prev) => {
      const newExpanded = !prev;

      if (newExpanded) {
        // Expand all publishers and series
        const allPublishers = Object.keys(groupedComics);
        const allSeries = allPublishers.flatMap((publisher) =>
          Object.keys(groupedComics[publisher])
        );
        setExpandedPublishers(allPublishers);
        setExpandedSeries(allSeries);
      } else {
        // Collapse all
        setExpandedPublishers([]);
        setExpandedSeries([]);
      }

      return newExpanded;
    });
  }, [groupedComics]);

  const togglePublisher = useCallback(
    (publisher: string) => {
      setExpandedPublishers((prev) => {
        if (prev.includes(publisher)) {
          // If collapsing a publisher, also collapse all its series
          setExpandedSeries((series) =>
            series.filter(
              (s) => !Object.keys(groupedComics[publisher] || {}).includes(s)
            )
          );
          return prev.filter((p) => p !== publisher);
        } else {
          return [...prev, publisher];
        }
      });

      // Update isAllExpanded based on current state
      setIsAllExpanded((prev) => {
        const allPublishers = Object.keys(groupedComics);
        const willBeExpanded = prev
          ? expandedPublishers.includes(publisher)
            ? expandedPublishers.length - 1 === allPublishers.length
            : expandedPublishers.length + 1 === allPublishers.length
          : false;
        return willBeExpanded;
      });
    },
    [groupedComics, expandedPublishers]
  );

  const toggleSeries = useCallback((seriesKey: string) => {
    setExpandedSeries((prev) =>
      prev.includes(seriesKey)
        ? prev.filter((s) => s !== seriesKey)
        : [...prev, seriesKey]
    );
  }, []);

  return {
    expandedPublishers,
    expandedSeries,
    isAllExpanded,
    toggleAll,
    togglePublisher,
    toggleSeries,
  };
};
