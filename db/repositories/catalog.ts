import type { SQLiteDatabase } from "expo-sqlite";

import { getDatabase } from "@/db/database";
import { assertCanCreate } from "@/db/repositories/monetization";
import { runInTransaction } from "@/db/transaction";
import { parseRupeesToPaise } from "@/lib/currency";
import { parseQuantityToScaled } from "@/lib/quantity";
import { parsePercentToBasisPoints } from "@/lib/tax";
import type {
  CatalogFilter,
  CatalogItem,
  CatalogItemInput,
  ServicePricingModel,
} from "@/types/catalog";

type ItemRow = {
  id: string;
  type: "product" | "service";
  name: string;
  sku: string | null;
  barcode: string | null;
  category_name: string | null;
  brand: string | null;
  unit_name: string | null;
  purchase_price_paise: number;
  selling_price_paise: number;
  gst_rate_basis_points: number;
  current_stock_scaled: number;
  low_stock_threshold_scaled: number | null;
  is_archived: number;
  created_at: string;
  updated_at: string;
  short_name: string | null;
  hsn_sac_code: string | null;
  mrp_paise: number;
  wholesale_price_paise: number;
  tax_inclusive: number;
  reorder_level_scaled: number;
  storage_location: string | null;
  supplier: string | null;
  description: string | null;
  image_uri: string | null;
  weight: string | null;
  dimensions: string | null;
  color: string | null;
  size: string | null;
  expiry_date: string | null;
  batch_number: string | null;
  warranty: string | null;
  manufacturer: string | null;
  purchase_account: string | null;
  sales_account: string | null;
  cogs_account: string | null;
  service_pricing_model: ServicePricingModel;
  service_duration_minutes: number;
  assigned_staff: string | null;
  appointment_required: number;
  warranty_days: number;
  checklist_json: string;
  internal_notes: string | null;
  customer_notes: string | null;
};

type IdRow = { id: string };
type LookupRow = { id: string };

