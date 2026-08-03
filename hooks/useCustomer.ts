import { useCallback, useEffect, useState } from 'react';

import { getCustomer } from '@/db/repositories/customers';
import type { Customer } from '@/types/customer';

type CustomerState = {
  customer: Customer | null;
  error: boolean;
  loading: boolean;
  retry: () => void;
};

export function useCustomer(id: string): CustomerState {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    void getCustomer(id)
      .then((result) => {
        if (active) {
          setCustomer(result);
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

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { customer, error, loading, retry };
}
