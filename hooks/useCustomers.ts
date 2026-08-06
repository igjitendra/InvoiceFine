import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { listCustomers } from "@/db/repositories/customers";
import type { Customer } from "@/types/customer";

type CustomersState = {
  customers: Customer[];
  error: boolean;
  loading: boolean;
  refresh: () => void;
};

export function useCustomers(search: string): CustomersState {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    void listCustomers(search)
      .then((result) => {
        if (active) setCustomers(result);
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
  }, [search, refreshKey]);

  useFocusEffect(load);

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  return { customers, error, loading, refresh };
}