function nullable(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function parseChecklist(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

function mapItem(row: ItemRow): CatalogItem {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    sku: row.sku,
    barcode: row.barcode,
    categoryName: row.category_name,
    brand: row.brand,
    unitName: row.unit_name,
    purchasePricePaise: row.purchase_price_paise,
    sellingPricePaise: row.selling_price_paise,
    gstRateBasisPoints: row.gst_rate_basis_points,
    currentStockScaled: row.current_stock_scaled,
    lowStockThresholdScaled: row.low_stock_threshold_scaled ?? 0,
    isArchived: row.is_archived === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    shortName: row.short_name,
    hsnSacCode: row.hsn_sac_code,
    mrpPaise: row.mrp_paise,
    wholesalePricePaise: row.wholesale_price_paise,
    taxInclusive: row.tax_inclusive === 1,
    reorderLevelScaled: row.reorder_level_scaled,
    storageLocation: row.storage_location,
    supplier: row.supplier,
    description: row.description,
    imageUri: row.image_uri,
    weight: row.weight,
    dimensions: row.dimensions,
    color: row.color,
    size: row.size,
    expiryDate: row.expiry_date,
    batchNumber: row.batch_number,
    warranty: row.warranty,
    manufacturer: row.manufacturer,
    purchaseAccount: row.purchase_account,
    salesAccount: row.sales_account,
    cogsAccount: row.cogs_account,
    servicePricingModel: row.service_pricing_model,
    serviceDurationMinutes: row.service_duration_minutes,
    assignedStaff: row.assigned_staff,
    appointmentRequired: row.appointment_required === 1,
    warrantyDays: row.warranty_days,
    checklist: parseChecklist(row.checklist_json),
    internalNotes: row.internal_notes,
    customerNotes: row.customer_notes,
  };
}

async function createUuid(database: SQLiteDatabase): Promise<string> {
  const row = await database.getFirstAsync<IdRow>(`
    SELECT lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
      substr(lower(hex(randomblob(2))), 2) || '-' ||
      substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
      lower(hex(randomblob(6))) AS id
  `);
  if (!row) throw new Error("Unable to generate an ID.");
  return row.id;
}

async function resolveCategory(
  database: SQLiteDatabase,
  name: string,
  timestamp: string,
): Promise<string | null> {
  const normalized = nullable(name);
  if (!normalized) return null;
  const existing = await database.getFirstAsync<LookupRow>(
    `SELECT id FROM categories
     WHERE kind = 'item' AND name = ? COLLATE NOCASE AND is_archived = 0`,
    normalized,
  );
  if (existing) return existing.id;
  const id = await createUuid(database);
  await database.runAsync(
    `INSERT INTO categories (id, kind, name, is_archived, created_at, updated_at)
     VALUES (?, 'item', ?, 0, ?, ?)`,
    id,
    normalized,
    timestamp,
    timestamp,
  );
  return id;
}

async function resolveUnit(
  database: SQLiteDatabase,
  name: string,
  timestamp: string,
): Promise<string | null> {
  const normalized = nullable(name);
  if (!normalized) return null;
  const existing = await database.getFirstAsync<LookupRow>(
    "SELECT id FROM units WHERE name = ? COLLATE NOCASE",
    normalized,
  );
  if (existing) return existing.id;
  const id = await createUuid(database);
  await database.runAsync(
    `INSERT INTO units (id, name, short_name, gst_unit_code, created_at, updated_at)
     VALUES (?, ?, ?, NULL, ?, ?)`,
    id,
    normalized,
    normalized.toUpperCase(),
    timestamp,
    timestamp,
  );
  return id;
}

const selectColumns = `
  SELECT i.id, i.type, i.name, i.sku, i.barcode, c.name AS category_name,
    i.brand, u.name AS unit_name, i.purchase_price_paise, i.selling_price_paise,
    i.gst_rate_basis_points, i.current_stock_scaled, i.low_stock_threshold_scaled,
    i.is_archived, i.created_at, i.updated_at, i.short_name, i.hsn_sac_code,
    i.mrp_paise, i.wholesale_price_paise, i.tax_inclusive,
    i.reorder_level_scaled, i.storage_location, i.supplier, i.description,
    i.image_uri, i.weight, i.dimensions, i.color, i.size, i.expiry_date,
    i.batch_number, i.warranty, i.manufacturer, i.purchase_account,
    i.sales_account, i.cogs_account, i.service_pricing_model,
    i.service_duration_minutes, i.assigned_staff, i.appointment_required,
    i.warranty_days, i.checklist_json, i.internal_notes, i.customer_notes
  FROM items i
  LEFT JOIN categories c ON c.id = i.category_id
  LEFT JOIN units u ON u.id = i.unit_id`;

export async function listCatalogItems(
  search = "",
  filter: CatalogFilter = "all",
): Promise<CatalogItem[]> {
  const database = await getDatabase();
  const normalized = search.trim();
  const escaped = normalized.replace(/[\\%_]/g, "\\$&");
  const pattern = `%${escaped}%`;
  const rows = await database.getAllAsync<ItemRow>(
    `${selectColumns}
     WHERE i.is_archived = 0
       AND (? = 'all' OR i.type = ?)
       AND (? = '' OR i.name LIKE ? ESCAPE '\\' COLLATE NOCASE
         OR i.sku LIKE ? ESCAPE '\\' COLLATE NOCASE
         OR i.barcode LIKE ? ESCAPE '\\' COLLATE NOCASE
         OR i.short_name LIKE ? ESCAPE '\\' COLLATE NOCASE
         OR i.hsn_sac_code LIKE ? ESCAPE '\\' COLLATE NOCASE)
     ORDER BY i.name COLLATE NOCASE ASC`,
    filter,
    filter,
    normalized,
    pattern,
    pattern,
    pattern,
    pattern,
    pattern,
  );
  return rows.map(mapItem);
}

export async function getCatalogItem(id: string): Promise<CatalogItem | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<ItemRow>(
    `${selectColumns} WHERE i.id = ?`,
    id,
  );
  return row ? mapItem(row) : null;
}

