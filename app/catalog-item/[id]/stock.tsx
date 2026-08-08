import { useLocalSearchParams } from "expo-router";
import { StockEntryScreen } from "@/components/catalog/StockEntryScreen";

export default function ProductStockRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  return <StockEntryScreen id={typeof id === "string" ? id : ""} />;
}
