import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
import type { InvoicePdfData } from "@/types/invoice-pdf";
import { loadInvoicePdfData } from "@/db/repositories/invoice-pdf";
import { createInvoiceHtml } from "./invoice-html";
import { createSafeInvoiceHtml } from "./invoice-safe-html";
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
export function invoicePdfImageFallbacks(
  invoice: InvoicePdfData,
): InvoicePdfData[] {
  const variants = [invoice];
  if (invoice.businessSignatureUri)
    variants.push({ ...invoice, businessSignatureUri: null });
  if (invoice.businessLogoUri || invoice.businessSignatureUri)
    variants.push({
      ...invoice,
      businessLogoUri: null,
      businessSignatureUri: null,
    });
  return variants;
}
async function withImageFallback<T>(
  invoice: InvoicePdfData,
  task: (html: string) => Promise<T>,
): Promise<T> {
  let lastError: Error | null = null;
  for (const variant of invoicePdfImageFallbacks(invoice)) {
    try {
      return await task(createInvoiceHtml(variant));
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("PDF rendering failed");
    }
  }
  try {
    return await task(createSafeInvoiceHtml(invoice));
  } catch (error) {
    const safeError =
      error instanceof Error ? error.message : "Unknown native print error";
    const normalError = lastError?.message ?? "Unknown HTML render error";
    throw new Error(
      `Native PDF error: ${safeError}. First error: ${normalError}`,
    );
  }
}
async function createPdfFile(
  id: string,
): Promise<{ uri: string; name: string }> {
  const invoice = await data(id);
  const file = await withImageFallback(invoice, (invoiceHtml) =>
    Print.printToFileAsync({ html: invoiceHtml, base64: true }),
  );
  const safeNumber = invoice.invoiceNumber.replace(/[^A-Za-z0-9_-]/g, "_");
  const name = `InvoiceFine_${safeNumber}.pdf`;
  if (!file.base64) throw new Error("PDF data was not returned by Expo Print.");
  const sharedFile = new File(Paths.cache, name);
  if (sharedFile.exists) sharedFile.delete();
  sharedFile.create();
  sharedFile.write(file.base64, { encoding: "base64" });
  return { uri: sharedFile.uri, name };
}
export async function printInvoicePdf(id: string): Promise<void> {
  const invoice = await data(id);
  await withImageFallback(invoice, (invoiceHtml) =>
    Print.printAsync({ html: invoiceHtml }),
  );
}
export async function shareInvoicePdf(id: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Sharing unavailable");
  const file = await createPdfFile(id);
  const options = {
    mimeType: "application/pdf",
    dialogTitle: `Share ${file.name}`,
  };
  await Sharing.shareAsync(file.uri, options);
}
