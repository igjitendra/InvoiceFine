import { useLocalSearchParams } from "expo-router";
import { InvoiceEntryScreen } from "@/components/invoices/InvoiceEntryScreen";
export default function InvoiceRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  return <InvoiceEntryScreen id={typeof id === "string" ? id : ""} />;
}