function normalizedNumbers(input: CatalogItemInput) {
  const purchase = parseRupeesToPaise(input.purchasePrice);
  const selling = parseRupeesToPaise(input.sellingPrice);
  const threshold = parseQuantityToScaled(input.lowStockThreshold);
  const gst = parsePercentToBasisPoints(input.gstRate);
  const openingStock = parseQuantityToScaled(input.openingStock ?? "0");
  const mrp = parseRupeesToPaise(input.mrp);
  const wholesale = parseRupeesToPaise(input.wholesalePrice);
  const reorder = parseQuantityToScaled(input.reorderLevel);
  const duration = /^\d+$/.test(input.serviceDurationMinutes.trim())
    ? Number(input.serviceDurationMinutes)
    : null;
  const warrantyDays = /^\d+$/.test(input.warrantyDays.trim())
    ? Number(input.warrantyDays)
    : null;
  if (
    purchase === null ||
    selling === null ||
    threshold === null ||
    gst === null ||
    openingStock === null ||
    mrp === null ||
    wholesale === null ||
    reorder === null ||
    duration === null ||
    warrantyDays === null ||
    !Number.isSafeInteger(duration) ||
    !Number.isSafeInteger(warrantyDays)
  ) {
    throw new Error("Invalid numeric catalog data.");
  }
  return {
    purchase,
    selling,
    threshold,
    gst,
    openingStock,
    mrp,
    wholesale,
    reorder,
    duration,
    warrantyDays,
  };
}

