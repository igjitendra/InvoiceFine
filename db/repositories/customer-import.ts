import { getDatabase } from "@/db/database";
import { runInTransaction } from "@/db/transaction";
import type {
  DuplicatePhonePolicy,
  CustomerImportRow,
  CustomerImportSummary,
} from "@/types/customer-csv";
export async function importCustomerRows(
  rows: CustomerImportRow[],
  policy: DuplicatePhonePolicy,
): Promise<CustomerImportSummary> {
  const db = await getDatabase();
  return runInTransaction(db, async (tx) => {
    const summary: CustomerImportSummary = {
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: rows.filter((r) => r.errors.length > 0).length,
    };
    for (const row of rows.filter((r) => !r.errors.length)) {
      const v = row.values,
        phone = v.phone || null;
      const existing = phone
        ? await tx.getFirstAsync<{ id: string }>(
            "SELECT id FROM customers WHERE phone=? AND is_archived=0 ORDER BY created_at LIMIT 1",
            phone,
          )
        : null;
      if (existing && policy === "skip") {
        summary.skipped++;
        continue;
      }
      const now = new Date().toISOString();
      if (existing && policy === "update") {
        await tx.runAsync(
          "UPDATE customers SET name=?,email=?,gstin=?,state_code=?,billing_address=?,shipping_address=?,state_name=?,pincode=?,notes=?,updated_at=? WHERE id=?",
          v.name,
          v.email || null,
          v.gstin.toUpperCase() || null,
          v.stateCode || null,
          v.billingAddress || null,
          v.shippingAddress || null,
          v.stateName || null,
          v.pincode || null,
          v.notes || null,
          now,
          existing.id,
        );
        summary.updated++;
        continue;
      }
      const idRow = await tx.getFirstAsync<{ id: string }>(
        "SELECT lower(hex(randomblob(16))) id",
      );
      if (!idRow) throw new Error("ID generation failed");
      await tx.runAsync(
        "INSERT INTO customers(id,name,phone,email,gstin,state_code,billing_address,shipping_address,state_name,pincode,notes,is_archived,created_at,updated_at)VALUES(?,?,?,?,?,?,?,?,?,?,?,0,?,?)",
        idRow.id,
        v.name,
        phone,
        v.email.toLowerCase() || null,
        v.gstin.toUpperCase() || null,
        v.stateCode || null,
        v.billingAddress || null,
        v.shippingAddress || null,
        v.stateName || null,
        v.pincode || null,
        v.notes || null,
        now,
        now,
      );
      summary.imported++;
    }
    return summary;
  });
}
