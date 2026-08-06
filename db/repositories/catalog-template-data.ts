import { getDatabase } from "@/db/database";

type Row = { template_id: string; data_json: string };
function parse(value: string): Record<string, string> {
  try {
    const raw: unknown = JSON.parse(value);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    return Object.fromEntries(
      Object.entries(raw).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
  } catch {
    return {};
  }
}
export async function loadCatalogTemplateData(
  itemId: string,
): Promise<{ templateId: string; data: Record<string, string> } | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Row>(
    "SELECT template_id,data_json FROM catalog_item_template_data WHERE item_id=?",
    itemId,
  );
  return row
    ? { templateId: row.template_id, data: parse(row.data_json) }
    : null;
}
export async function saveCatalogTemplateData(
  itemId: string,
  templateId: string,
  data: Record<string, string>,
): Promise<void> {
  const db = await getDatabase(),
    now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO catalog_item_template_data(item_id,template_id,data_json,created_at,updated_at)VALUES(?,?,?,?,?) ON CONFLICT(item_id)DO UPDATE SET template_id=excluded.template_id,data_json=excluded.data_json,updated_at=excluded.updated_at`,
    itemId,
    templateId,
    JSON.stringify(data),
    now,
    now,
  );
}
export async function deleteCatalogTemplateData(itemId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "DELETE FROM catalog_item_template_data WHERE item_id=?",
    itemId,
  );
}
