import { getDatabase } from "@/db/database";
import { assertCanCreate } from "@/db/repositories/monetization";
import type { Customer, CustomerInput } from "@/types/customer";

type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  state_code: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  state_name: string | null;
  pincode: string | null;
  notes: string | null;
  is_archived: number;
  created_at: string;
  updated_at: string;
};

type GeneratedIdRow = { id: string };

function nullable(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    gstin: row.gstin,
    stateCode: row.state_code,
    billingAddress: row.billing_address,
    shippingAddress: row.shipping_address,
    stateName: row.state_name,
    pincode: row.pincode,
    notes: row.notes,
    isArchived: row.is_archived === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function createUuid(): Promise<string> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<GeneratedIdRow>(`
    SELECT lower(hex(randomblob(4))) || '-' ||
           lower(hex(randomblob(2))) || '-4' ||
           substr(lower(hex(randomblob(2))), 2) || '-' ||
           substr('89ab', abs(random()) % 4 + 1, 1) ||
           substr(lower(hex(randomblob(2))), 2) || '-' ||
           lower(hex(randomblob(6))) AS id
  `);
  if (!row) throw new Error("Unable to generate a customer ID.");
  return row.id;
}

export async function listCustomers(search = ""): Promise<Customer[]> {
  const database = await getDatabase();
  const normalized = search.trim();
  const escaped = normalized.replace(/[\%_]/g, "\$&");
  const pattern = `%${escaped}%`;
  const rows = await database.getAllAsync<CustomerRow>(
    `SELECT id, name, phone, email, gstin, state_code, billing_address, shipping_address, state_name, pincode,
            notes, is_archived, created_at, updated_at
     FROM customers
     WHERE is_archived = 0
       AND (? = '' OR name LIKE ? ESCAPE '\' COLLATE NOCASE OR phone LIKE ? ESCAPE '\')
     ORDER BY name COLLATE NOCASE ASC`,
    normalized,
    pattern,
    pattern,
  );
  return rows.map(mapCustomer);
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<CustomerRow>(
    `SELECT id, name, phone, email, gstin, state_code, billing_address, shipping_address, state_name, pincode,
            notes, is_archived, created_at, updated_at
     FROM customers WHERE id = ?`,
    id,
  );
  return row ? mapCustomer(row) : null;
}

export async function createCustomer(input: CustomerInput): Promise<string> {
  const database = await getDatabase();
  await assertCanCreate("customer", database);
  const id = await createUuid();
  const timestamp = new Date().toISOString();
  await database.runAsync(
    `INSERT INTO customers (
       id, name, phone, email, gstin, state_code, billing_address, shipping_address, state_name, pincode, notes,
       is_archived, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    id,
    input.name.trim(),
    nullable(input.phone),
    nullable(input.email)?.toLowerCase() ?? null,
    nullable(input.gstin)?.toUpperCase() ?? null,
    nullable(input.stateCode),
    nullable(input.billingAddress),
    nullable(input.shippingAddress),
    nullable(input.stateName),
    nullable(input.pincode),
    nullable(input.notes),
    timestamp,
    timestamp,
  );
  return id;
}

export async function updateCustomer(
  id: string,
  input: CustomerInput,
): Promise<void> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `UPDATE customers SET
       name = ?, phone = ?, email = ?, gstin = ?, state_code = ?,
       billing_address = ?, shipping_address = ?, state_name = ?, pincode = ?, notes = ?, updated_at = ?
     WHERE id = ? AND is_archived = 0`,
    input.name.trim(),
    nullable(input.phone),
    nullable(input.email)?.toLowerCase() ?? null,
    nullable(input.gstin)?.toUpperCase() ?? null,
    nullable(input.stateCode),
    nullable(input.billingAddress),
    nullable(input.shippingAddress),
    nullable(input.stateName),
    nullable(input.pincode),
    nullable(input.notes),
    new Date().toISOString(),
    id,
  );
  if (result.changes !== 1) throw new Error("Customer was not updated.");
}

export async function archiveCustomer(id: string): Promise<void> {
  const database = await getDatabase();
  const balance = await database.getFirstAsync<{ outstanding: number }>(
    `SELECT COALESCE(SUM(total_paise-paid_paise-settlement_discount_paise),0) outstanding
     FROM invoices WHERE customer_id=? AND status NOT IN('draft','cancelled')`,
    id,
  );
  if ((balance?.outstanding ?? 0) > 0)
    throw new Error(
      "This customer has an outstanding payment. Clear the due invoices before deleting the customer.",
    );
  const result = await database.runAsync(
    `UPDATE customers SET is_archived = 1, updated_at = ?
     WHERE id = ? AND is_archived = 0`,
    new Date().toISOString(),
    id,
  );
  if (result.changes !== 1) throw new Error("Customer was not archived.");
}
