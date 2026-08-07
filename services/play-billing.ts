import Constants from "expo-constants";
import { Platform } from "react-native";

import { monetization } from "@/constants/monetization";
import {
  cachePaidEntitlement,
  clearSubscriptionEntitlement,
} from "@/lib/monetization-storage";
import type {
  BillingAvailability,
  BillingPlan,
  BillingPlanId,
} from "@/types/monetization";

let initialized = false;
function nativeBillingAvailable(): boolean {
  return Platform.OS === "android" && Constants.appOwnership !== "expo";
}
function text(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object"
    ? Object.fromEntries(Object.entries(value))
    : null;
}
function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.map(record).filter((item) => item !== null)
    : [];
}
async function module() {
  return import("expo-iap");
}
async function connect(): Promise<Awaited<ReturnType<typeof module>>> {
  const iap = await module();
  if (!initialized) {
    await iap.initConnection();
    initialized = true;
  }
  return iap;
}
function displayPrice(
  product: Record<string, unknown>,
  fallback: string,
): string {
  return (
    text(product.displayPrice) ??
    text(product.localizedPrice) ??
    text(product.price) ??
    fallback
  );
}
function subscriptionPlans(product: Record<string, unknown>): BillingPlan[] {
  const offers = records(
    product.subscriptionOffers ?? product.subscriptionOfferDetailsAndroid,
  );
  return offers.flatMap((offer) => {
    const basePlanId =
      text(offer.basePlanIdAndroid) ?? text(offer.basePlanId) ?? text(offer.id);
    if (
      basePlanId !== monetization.monthlyBasePlanId &&
      basePlanId !== monetization.yearlyBasePlanId
    )
      return [];
    const phasesContainer = record(
      offer.pricingPhasesAndroid ?? offer.pricingPhases,
    );
    const phases = records(phasesContainer?.pricingPhaseList);
    const price = phases.length
      ? text(phases[phases.length - 1]?.formattedPrice)
      : null;
    return [
      {
        id: basePlanId,
        title: basePlanId === "monthly" ? "Monthly" : "Annual",
        displayPrice: price ?? (basePlanId === "monthly" ? "₹29" : "₹99"),
        subtitle:
          basePlanId === "monthly"
            ? "per month · Flexible"
            : "per year · Best value",
        offerToken: text(offer.offerTokenAndroid) ?? text(offer.offerToken),
      },
    ];
  });
}
export async function loadBillingPlans(): Promise<BillingAvailability> {
  if (!nativeBillingAvailable()) return { available: false, reason: "expo_go" };
  try {
    const iap = await connect();
    const subscriptions = await iap.fetchProducts({
      skus: [monetization.subscriptionProductId],
      type: "subs",
    });
    const products = await iap.fetchProducts({
      skus: [monetization.lifetimeProductId],
      type: "in-app",
    });
    const subscription = records(subscriptions)[0];
    const lifetime = records(products)[0];
    const plans = subscription ? subscriptionPlans(subscription) : [];
    plans.push({
      id: "lifetime",
      title: "Lifetime",
      displayPrice: lifetime ? displayPrice(lifetime, "₹999") : "₹999",
      subtitle: "one-time purchase · No renewal",
      offerToken: null,
    });
    return { available: true, plans };
  } catch {
    return { available: false, reason: "unavailable" };
  }
}
export async function purchaseBillingPlan(
  id: BillingPlanId,
  offerToken: string | null,
): Promise<void> {
  if (!nativeBillingAvailable())
    throw new Error("BILLING_REQUIRES_DEVELOPMENT_BUILD");
  const iap = await connect();
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      updated.remove();
      failed.remove();
      action();
    };
    const updated = iap.purchaseUpdatedListener((purchase) => {
      void iap
        .finishTransaction({ purchase, isConsumable: false })
        .then(() => {
          cachePaidEntitlement(id);
          finish(resolve);
        })
        .catch((error: unknown) => finish(() => reject(error)));
    });
    const failed = iap.purchaseErrorListener((error) =>
      finish(() => reject(error)),
    );
    const timeout = setTimeout(
      () => finish(() => reject(new Error("PURCHASE_TIMEOUT"))),
      120_000,
    );
    const request =
      id === "lifetime"
        ? iap.requestPurchase({
            request: {
              google: { skus: [monetization.lifetimeProductId] },
            },
            type: "in-app",
          })
        : offerToken
          ? iap.requestPurchase({
              request: {
                google: {
                  skus: [monetization.subscriptionProductId],
                  subscriptionOffers: [
                    { sku: monetization.subscriptionProductId, offerToken },
                  ],
                },
              },
              type: "subs",
            })
          : Promise.reject(new Error("SUBSCRIPTION_OFFER_UNAVAILABLE"));
    void request.catch((error: unknown) => finish(() => reject(error)));
  });
}
export async function restorePlayPurchases(): Promise<
  "lifetime" | "subscription" | "none"
> {
  if (!nativeBillingAvailable())
    throw new Error("BILLING_REQUIRES_DEVELOPMENT_BUILD");
  const iap = await connect();
  const purchases = records(await iap.getAvailablePurchases());
  const hasLifetime = purchases.some(
    (purchase) =>
      text(purchase.productId) === monetization.lifetimeProductId ||
      text(purchase.id) === monetization.lifetimeProductId,
  );
  if (hasLifetime) {
    cachePaidEntitlement("lifetime");
    return "lifetime";
  }
  const subscriptions = records(
    await iap.getActiveSubscriptions([monetization.subscriptionProductId]),
  );
  if (subscriptions.length > 0) {
    const item = subscriptions[0];
    const basePlan = item
      ? (text(item.currentPlanId) ??
        text(item.basePlanIdAndroid) ??
        text(item.productId))
      : null;
    cachePaidEntitlement(basePlan === "monthly" ? "monthly" : "yearly");
    return "subscription";
  }
  clearSubscriptionEntitlement();
  return "none";
}
