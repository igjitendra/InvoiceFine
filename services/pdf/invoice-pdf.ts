import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { loadInvoicePdfData } from "@/db/repositories/invoice-pdf";
import { createInvoiceHtml } from "./invoice-html";
async function html(id: string) {
  const data = await loadInvoicePdfData(id);
  if (!data) throw new Error("Invoice unavailable");
  return createInvoiceHtml(data);
}
export async function printInvoicePdf(id: string): Promise<void> {
  await Print.printAsync({ html: await html(id) });
}
export async function shareInvoicePdf(id: string): Promise<void> {
  const file = await Print.printToFileAsync({ html: await html(id) });
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Sharing unavailable");
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
  });
}
