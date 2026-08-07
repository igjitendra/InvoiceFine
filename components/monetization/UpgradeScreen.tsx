import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, View } from "react-native";

import { AppText as Text } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { monetization } from "@/constants/monetization";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
import {
  activateTryYearPromo,
  getMonetizationStatus,
} from "@/lib/monetization-storage";
import {
  loadBillingPlans,
  purchaseBillingPlan,
  restorePlayPurchases,
} from "@/services/play-billing";
import type {
  BillingAvailability,
  BillingPlan,
  BillingPlanId,
  MonetizationStatus,
} from "@/types/monetization";

const fallbackPlans: BillingPlan[] = [
  {
    id: "monthly",
    title: "Monthly",
    displayPrice: "₹29",
    subtitle: "per month · Cancel anytime",
    offerToken: null,
  },
  {
    id: "yearly",
    title: "Annual",
    displayPrice: "₹99",
    subtitle: "per year · Best value",
    offerToken: null,
  },
  {
    id: "lifetime",
    title: "Lifetime",
    displayPrice: "₹999",
    subtitle: "one-time purchase · No renewal",
    offerToken: null,
  },
];
const features = [
  [
    "documents-outline",
    "Unlimited invoices",
    "Create invoices without daily limits",
  ],
  ["people-outline", "Unlimited customers", "Keep your complete customer list"],
  ["cube-outline", "Unlimited catalog", "Products and services without limits"],
  [
    "analytics-outline",
    "Business reports",
    "Track sales, payments, stock and profit",
  ],
] as const;

