import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { listCatalogItems } from "@/db/repositories/catalog";
import type { CatalogFilter, CatalogItem } from "@/types/catalog";

export function useCatalogItems(search: string, filter: CatalogFilter) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    void listCatalogItems(search, filter)
      .then((result) => {
        if (active) setItems(result);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt, filter, search]);
  useFocusEffect(load);
  const refresh = useCallback(() => setAttempt((value) => value + 1), []);
  return { items, loading, error, refresh };
}
