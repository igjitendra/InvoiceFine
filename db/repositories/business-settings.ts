import { getDatabase } from "@/db/database";
import type { BusinessProfile, BusinessProfileInput } from "@/types/business";

type BusinessSettingsRow = {
  id: string;
  business_name: string;
  gstin: string | null;
  state_code: string | null;
  address: string;
  phone: string;
  email: string | null;
  logo_uri: string | null;
  signature_uri: string | null;
  invoice_prefix: string;
  next_invoice_number: number;
  tax_enabled: number;
  currency_code: string;
  invoice_page_size: "a4" | "4x6";
  created_at: string;
  updated_at: string;
};

const businessSettingsId = "primary-business";

function toNullable(value: string | null): string | null {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function mapBusinessProfile(row: BusinessSettingsRow): BusinessProfile {
  return {
    id: row.id,
    businessName: row.business_name,
    gstin: row.gstin,
    stateCode: row.state_code,
    address: row.address,
    phone: row.phone,
    email: row.email,
    logoUri: row.logo_uri,
    signatureUri: row.signature_uri,
    invoicePrefix: row.invoice_prefix,
    nextInvoiceNumber: row.next_invoice_number,
    taxEnabled: row.tax_enabled === 1,
    currencyCode: "INR",
    invoicePageSize: row.invoice_page_size,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<BusinessSettingsRow>(
    `SELECT id, business_name, gstin, state_code, address, phone, email,
            logo_uri, signature_uri, invoice_prefix, next_invoice_number,
            tax_enabled, currency_code, invoice_page_size, created_at, updated_at
     FROM business_settings
     WHERE id = ?`,
    businessSettingsId,
  );

  return row ? mapBusinessProfile(row) : null;
}

export async function saveBusinessProfile(
  input: BusinessProfileInput,
): Promise<void> {
  const database = await getDatabase();
  const timestamp = new Date().toISOString();

  await database.runAsync(
    `INSERT INTO business_settings (
       id, business_name, gstin, state_code, address, phone, email,
       logo_uri, signature_uri, invoice_prefix, next_invoice_number,
       tax_enabled, currency_code, invoice_page_size, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       business_name = excluded.business_name,
       gstin = excluded.gstin,
       state_code = excluded.state_code,
       address = excluded.address,
       phone = excluded.phone,
       email = excluded.email,
       logo_uri = excluded.logo_uri,
       signature_uri = excluded.signature_uri,
       invoice_prefix = excluded.invoice_prefix,
       next_invoice_number = excluded.next_invoice_number,
       tax_enabled = excluded.tax_enabled,
       invoice_page_size = excluded.invoice_page_size,
       updated_at = excluded.updated_at`,
    businessSettingsId,
    input.businessName.trim(),
    toNullable(input.gstin)?.toUpperCase() ?? null,
    toNullable(input.stateCode),
    input.address.trim(),
    input.phone.trim(),
    toNullable(input.email)?.toLowerCase() ?? null,
    input.logoUri,
    input.signatureUri,
    input.invoicePrefix.trim().toUpperCase(),
    input.nextInvoiceNumber,
    input.taxEnabled ? 1 : 0,
    input.invoicePageSize,
    timestamp,
    timestamp,
  );
}
