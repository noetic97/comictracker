import { useCallback, useEffect, useState } from "react";
import { PullListDetail, PullListSummary } from "../types";
import { apiService } from "../utils/apiService";
import { logger } from "../utils/logger";

export function usePullLists() {
  const [lists, setLists] = useState<PullListSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.pullLists.getAll();
      setLists(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch((err) => logger.warn("Failed to load pull lists", err));
  }, [refresh]);

  const createList = useCallback(async (name: string) => {
    const created = await apiService.pullLists.create(name);
    setLists((prev) => [created, ...prev]);
    return created;
  }, []);

  const renameList = useCallback(async (id: string, name: string) => {
    const updated = await apiService.pullLists.rename(id, name);
    setLists((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const deleteList = useCallback(async (id: string) => {
    await apiService.pullLists.remove(id);
    setLists((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getListDetail = useCallback(async (id: string): Promise<PullListDetail> => {
    return apiService.pullLists.getSeries(id);
  }, []);

  const addSeriesToList = useCallback(
    async (
      listId: string,
      item: { publisher: string; series: string; volume?: string }
    ): Promise<PullListDetail> => {
      const detail = await apiService.pullLists.addSeries(listId, item);
      setLists((prev) =>
        prev.map((p) =>
          p.id === listId ? { ...p, seriesCount: detail.seriesCount, updatedAt: detail.updatedAt } : p
        )
      );
      return detail;
    },
    []
  );

  return {
    lists,
    loading,
    refresh,
    createList,
    renameList,
    deleteList,
    getListDetail,
    addSeriesToList,
  };
}
