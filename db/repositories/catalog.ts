import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/db/database';
import { runInTransaction } from '@/db/transaction';
import { parseRupeesToPaise } from '@/lib/currency';
import { parseQuantityToScaled } from '@/lib/quantity';
import { parsePercentToBasisPoints } from '@/lib/tax';
import type { CatalogFilter, CatalogItem, CatalogItemInput } from '@/types/catalog';

type ItemRow = {
  id: string;
  type: 'product' | 'service';
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
};

type IdRow = { id: string };
type LookupRow = { id: string };

function nullable(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
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
  };
}

async function createUuid(database: SQLiteDatabase): Promise<string> {
  const row = await database.getFirstAsync<IdRow>(`
    SELECT lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
      substr(lower(hex(randomblob(2))), 2) || '-' ||
      substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
      lower(hex(randomblob(6))) AS id
  `);
  if (!row) throw new Error('Unable to generate an ID.');
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
    'SELECT id FROM units WHERE name = ? COLLATE NOCASE',
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
    i.is_archived, i.created_at, i.updated_at
  FROM items i
  LEFT JOIN categories c ON c.id = i.category_id
  LEFT JOIN units u ON u.id = i.unit_id`;

export async function listCatalogItems(
  search = '',
  filter: CatalogFilter = 'all',
): Promise<CatalogItem[]> {
  const database = await getDatabase();
  const normalized = search.trim();
  const escaped = normalized.replace(/[\\%_]/g, '\\$&');
  const pattern = `%${escaped}%`;
  const rows = await database.getAllAsync<ItemRow>(
    `${selectColumns}
     WHERE i.is_archived = 0
       AND (? = 'all' OR i.type = ?)
       AND (? = '' OR i.name LIKE ? ESCAPE '\\' COLLATE NOCASE
         OR i.sku LIKE ? ESCAPE '\\' COLLATE NOCASE
         OR i.barcode LIKE ? ESCAPE '\\' COLLATE NOCASE)
     ORDER BY i.name COLLATE NOCASE ASC`,
    filter,
    filter,
    normalized,
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
  if (purchase === null || selling === null || threshold === null || gst === null) {
    throw new Error('Invalid numeric catalog data.');
  }
  return { purchase, selling, threshold, gst };
}

export async function createCatalogItem(input: CatalogItemInput): Promise<string> {
  const database = await getDatabase();
  return runInTransaction(database, async (transaction) => {
    const id = await createUuid(transaction);
    const timestamp = new Date().toISOString();
    const categoryId = await resolveCategory(transaction, input.category, timestamp);
    const unitId = await resolveUnit(transaction, input.unit, timestamp);
    const numbers = normalizedNumbers(input);
    const threshold = input.type === 'product' ? numbers.threshold : null;

    await transaction.runAsync(
      `INSERT INTO items (
        id, type, name, sku, barcode, category_id, brand, unit_id,
        purchase_price_paise, selling_price_paise, gst_rate_basis_points,
        current_stock_scaled, low_stock_threshold_scaled, is_archived,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, ?, ?)`,
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
      threshold,
      timestamp,
      timestamp,
    );
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
    const categoryId = await resolveCategory(transaction, input.category, timestamp);
    const unitId = await resolveUnit(transaction, input.unit, timestamp);
    const numbers = normalizedNumbers(input);
    const threshold = input.type === 'product' ? numbers.threshold : null;

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
    if (result.changes !== 1) throw new Error('Item was not updated.');
  });
}

export async function archiveCatalogItem(id: string): Promise<void> {
  const database = await getDatabase();
  const result = await database.runAsync(
    'UPDATE items SET is_archived = 1, updated_at = ? WHERE id = ? AND is_archived = 0',
    new Date().toISOString(),
    id,
  );
  if (result.changes !== 1) throw new Error('Item was not archived.');
}
