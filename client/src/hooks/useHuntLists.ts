import { useCallback, useEffect, useState } from "react";
import { HuntListDetail, HuntListSummary } from "../types";
import { apiService } from "../utils/apiService";
import { logger } from "../utils/logger";

export function useHuntLists() {
  const [lists, setLists] = useState<HuntListSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.huntLists.getAll();
      setLists(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch((err) => logger.warn("Failed to load hunt lists", err));
  }, [refresh]);

  const createList = useCallback(async (name: string) => {
    const created = await apiService.huntLists.create(name);
    setLists((prev) => [created, ...prev]);
    return created;
  }, []);

  const renameList = useCallback(async (id: string, name: string) => {
    const updated = await apiService.huntLists.rename(id, name);
    setLists((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const deleteList = useCallback(async (id: string) => {
    await apiService.huntLists.remove(id);
    setLists((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getListDetail = useCallback(async (id: string): Promise<HuntListDetail> => {
    return apiService.huntLists.getSeries(id);
  }, []);

  const addSeriesToList = useCallback(
    async (
      listId: string,
      item: { publisher: string; series: string; volume?: string }
    ): Promise<HuntListDetail> => {
      const detail = await apiService.huntLists.addSeries(listId, item);
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
