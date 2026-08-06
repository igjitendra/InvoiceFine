import { useCallback, useEffect, useState } from "react";

import { initializeDatabase } from "@/db/database";
import type { DatabaseInitializationStatus } from "@/types/database";

type DatabaseInitializationResult = {
  retry: () => void;
  status: DatabaseInitializationStatus;
};

export function useDatabaseInitialization(): DatabaseInitializationResult {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<DatabaseInitializationStatus>("loading");

  useEffect(() => {
    let isActive = true;
    setStatus("loading");

    void initializeDatabase()
      .then(() => {
        if (isActive) {
          setStatus("ready");
        }
      })
      .catch(() => {
        if (isActive) {
          setStatus("error");
        }
      });

    return () => {
      isActive = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, []);

  return { retry, status };
}
