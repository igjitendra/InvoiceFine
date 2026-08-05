export type BusinessType = "product" | "service" | "both";
export type GstType = "unregistered" | "regular" | "composition";
export type InvoiceTemplate =
  | "classic"
  | "modern"
  | "minimal"
  | "retail"
  | "service"
  | "corporate"
  | "gst_pro"
  | "thermal";
export type SupportedCurrency = "INR" | "AED" | "USD" | "EUR";
export type OnboardingPaymentMethod =
  "cash" | "upi" | "bank" | "card" | "cheque";
export type NotificationPreference =
  | "low_stock"
  | "due_payments"
  | "backup_reminder"
  | "daily_report"
  | "weekly_report";
export type PremiumOnboardingInput = {
  businessType: BusinessType;
  businessCategory: string;
  businessName: string;
  ownerName: string;
  logoUri: string | null;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
  address: string;
  stateName: string;
  stateCode: string;
  pincode: string;
  taxEnabled: boolean;
  gstType: GstType;
  invoiceTemplate: InvoiceTemplate;
  invoicePageSize: "a4" | "4x6";
  currencyCode: SupportedCurrency;
  invoicePrefix: string;
  estimatePrefix: string;
  quotationPrefix: string;
  paymentTermsDays: number;
  paymentMethods: OnboardingPaymentMethod[];
  paymentQrUri: string | null;
  signatureUri: string | null;
  notificationPreferences: NotificationPreference[];
};
export type PremiumOnboardingSettings = PremiumOnboardingInput & {
  onboardingCompleted: boolean;
};
