import { Alert } from "react-native";

import { FreePlanLimitError } from "@/db/repositories/monetization";

const descriptions = {
  invoice: "Free plan allows 5 invoices per day.",
  customer: "Free plan allows 5 customers in total.",
  catalog: "Free plan allows 5 products and services in total.",
} as const;

export function showFreePlanLimit(
  error: unknown,
  onUpgrade: () => void,
): boolean {
  if (!(error instanceof FreePlanLimitError)) return false;
  Alert.alert("Free plan limit reached", descriptions[error.kind], [
    { text: "Not now", style: "cancel" },
    { text: "View Pro plans", onPress: onUpgrade },
  ]);
  return true;
}
