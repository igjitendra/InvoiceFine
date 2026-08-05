import { useEffect, useState } from "react";
import { getBusinessType } from "@/db/repositories/onboarding-settings";
import type { BusinessType } from "@/types/onboarding";
export function useBusinessType() {
  const [type, setType] = useState<BusinessType>("both");
  useEffect(() => {
    let active = true;
    void getBusinessType().then((value) => {
      if (active) setType(value);
    });
    return () => {
      active = false;
    };
  }, []);
  return type;
}
