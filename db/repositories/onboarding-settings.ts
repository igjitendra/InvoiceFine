import { getDatabase } from "@/db/database";
import type {
  BusinessType,
  NotificationPreference,
  OnboardingPaymentMethod,
  PremiumOnboardingInput,
  PremiumOnboardingSettings,
} from "@/types/onboarding";
const id = "primary-business";
type Row = {
  business_type: BusinessType;
  business_category: string;
  business_name: string;
  owner_name: string | null;
  logo_uri: string | null;
  phone: string;
  email: string | null;
  website: string | null;
  gstin: string | null;
  pan: string | null;
  address: string;
  state_name: string | null;
  state_code: string | null;
  pincode: string | null;
  tax_enabled: number;
  gst_type: PremiumOnboardingSettings["gstType"];
  invoice_template: PremiumOnboardingSettings["invoiceTemplate"];
  invoice_page_size: "a4" | "4x6";
  currency_code: PremiumOnboardingSettings["currencyCode"];
  invoice_prefix: string;
  estimate_prefix: string;
  quotation_prefix: string;
  payment_terms_days: number;
  payment_methods_json: string;
  payment_qr_uri: string | null;
  signature_uri: string | null;
  notification_preferences_json: string;
  onboarding_completed: number;
};
function text(v: string) {
  const x = v.trim();
  return x || null;
}
function list<T extends string>(value: string, fallback: T[]): T[] {
  try {
    const x: unknown = JSON.parse(value);
    return Array.isArray(x)
      ? x.filter((item): item is T => typeof item === "string")
      : fallback;
  } catch {
    return fallback;
  }
}
export async function getPremiumOnboardingSettings(): Promise<PremiumOnboardingSettings | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Row>(
    `SELECT business_type,business_category,business_name,owner_name,logo_uri,phone,email,website,gstin,pan,address,state_name,state_code,pincode,tax_enabled,gst_type,invoice_template,invoice_page_size,currency_code,invoice_prefix,estimate_prefix,quotation_prefix,payment_terms_days,payment_methods_json,payment_qr_uri,signature_uri,notification_preferences_json,onboarding_completed FROM business_settings WHERE id=?`,
    id,
  );
  if (!row) return null;
  return {
    businessType: row.business_type,
    businessCategory: row.business_category,
    businessName: row.business_name,
    ownerName: row.owner_name ?? "",
    logoUri: row.logo_uri,
    phone: row.phone,
    email: row.email ?? "",
    website: row.website ?? "",
    gstin: row.gstin ?? "",
    pan: row.pan ?? "",
    address: row.address,
    stateName: row.state_name ?? "",
    stateCode: row.state_code ?? "",
    pincode: row.pincode ?? "",
    taxEnabled: row.tax_enabled === 1,
    gstType: row.gst_type,
    invoiceTemplate: row.invoice_template,
    invoicePageSize: row.invoice_page_size,
    currencyCode: row.currency_code,
    invoicePrefix: row.invoice_prefix,
    estimatePrefix: row.estimate_prefix,
    quotationPrefix: row.quotation_prefix,
    paymentTermsDays: row.payment_terms_days,
    paymentMethods: list<OnboardingPaymentMethod>(row.payment_methods_json, [
      "cash",
    ]),
    paymentQrUri: row.payment_qr_uri,
    signatureUri: row.signature_uri,
    notificationPreferences: list<NotificationPreference>(
      row.notification_preferences_json,
      [],
    ),
    onboardingCompleted: row.onboarding_completed === 1,
  };
}
export async function getBusinessType(): Promise<BusinessType> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ business_type: BusinessType }>(
    "SELECT business_type FROM business_settings WHERE id=?",
    id,
  );
  return row?.business_type ?? "both";
}
export async function savePremiumOnboarding(
  input: PremiumOnboardingInput,
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO business_settings(id,business_name,gstin,state_code,address,phone,email,logo_uri,signature_uri,payment_qr_uri,invoice_prefix,next_invoice_number,tax_enabled,currency_code,invoice_page_size,created_at,updated_at,business_type,business_category,owner_name,website,pan,state_name,pincode,gst_type,invoice_template,estimate_prefix,quotation_prefix,payment_terms_days,payment_methods_json,notification_preferences_json,onboarding_completed)VALUES(?,?,?,?,?,?,?,?,?,?,?,1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1) ON CONFLICT(id) DO UPDATE SET business_name=excluded.business_name,gstin=excluded.gstin,state_code=excluded.state_code,address=excluded.address,phone=excluded.phone,email=excluded.email,logo_uri=excluded.logo_uri,signature_uri=excluded.signature_uri,payment_qr_uri=excluded.payment_qr_uri,invoice_prefix=excluded.invoice_prefix,tax_enabled=excluded.tax_enabled,currency_code=excluded.currency_code,invoice_page_size=excluded.invoice_page_size,updated_at=excluded.updated_at,business_type=excluded.business_type,business_category=excluded.business_category,owner_name=excluded.owner_name,website=excluded.website,pan=excluded.pan,state_name=excluded.state_name,pincode=excluded.pincode,gst_type=excluded.gst_type,invoice_template=excluded.invoice_template,estimate_prefix=excluded.estimate_prefix,quotation_prefix=excluded.quotation_prefix,payment_terms_days=excluded.payment_terms_days,payment_methods_json=excluded.payment_methods_json,notification_preferences_json=excluded.notification_preferences_json,onboarding_completed=1`,
    id,
    input.businessName.trim(),
    text(input.gstin)?.toUpperCase() ?? null,
    text(input.stateCode),
    input.address.trim(),
    input.phone.trim(),
    text(input.email)?.toLowerCase() ?? null,
    input.logoUri,
    input.signatureUri,
    input.paymentQrUri,
    input.invoicePrefix.trim().toUpperCase(),
    input.taxEnabled ? 1 : 0,
    input.currencyCode,
    input.invoicePageSize,
    now,
    now,
    input.businessType,
    input.businessCategory,
    text(input.ownerName),
    text(input.website),
    text(input.pan)?.toUpperCase() ?? null,
    text(input.stateName),
    text(input.pincode),
    input.taxEnabled ? input.gstType : "unregistered",
    input.invoiceTemplate,
    input.estimatePrefix.trim().toUpperCase(),
    input.quotationPrefix.trim().toUpperCase(),
    input.paymentTermsDays,
    JSON.stringify(input.paymentMethods),
    JSON.stringify(input.notificationPreferences),
  );
}