function checklistJson(value: string): string {
  return JSON.stringify(
    value
      .split(/[,\n]/)
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
}

async function updateProfessionalFields(
  database: SQLiteDatabase,
  id: string,
  input: CatalogItemInput,
  numbers: ReturnType<typeof normalizedNumbers>,
  timestamp: string,
): Promise<void> {
  const product = input.type === "product";
  const service = input.type === "service";
  await database.runAsync(
    `UPDATE items SET short_name=?, hsn_sac_code=?, mrp_paise=?,
      wholesale_price_paise=?, tax_inclusive=?, reorder_level_scaled=?,
      storage_location=?, supplier=?, description=?, image_uri=?, weight=?,
      dimensions=?, color=?, size=?, expiry_date=?, batch_number=?, warranty=?,
      manufacturer=?, purchase_account=?, sales_account=?, cogs_account=?,
      service_pricing_model=?, service_duration_minutes=?, assigned_staff=?,
      appointment_required=?, warranty_days=?, checklist_json=?, internal_notes=?,
      customer_notes=?, updated_at=? WHERE id=?`,
    nullable(input.shortName),
    nullable(input.hsnSacCode),
    product ? numbers.mrp : 0,
    product ? numbers.wholesale : 0,
    input.taxInclusive ? 1 : 0,
    product ? numbers.reorder : 0,
    product ? nullable(input.storageLocation) : null,
    product ? nullable(input.supplier) : null,
    nullable(input.description),
    nullable(input.imageUri),
    product ? nullable(input.weight) : null,
    product ? nullable(input.dimensions) : null,
    product ? nullable(input.color) : null,
    product ? nullable(input.size) : null,
    product ? nullable(input.expiryDate) : null,
    product ? nullable(input.batchNumber) : null,
    product ? nullable(input.warranty) : null,
    product ? nullable(input.manufacturer) : null,
    product ? nullable(input.purchaseAccount) : null,
    nullable(input.salesAccount),
    product ? nullable(input.cogsAccount) : null,
    service ? input.servicePricingModel : "fixed",
    service ? numbers.duration : 0,
    service ? nullable(input.assignedStaff) : null,
    service && input.appointmentRequired ? 1 : 0,
    service ? numbers.warrantyDays : 0,
    service ? checklistJson(input.checklist) : "[]",
    service ? nullable(input.internalNotes) : null,
    service ? nullable(input.customerNotes) : null,
    timestamp,
    id,
  );
}

export async function createCatalogItem(
  input: CatalogItemInput,
): Promise<string> {
  const database = await getDatabase();
  await assertCanCreate("catalog", database);
  return runInTransaction(database, async (transaction) => {
    const id = await createUuid(transaction);
    const timestamp = new Date().toISOString();
    const categoryId = await resolveCategory(
      transaction,
      input.category,
      timestamp,
    );
    const unitId = await resolveUnit(transaction, input.unit, timestamp);
    const numbers = normalizedNumbers(input);
    const threshold = input.type === "product" ? numbers.threshold : null;

    await transaction.runAsync(
      `INSERT INTO items (
        id, type, name, sku, barcode, category_id, brand, unit_id,
        purchase_price_paise, selling_price_paise, gst_rate_basis_points,
        current_stock_scaled, low_stock_threshold_scaled, is_archived,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      id,
      input.type,
      input.name.trim(),
      nullable(input.sku),
      nullable(input.barcode),
      categoryId,
      nullable(input.brand),
      unitId,
      numbers.purchase,
      numbers.selling,
      numbers.gst,
      input.type === "product" ? numbers.openingStock : 0,
      threshold,
      timestamp,
      timestamp,
    );
    await updateProfessionalFields(transaction, id, input, numbers, timestamp);
    if (input.type === "product" && numbers.openingStock > 0) {
      const movementId = await createUuid(transaction);
      await transaction.runAsync(
        `INSERT INTO stock_movements (
          id, item_id, type, quantity_delta_scaled, reference_type,
          reference_id, reason, occurred_at, created_at
        ) VALUES (?, ?, 'opening', ?, 'item', ?, 'Opening stock', ?, ?)`,
        movementId,
        id,
        numbers.openingStock,
        id,
        timestamp,
        timestamp,
      );
    }
    return id;
  });
}

export async function updateCatalogItem(
  id: string,
  input: CatalogItemInput,
): Promise<void> {
  const database = await getDatabase();
  await runInTransaction(database, async (transaction) => {
    const timestamp = new Date().toISOString();
    const categoryId = await resolveCategory(
      transaction,
      input.category,
      timestamp,
    );
    const unitId = await resolveUnit(transaction, input.unit, timestamp);
    const numbers = normalizedNumbers(input);
    const threshold = input.type === "product" ? numbers.threshold : null;

    const result = await transaction.runAsync(
      `UPDATE items SET type = ?, name = ?, sku = ?, barcode = ?, category_id = ?,
        brand = ?, unit_id = ?, purchase_price_paise = ?, selling_price_paise = ?,
        gst_rate_basis_points = ?, low_stock_threshold_scaled = ?, updated_at = ?
       WHERE id = ? AND is_archived = 0`,
      input.type,
      input.name.trim(),
      nullable(input.sku),
      nullable(input.barcode),
      categoryId,
      nullable(input.brand),
      unitId,
      numbers.purchase,
      numbers.selling,
      numbers.gst,
      threshold,
      timestamp,
      id,
    );
    if (result.changes !== 1) throw new Error("Item was not updated.");
    await updateProfessionalFields(transaction, id, input, numbers, timestamp);
  });
}

export async function archiveCatalogItem(id: string): Promise<void> {
  const database = await getDatabase();
  const result = await database.runAsync(
    "UPDATE items SET is_archived = 1, updated_at = ? WHERE id = ? AND is_archived = 0",
    new Date().toISOString(),
    id,
  );
  if (result.changes !== 1) throw new Error("Item was not archived.");
}
