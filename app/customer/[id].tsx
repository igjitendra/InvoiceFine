import { useLocalSearchParams } from "expo-router";

import { CustomerDetailScreen } from "@/components/customers/CustomerDetailScreen";

export default function CustomerDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const customerId = typeof id === "string" ? id : "";
  return <CustomerDetailScreen id={customerId} />;
}