function statusCopy(status: MonetizationStatus): string {
  if (!status.isPro)
    return "Free plan · 5 invoices daily · 5 customers · 5 catalog items";
  if (status.source === "lifetime") return "Lifetime Pro active";
  if (status.source === "promo")
    return `TRYYEAR Pro active until ${status.expiresAt?.slice(0, 10) ?? ""}`;
  return `${status.source === "monthly" ? "Monthly" : "Annual"} Pro active`;
}
export function UpgradeScreen() {
  const router = useRouter();
  const p = useAppPalette();
  const [status, setStatus] = useState(() => getMonetizationStatus());
  const [billing, setBilling] = useState<BillingAvailability>({
    available: false,
    reason: "unavailable",
  });
  const [selected, setSelected] = useState<BillingPlanId>("yearly");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void loadBillingPlans().then(setBilling);
  }, []);
  const plans = billing.available ? billing.plans : fallbackPlans;
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selected) ?? plans[0],
    [plans, selected],
  );
  function redeemPromo() {
    try {
      const next = activateTryYearPromo(promoCode);
      setStatus(next);
      setPromoCode("");
      Alert.alert(
        "TRYYEAR activated",
        "Unlimited Pro is active for 365 days on this installation.",
      );
    } catch (error) {
      const used =
        error instanceof Error && error.message === "PROMO_ALREADY_USED";
      Alert.alert(
        used ? "Promo already used" : "Invalid promo code",
        used
          ? "TRYYEAR can be activated once on this installation."
          : "Check the code and try again.",
      );
    }
  }
  async function purchase() {
    if (!selectedPlan) return;
    if (!billing.available) {
      Alert.alert(
        "Development build required",
        "Google Play Billing is unavailable in Expo Go. Install the InvoiceFine development or Play Store build.",
      );
      return;
    }
    setBusy(true);
    try {
      await purchaseBillingPlan(selectedPlan.id, selectedPlan.offerToken);
      const restored = await restorePlayPurchases();
      setStatus(getMonetizationStatus());
      Alert.alert(
        restored === "none" ? "Purchase pending" : "Pro activated",
        restored === "none"
          ? "Complete the Google Play purchase, then tap Restore Purchases."
          : "Your Google Play purchase is active.",
      );
    } catch {
      Alert.alert(
        "Purchase not completed",
        "No charge was recorded by InvoiceFine. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function restore() {
    setBusy(true);
    try {
      const restored = await restorePlayPurchases();
      setStatus(getMonetizationStatus());
      Alert.alert(
        restored === "none" ? "No active purchase found" : "Purchases restored",
        restored === "none"
          ? "Use the same Google Play account that purchased InvoiceFine Pro."
          : "Your Pro access is active on this device.",
      );
    } catch {
      Alert.alert(
        "Development build required",
        "Restore Purchases needs the InvoiceFine development or Play Store build, not Expo Go.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={[
            styles.back,
            { backgroundColor: p.surface, borderColor: p.border },
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={p.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: p.text }]}>InvoiceFine Pro</Text>
          <Text style={[styles.subtitle, { color: p.muted }]}>
            {statusCopy(status)}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.hero,
          { backgroundColor: p.primarySoft, borderColor: p.primary },
        ]}
      >
        <Ionicons name="diamond-outline" size={34} color={p.primary} />
        <Text style={[styles.heroTitle, { color: p.text }]}>
          Unlimited business tools
        </Text>
        <Text style={[styles.heroCopy, { color: p.muted }]}>
          No InvoiceFine login, no cloud backup. Your business records remain
          local.
        </Text>
      </View>

      <View style={styles.featureList}>
        {features.map(([icon, title, description]) => (
          <View
            key={title}
            style={[
              styles.feature,
              { backgroundColor: p.surface, borderColor: p.border },
            ]}
          >
            <View
              style={[styles.featureIcon, { backgroundColor: p.primarySoft }]}
            >
              <Ionicons name={icon} size={23} color={p.primary} />
            </View>
            <View style={styles.featureCopy}>
              <Text style={[styles.featureTitle, { color: p.text }]}>
                {title}
              </Text>
              <Text style={[styles.featureDescription, { color: p.muted }]}>
                {description}
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={25} color={p.positive} />
          </View>
        ))}
      </View>

      <Text style={[styles.choose, { color: p.text }]}>Choose your plan</Text>
      <View style={styles.planList}>
        {plans.map((plan) => {
          const active = selected === plan.id;
          return (
            <Pressable
              key={plan.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => setSelected(plan.id)}
              style={[
                styles.plan,
                {
                  backgroundColor: p.surface,
                  borderColor: active ? p.primary : p.border,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              {plan.id === "yearly" ? (
                <Text
                  style={[
                    styles.bestValue,
                    { backgroundColor: p.warning, color: p.textOnPrimary },
                  ]}
                >
                  BEST VALUE
                </Text>
              ) : null}
              <View
                style={[styles.planIcon, { backgroundColor: p.primarySoft }]}
              >
                <Ionicons
                  name={
                    plan.id === "lifetime"
                      ? "infinite-outline"
                      : plan.id === "yearly"
                        ? "star-outline"
                        : "refresh-outline"
                  }
                  size={25}
                  color={p.primary}
                />
              </View>
              <View style={styles.planCopy}>
                <Text style={[styles.planTitle, { color: p.text }]}>
                  {plan.title}
                </Text>
                <Text style={[styles.planSubtitle, { color: p.muted }]}>
                  {plan.subtitle}
                </Text>
              </View>
              <Text style={[styles.price, { color: p.text }]}>
                {plan.displayPrice}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Button
        label={`Continue with ${selectedPlan?.title ?? "Pro"}`}
        loading={busy}
        disabled={status.source === "lifetime"}
        onPress={() => void purchase()}
      />

      <View
        style={[
          styles.promo,
          { backgroundColor: p.surface, borderColor: p.border },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => setPromoOpen((value) => !value)}
          style={styles.promoHeader}
        >
          <Ionicons name="ticket-outline" size={23} color={p.primary} />
          <Text style={[styles.promoTitle, { color: p.text }]}>
            Have a promo code?
          </Text>
          <Ionicons
            name={promoOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color={p.muted}
          />
        </Pressable>
        {promoOpen ? (
          <View style={styles.promoBody}>
            <Input
              label="Promo code"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
              editable={!status.promoRedeemed}
              placeholder={monetization.promoCode}
              helperText="TRYYEAR gives 365 days of local Pro access. It is not restored by Google Play."
            />
            <Button
              label="Apply promo code"
              disabled={status.promoRedeemed || !promoCode.trim()}
              onPress={redeemPromo}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button
          label="Restore Purchases"
          variant="secondary"
          loading={busy}
          onPress={() => void restore()}
        />
        <Button
          label="Support"
          variant="secondary"
          onPress={() =>
            void Linking.openURL(
              "mailto:jitendraeditiz@gmail.com?subject=InvoiceFine%20Pro%20support",
            )
          }
        />
      </View>
      <View style={styles.security}>
        <Ionicons name="shield-checkmark" size={20} color={p.positive} />
        <Text style={[styles.securityText, { color: p.muted }]}>
          Secure payment by Google Play
        </Text>
      </View>
      <Text style={[styles.legal, { color: p.muted }]}>
        By purchasing, you agree to the Terms and Privacy Policy. Monthly and
        annual subscriptions renew automatically unless cancelled in Google
        Play. Lifetime is a one-time purchase.
      </Text>
      <View style={styles.legalLinks}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/legal/[slug]",
              params: { slug: "terms" },
            })
          }
        >
          <Text style={[styles.link, { color: p.primary }]}>Terms</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/legal/[slug]",
              params: { slug: "privacy" },
            })
          }
        >
          <Text style={[styles.link, { color: p.primary }]}>Privacy</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/legal/[slug]",
              params: { slug: "refund" },
            })
          }
        >
          <Text style={[styles.link, { color: p.primary }]}>Refunds</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  back: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: { flex: 1, gap: 3 },
  title: { ...theme.typography.screenTitle },
  subtitle: { ...theme.typography.secondary },
  hero: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  heroTitle: { ...theme.typography.sectionTitle, fontWeight: "700" },
  heroCopy: { ...theme.typography.secondary, textAlign: "center" },
  featureList: { gap: 10 },
  feature: {
    minHeight: 82,
    borderWidth: 1,
    borderRadius: 20,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  featureCopy: { flex: 1 },
  featureTitle: { ...theme.typography.body, fontWeight: "700" },
  featureDescription: { ...theme.typography.caption, marginTop: 2 },
  choose: {
    ...theme.typography.sectionTitle,
    textAlign: "center",
    marginTop: 6,
  },
  planList: { gap: 10 },
  plan: {
    minHeight: 104,
    borderRadius: 22,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  bestValue: {
    position: "absolute",
    right: 0,
    top: 0,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomLeftRadius: 14,
    ...theme.typography.eyebrow,
  },
  planIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  planCopy: { flex: 1 },
  planTitle: { ...theme.typography.sectionTitle },
  planSubtitle: { ...theme.typography.caption },
  price: { ...theme.typography.sectionTitle, fontWeight: "700" },
  promo: { borderWidth: 1, borderRadius: 20, overflow: "hidden" },
  promoHeader: {
    minHeight: 68,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  promoTitle: { ...theme.typography.body, fontWeight: "700", flex: 1 },
  promoBody: { padding: 16, paddingTop: 0, gap: 14 },
  actions: { flexDirection: "row", gap: 10 },
  security: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  securityText: { ...theme.typography.label },
  legal: { ...theme.typography.caption, textAlign: "center" },
  legalLinks: { flexDirection: "row", justifyContent: "center", gap: 22 },
  link: { ...theme.typography.label, fontWeight: "700" },
});
