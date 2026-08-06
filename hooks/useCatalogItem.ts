import { useEffect, useState } from "react";
import { getCatalogItem } from "@/db/repositories/catalog";
import type { CatalogItem } from "@/types/catalog";

export function useCatalogItem(id: string) {
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    void getCatalogItem(id)
      .then((result) => {
        if (active) {
          setItem(result);
          setError(result === null);
        }
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
  }, [attempt, id]);
  return {
    item,
    loading,
    error,
    retry: () => setAttempt((value) => value + 1),
  };
}
