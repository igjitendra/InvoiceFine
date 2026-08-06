import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "@/db/database";
import { templateForCategory } from "@/lib/business-template-engine";
import {
  createEmptyVerticalDetails,
  verticalDetailKeys,
  type VerticalInvoiceDetails,
  type VerticalWorkflow,
} from "@/types/vertical-workflow";
const workflows: VerticalWorkflow[] = [
  "repair",
  "agency",
  "freelancer",
  "salon",
  "plumber",
  "ac_service",
  "general",
];
function isWorkflow(v: unknown): v is VerticalWorkflow {
  return typeof v === "string" && workflows.includes(v as VerticalWorkflow);
}
export function workflowForCategory(category: string): VerticalWorkflow {
  const template = templateForCategory(category);
  if (template) return template.workflow;
  const x = category.toLowerCase();
  if (x.includes("repair")) return "repair";
  if (x.includes("agency") || x.includes("digital")) return "agency";
  if (x.includes("freelance")) return "freelancer";
  if (x.includes("salon") || x.includes("beauty")) return "salon";
  if (x.includes("plumb")) return "plumber";
  if (x.includes("ac service")) return "ac_service";
  return "general";
}
export async function getCurrentWorkflow(): Promise<VerticalWorkflow> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ business_category: string }>(
    "SELECT business_category FROM business_settings LIMIT 1",
  );
  return workflowForCategory(row?.business_category ?? "");
}
export function parseVerticalDetails(
  value: string | null,
): VerticalInvoiceDetails | null {
  if (!value) return null;
  try {
    const raw: unknown = JSON.parse(value);
    if (!raw || typeof raw !== "object") return null;
    const record: Record<string, unknown> = Object.fromEntries(
      Object.entries(raw),
    );
    if (!isWorkflow(record.workflow)) return null;
    const result = createEmptyVerticalDetails(record.workflow);
    for (const key of verticalDetailKeys) {
      const item = record[key];
      if (typeof item === "string") result[key] = item;
    }
    return result;
  } catch {
    return null;
  }
}
export async function saveVerticalDetails(
  transaction: SQLiteDatabase,
  invoiceId: string,
  details: VerticalInvoiceDetails,
) {
  const now = new Date().toISOString();
  await transaction.runAsync(
    `INSERT INTO invoice_vertical_details(invoice_id,workflow,details_json,created_at,updated_at)VALUES(?,?,?,?,?) ON CONFLICT(invoice_id)DO UPDATE SET workflow=excluded.workflow,details_json=excluded.details_json,updated_at=excluded.updated_at`,
    invoiceId,
    details.workflow,
    JSON.stringify(details),
    now,
    now,
  );
}
export async function deleteVerticalDetails(
  transaction: SQLiteDatabase,
  invoiceId: string,
) {
  await transaction.runAsync(
    "DELETE FROM invoice_vertical_details WHERE invoice_id=?",
    invoiceId,
  );
}
export async function loadVerticalDetails(
  invoiceId: string,
): Promise<VerticalInvoiceDetails | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ details_json: string }>(
    "SELECT details_json FROM invoice_vertical_details WHERE invoice_id=?",
    invoiceId,
  );
  return parseVerticalDetails(row?.details_json ?? null);
}
