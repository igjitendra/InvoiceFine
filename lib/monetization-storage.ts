import Storage from "expo-sqlite/kv-store";

import { monetization } from "@/constants/monetization";
import type { MonetizationStatus, ProSource } from "@/types/monetization";

const PROMO_KEY = "invoicefine.monetization.promo.v1";
const PAID_KEY = "invoicefine.monetization.paid.v1";
const CLOCK_KEY = "invoicefine.monetization.clock.v1";

type PromoRecord = { redeemedAt: string; expiresAt: string };
type PaidRecord = {
  source: Exclude<ProSource, "promo">;
  verifiedAt: string;
};

function parseRecord<T>(key: string): T | null {
  try {
    const raw = Storage.getItemSync(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function effectiveNow(now: Date): Date {
  const stored = Storage.getItemSync(CLOCK_KEY);
  const previous = stored ? Date.parse(stored) : Number.NaN;
  const timestamp = Math.max(
    now.getTime(),
    Number.isFinite(previous) ? previous : 0,
  );
  const value = new Date(timestamp);
  Storage.setItemSync(CLOCK_KEY, value.toISOString());
  return value;
}
function addDays(value: Date, days: number): Date {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1000);
}
export function activateTryYearPromo(
  code: string,
  now = new Date(),
): MonetizationStatus {
  if (code.trim().toUpperCase() !== monetization.promoCode)
    throw new Error("INVALID_PROMO_CODE");
  if (parseRecord<PromoRecord>(PROMO_KEY))
    throw new Error("PROMO_ALREADY_USED");
  const start = effectiveNow(now);
  const record: PromoRecord = {
    redeemedAt: start.toISOString(),
    expiresAt: addDays(start, monetization.promoDurationDays).toISOString(),
  };
  Storage.setItemSync(PROMO_KEY, JSON.stringify(record));
  return getMonetizationStatus(start);
}
export function cachePaidEntitlement(
  source: Exclude<ProSource, "promo">,
  now = new Date(),
): void {
  const verified = effectiveNow(now);
  Storage.setItemSync(
    PAID_KEY,
    JSON.stringify({
      source,
      verifiedAt: verified.toISOString(),
    } satisfies PaidRecord),
  );
}
export function clearSubscriptionEntitlement(): void {
  const current = parseRecord<PaidRecord>(PAID_KEY);
  if (current?.source !== "lifetime") Storage.removeItemSync(PAID_KEY);
}
export function getMonetizationStatus(now = new Date()): MonetizationStatus {
  const current = effectiveNow(now);
  const paid = parseRecord<PaidRecord>(PAID_KEY);
  if (paid?.source === "lifetime")
    return {
      isPro: true,
      source: "lifetime",
      expiresAt: null,
      promoRedeemed: Boolean(parseRecord<PromoRecord>(PROMO_KEY)),
      promoExpiresAt: parseRecord<PromoRecord>(PROMO_KEY)?.expiresAt ?? null,
    };
  if (paid) {
    const graceEnds = addDays(
      new Date(paid.verifiedAt),
      monetization.subscriptionOfflineGraceDays,
    );
    if (current.getTime() <= graceEnds.getTime())
      return {
        isPro: true,
        source: paid.source,
        expiresAt: graceEnds.toISOString(),
        promoRedeemed: Boolean(parseRecord<PromoRecord>(PROMO_KEY)),
        promoExpiresAt: parseRecord<PromoRecord>(PROMO_KEY)?.expiresAt ?? null,
      };
  }
  const promo = parseRecord<PromoRecord>(PROMO_KEY);
  const promoActive = Boolean(
    promo && current.getTime() < Date.parse(promo.expiresAt),
  );
  return {
    isPro: promoActive,
    source: promoActive ? "promo" : null,
    expiresAt: promoActive ? (promo?.expiresAt ?? null) : null,
    promoRedeemed: Boolean(promo),
    promoExpiresAt: promo?.expiresAt ?? null,
  };
}
