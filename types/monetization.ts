export type ProSource = "promo" | "monthly" | "yearly" | "lifetime";
export type MonetizationStatus = {
  isPro: boolean;
  source: ProSource | null;
  expiresAt: string | null;
  promoRedeemed: boolean;
  promoExpiresAt: string | null;
};
export type FreeLimitKind = "invoice" | "customer" | "catalog";
export type FreeUsage = {
  invoiceToday: number;
  customerTotal: number;
  catalogTotal: number;
};
export type BillingPlanId = "monthly" | "yearly" | "lifetime";
export type BillingPlan = {
  id: BillingPlanId;
  title: string;
  displayPrice: string;
  subtitle: string;
  offerToken: string | null;
};
export type BillingAvailability =
  | { available: false; reason: "expo_go" | "unavailable" }
  | { available: true; plans: BillingPlan[] };
