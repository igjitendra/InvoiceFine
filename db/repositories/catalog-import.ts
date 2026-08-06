import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "@/db/database";
import { runInTransaction } from "@/db/transaction";
import type {
  CatalogDuplicatePolicy,
  CatalogImportRow,
  CatalogImportSummary,
} from "@/types/catalog-csv";
type IdRow = { id: string };
const nullable = (v: string) => v.trim() || null;
const money = (v: string) => Math.round(Number(v || 0) * 100);
const scaled = (v: string) => Math.round(Number(v || 0) * 1000);
const basis = (v: string) => Math.round(Number(v || 0) * 100);
const yes = (v: string) =>
  ["1", "true", "yes", "y"].includes(v.trim().toLowerCase());
async function id(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<IdRow>(
    "SELECT lower(hex(randomblob(16))) id",
  );
  if (!row) throw new Error("ID generation failed");
  return row.id;
}
async function category(db: SQLiteDatabase, name: string, now: string) {
  const value = nullable(name);
  if (!value) return null;
  const old = await db.getFirstAsync<IdRow>(
    "SELECT id FROM categories WHERE kind='item' AND name=? COLLATE NOCASE AND is_archived=0",
    value,
  );
  if (old) return old.id;
  const next = await id(db);
  await db.runAsync(
    "INSERT INTO categories(id,kind,name,is_archived,created_at,updated_at) VALUES(?,'item',?,0,?,?)",
    next,
    value,
    now,
    now,
  );
  return next;
}
async function unit(db: SQLiteDatabase, name: string, now: string) {
  const value = nullable(name);
  if (!value) return null;
  const old = await db.getFirstAsync<IdRow>(
    "SELECT id FROM units WHERE name=? COLLATE NOCASE",
    value,
  );
  if (old) return old.id;
  const next = await id(db);
  await db.runAsync(
    "INSERT INTO units(id,name,short_name,gst_unit_code,created_at,updated_at) VALUES(?,?,?,NULL,?,?)",
    next,
    value,
    value.slice(0, 12).toUpperCase(),
    now,
    now,
  );
  return next;
}
async function duplicate(db: SQLiteDatabase, row: CatalogImportRow) {
  const v = row.values;
  if (v.sku) {
    const found = await db.getFirstAsync<IdRow>(
      "SELECT id FROM items WHERE type=? AND sku=? COLLATE NOCASE AND is_archived=0 LIMIT 1",
      row.type,
      v.sku,
    );
    if (found) return found;
  }
  if (row.type === "product" && v.barcode)
    return db.getFirstAsync<IdRow>(
      "SELECT id FROM items WHERE type='product' AND barcode=? AND is_archived=0 LIMIT 1",
      v.barcode,
    );
  return null;
}
async function professional(
  db: SQLiteDatabase,
  itemId: string,
  row: CatalogImportRow,
  now: string,
) {
  const v = row.values,
    product = row.type === "product",
    model = ["fixed", "hourly", "per_visit", "per_km", "per_day"].includes(
      v.servicePricingModel,
    )
      ? v.servicePricingModel
      : "fixed";
  await db.runAsync(
    `UPDATE items SET hsn_sac_code=?,mrp_paise=?,reorder_level_scaled=?,description=?,service_pricing_model=?,service_duration_minutes=?,appointment_required=?,warranty_days=?,updated_at=? WHERE id=?`,
    nullable(v.hsnSacCode),
    product ? money(v.mrp) : 0,
    product ? scaled(v.reorderLevel) : 0,
    nullable(v.description),
    product ? "fixed" : model,
    product ? 0 : Number(v.serviceDurationMinutes || 0),
    !product && yes(v.appointmentRequired) ? 1 : 0,
    product ? 0 : Number(v.warrantyDays || 0),
    now,
    itemId,
  );
}
export async function importCatalogRows(
  rows: CatalogImportRow[],
  policy: CatalogDuplicatePolicy,
): Promise<CatalogImportSummary> {
  const database = await getDatabase();
  return runInTransaction(database, async (db) => {
    const summary: CatalogImportSummary = {
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: rows.filter((r) => r.errors.length).length,
      pendingClassification: 0,
    };
    for (const row of rows.filter((r) => !r.errors.length)) {
      const v = row.values,
        old = await duplicate(db, row);
      if (old && policy === "skip") {
        summary.skipped++;
        continue;
      }
      const now = new Date().toISOString(),
        categoryId = await category(db, v.category, now),
        unitId = await unit(db, v.unit, now);
      if (old && policy === "update") {
        await db.runAsync(
          `UPDATE items SET name=?,sku=?,barcode=?,category_id=?,brand=?,unit_id=?,purchase_price_paise=?,selling_price_paise=?,gst_rate_basis_points=?,low_stock_threshold_scaled=?,updated_at=? WHERE id=?`,
          v.name.trim(),
          nullable(v.sku),
          row.type === "product" ? nullable(v.barcode) : null,
          categoryId,
          row.type === "product" ? nullable(v.brand) : null,
          unitId,
          row.type === "product" ? money(v.purchasePrice) : 0,
          money(v.sellingPrice),
          basis(v.gstRate),
          row.type === "product" ? scaled(v.lowStockThreshold) : null,
          now,
          old.id,
        );
        await professional(db, old.id, row, now);
        summary.updated++;
      } else {
        const itemId = await id(db),
          stock = row.type === "product" ? scaled(v.openingStock) : 0;
        await db.runAsync(
          `INSERT INTO items(id,type,name,sku,barcode,category_id,brand,unit_id,purchase_price_paise,selling_price_paise,gst_rate_basis_points,current_stock_scaled,low_stock_threshold_scaled,is_archived,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,0,?,?)`,
          itemId,
          row.type,
          v.name.trim(),
          nullable(v.sku),
          row.type === "product" ? nullable(v.barcode) : null,
          categoryId,
          row.type === "product" ? nullable(v.brand) : null,
          unitId,
          row.type === "product" ? money(v.purchasePrice) : 0,
          money(v.sellingPrice),
          basis(v.gstRate),
          stock,
          row.type === "product" ? scaled(v.lowStockThreshold) : null,
          now,
          now,
        );
        await professional(db, itemId, row, now);
        if (stock > 0) {
          const movementId = await id(db);
          await db.runAsync(
            "INSERT INTO stock_movements(id,item_id,type,quantity_delta_scaled,reference_type,reference_id,reason,occurred_at,created_at) VALUES(?,?,'opening',?,'item',?,'CSV opening stock',?,?)",
            movementId,
            itemId,
            stock,
            itemId,
            now,
            now,
          );
        }
        summary.imported++;
      }
      if (row.type === "service" && !v.hsnSacCode)
        summary.pendingClassification++;
    }
    return summary;
  });
}
