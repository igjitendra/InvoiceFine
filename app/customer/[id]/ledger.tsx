import { useLocalSearchParams } from "expo-router";
import { CustomerLedgerScreen } from "@/components/payments/CustomerLedgerScreen";
export default function Route() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  return <CustomerLedgerScreen customerId={typeof id === "string" ? id : ""} />;
}
