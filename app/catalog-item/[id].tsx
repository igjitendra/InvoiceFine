import { useLocalSearchParams } from "expo-router";
import { CatalogDetailScreen } from "@/components/catalog/CatalogDetailScreen";
export default function CatalogItemDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  return <CatalogDetailScreen id={typeof id === "string" ? id : ""} />;
}
