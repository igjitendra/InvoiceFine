import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import type { InvoicePdfData } from "@/types/invoice-pdf";
import { loadInvoicePdfData } from "@/db/repositories/invoice-pdf";
import { createInvoiceHtml } from "./invoice-html";
function imageMimeType(uri: string): string {
  const clean = uri.toLowerCase().split(/[?#]/)[0] ?? "";
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}
async function embedLocalImage(uri: string | null): Promise<string | null> {
  if (!uri) return null;
  if (uri.startsWith("data:")) return uri;
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:${imageMimeType(uri)};base64,${base64}`;
  } catch {
    return null;
  }
}
async function data(id: string): Promise<InvoicePdfData> {
  const data = await loadInvoicePdfData(id);
  if (!data) throw new Error("Invoice unavailable");
  return {
    ...data,
    businessLogoUri: await embedLocalImage(data.businessLogoUri),
    businessSignatureUri: await embedLocalImage(data.businessSignatureUri),
  };
}
async function html(id: string) {
  return createInvoiceHtml(await data(id));
}
async function createPdfFile(
  id: string,
): Promise<{ uri: string; name: string }> {
  const invoice = await data(id);
  const file = await Print.printToFileAsync({
    html: createInvoiceHtml(invoice),
  });
  const safeNumber = invoice.invoiceNumber.replace(/[^A-Za-z0-9_-]/g, "_");
  const name = `InvoiceFine_${safeNumber}.pdf`;
  if (!FileSystem.cacheDirectory) return { uri: file.uri, name };
  const uri = `${FileSystem.cacheDirectory}${name}`;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
    await FileSystem.copyAsync({ from: file.uri, to: uri });
    return { uri, name };
  } catch {
    return { uri: file.uri, name };
  }
}
export async function printInvoicePdf(id: string): Promise<void> {
  await Print.printAsync({ html: await html(id) });
}
export async function shareInvoicePdf(id: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Sharing unavailable");
  const file = await createPdfFile(id);
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/pdf",
    dialogTitle: `Share ${file.name}`,
  });
}
