import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { routes } from "@/constants/routes";
import { theme } from "@/constants/theme";
import {
  getPremiumOnboardingSettings,
  savePremiumOnboarding,
} from "@/db/repositories/onboarding-settings";
import { useAppPalette } from "@/hooks/useAppPalette";
import { pickBusinessImage } from "@/services/image-picker";
import type {
  BusinessType,
  InvoiceTemplate,
  NotificationPreference,
  OnboardingPaymentMethod,
  PremiumOnboardingInput,
} from "@/types/onboarding";

const totalSteps = 15;
const productCategories = [
  "Retail",
  "Wholesale",
  "Distributor",
  "Manufacturer",
  "Reseller",
];
const serviceCategories = [
  "Mobile Repair",
  "Computer Repair",
  "Digital Agency",
  "Freelancer",
  "Salon",
  "Plumber",
  "AC Service",
  "Professional",
  "Creative",
  "Education",
  "Healthcare",
  "Beauty",
  "Home Service",
  "Other",
];
const templates: InvoiceTemplate[] = [
  "classic",
  "modern",
  "minimal",
  "retail",
  "service",
  "corporate",
  "gst_pro",
  "thermal",
];
const defaultDraft: PremiumOnboardingInput = {
  businessType: "both",
  businessCategory: "Retail",
  businessName: "",
  ownerName: "",
  logoUri: null,
  phone: "",
  email: "",
  website: "",
  gstin: "",
  pan: "",
  address: "",
  stateName: "",
  stateCode: "",
  pincode: "",
  taxEnabled: false,
  gstType: "unregistered",
  invoiceTemplate: "modern",
  invoicePageSize: "a4",
  currencyCode: "INR",
  invoicePrefix: "INV",
  estimatePrefix: "EST",
  quotationPrefix: "QT",
  paymentTermsDays: 0,
  paymentMethods: ["cash", "upi"],
  paymentQrUri: null,
  signatureUri: null,
  notificationPreferences: ["low_stock", "due_payments", "backup_reminder"],
};

type IconName = ComponentProps<typeof Ionicons>["name"];

export function PremiumOnboarding() {
  const palette = useAppPalette();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(defaultDraft);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let active = true;
    void getPremiumOnboardingSettings().then((settings) => {
      if (!active || !settings) return;
      setEditing(true);
      setDraft(settings);
    });
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof PremiumOnboardingInput>(
    key: K,
    value: PremiumOnboardingInput[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function canContinue(): boolean {
    if (step === 2 && !draft.businessType) return false;
    if (step === 3 && !draft.businessCategory.trim()) return false;
    if (step === 4 && !draft.businessName.trim()) return false;
    if (step === 5 && draft.phone && !/^\d{10}$/.test(draft.phone))
      return false;
    if (step === 6 && draft.taxEnabled && draft.gstin.trim().length !== 15)
      return false;
    if (step === 9 && !draft.invoicePrefix.trim()) return false;
    if (step === 10 && draft.paymentMethods.length === 0) return false;
    return true;
  }

  async function choose(
    field: "logoUri" | "paymentQrUri" | "signatureUri",
    aspect: [number, number],
  ) {
    try {
      const uri = await pickBusinessImage({ aspect });
      if (uri) update(field, uri);
    } catch {
      Alert.alert("Image could not be selected", "Please try another image.");
    }
  }

  async function next() {
    if (!canContinue()) {
      Alert.alert(
        "Check this step",
        "Complete the required information before continuing.",
      );
      return;
    }
    if (step < totalSteps) {
      setStep((value) => value + 1);
      return;
    }
    setSaving(true);
    try {
      await savePremiumOnboarding(draft);
      router.replace(routes.dashboard);
    } catch {
      Alert.alert(
        "Setup could not be saved",
        "Your current screen is unchanged. Check the details and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: palette.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.progressHeader}>
          <View style={styles.progressCopy}>
            <Text style={[styles.stepLabel, { color: palette.primary }]}>
              STEP {step} OF {totalSteps}
            </Text>
            <Text style={[styles.progressPercent, { color: palette.muted }]}>
              {Math.round((step / totalSteps) * 100)}%
            </Text>
          </View>
          <View
            style={[styles.track, { backgroundColor: palette.surfaceVariant }]}
          >
            <View
              style={[
                styles.fill,
                {
                  width: `${(step / totalSteps) * 100}%`,
                  backgroundColor: palette.primary,
                },
              ]}
            />
          </View>
          {editing ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.close}
            >
              <Ionicons name="close" size={22} color={palette.muted} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderStep(step, draft, update, choose)}
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: palette.background,
              borderTopColor: palette.border,
            },
          ]}
        >
          {step > 1 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setStep((value) => value - 1)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={21} color={palette.text} />
              <Text style={[styles.backText, { color: palette.text }]}>
                Back
              </Text>
            </Pressable>
          ) : (
            <View style={styles.backButton} />
          )}
          <View style={styles.continueButton}>
            <Button
              label={
                step === 1
                  ? "Get Started"
                  : step === totalSteps
                    ? "Start Business"
                    : "Continue →"
              }
              loading={saving}
              onPress={() => void next()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function renderStep(
  step: number,
  draft: PremiumOnboardingInput,
  update: <K extends keyof PremiumOnboardingInput>(
    key: K,
    value: PremiumOnboardingInput[K],
  ) => void,
  choose: (
    field: "logoUri" | "paymentQrUri" | "signatureUri",
    aspect: [number, number],
  ) => Promise<void>,
): ReactNode {
  if (step === 1) return <Welcome />;
  if (step === 2)
    return (
      <BusinessTypeStep
        value={draft.businessType}
        onChange={(value) => {
          update("businessType", value);
          update("businessCategory", value === "service" ? "Repair" : "Retail");
        }}
      />
    );
  if (step === 3) {
    const options =
      draft.businessType === "product"
        ? productCategories
        : draft.businessType === "service"
          ? serviceCategories
          : [...productCategories, ...serviceCategories];
    return (
      <ChoiceStep
        title="Choose your business category"
        description="InvoiceFine will use this to prepare relevant workflows."
      >
        <ChoiceGrid
          options={options}
          value={draft.businessCategory}
          onChange={(value) => update("businessCategory", value)}
        />
      </ChoiceStep>
    );
  }
  if (step === 4)
    return (
      <Step
        title="Build your business identity"
        description="This information appears across your invoices and workspace."
      >
        <Input
          label="Business name"
          value={draft.businessName}
          onChangeText={(v) => update("businessName", v)}
          autoCapitalize="words"
        />
        <Input
          label="Owner name"
          helperText="Optional"
          value={draft.ownerName}
          onChangeText={(v) => update("ownerName", v)}
          autoCapitalize="words"
        />
        <PhotoField
          label="Business logo"
          value={draft.logoUri}
          onChoose={() => void choose("logoUri", [1, 1])}
          onRemove={() => update("logoUri", null)}
        />
      </Step>
    );
  if (step === 5)
    return (
      <Step
        title="Add business details"
        description="Keep customer communication and tax identity in one place."
      >
        <Input
          label="Phone"
          value={draft.phone}
          onChangeText={(v) => update("phone", v)}
          keyboardType="phone-pad"
          maxLength={10}
        />
        <Input
          label="Email"
          helperText="Optional"
          value={draft.email}
          onChangeText={(v) => update("email", v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Website"
          helperText="Optional"
          value={draft.website}
          onChangeText={(v) => update("website", v)}
          autoCapitalize="none"
        />
        <Input
          label="GSTIN"
          helperText="Required only for GST invoices"
          value={draft.gstin}
          onChangeText={(v) => update("gstin", v.toUpperCase())}
          autoCapitalize="characters"
          maxLength={15}
        />
        <Input
          label="PAN"
          helperText="Optional"
          value={draft.pan}
          onChangeText={(v) => update("pan", v.toUpperCase())}
          autoCapitalize="characters"
          maxLength={10}
        />
        <Input
          label="Address"
          value={draft.address}
          onChangeText={(v) => update("address", v)}
          multiline
        />
        <Input
          label="State"
          value={draft.stateName}
          onChangeText={(v) => update("stateName", v)}
        />
        <Input
          label="GST state code"
          helperText="Optional two-digit code"
          value={draft.stateCode}
          onChangeText={(v) => update("stateCode", v)}
          keyboardType="number-pad"
          maxLength={2}
        />
        <Input
          label="Pincode"
          value={draft.pincode}
          onChangeText={(v) => update("pincode", v)}
          keyboardType="number-pad"
          maxLength={6}
        />
      </Step>
    );
  if (step === 6)
    return (
      <Step
        title="Configure tax"
        description="Choose whether this business creates GST invoices."
      >
        <BinaryChoice
          first="GST registered"
          second="Not registered"
          firstSelected={draft.taxEnabled}
          onFirst={() => {
            update("taxEnabled", true);
            if (draft.gstType === "unregistered") update("gstType", "regular");
          }}
          onSecond={() => {
            update("taxEnabled", false);
            update("gstType", "unregistered");
          }}
        />
        {draft.taxEnabled ? (
          <ChoiceGrid
            options={["Regular", "Composition"]}
            value={draft.gstType === "regular" ? "Regular" : "Composition"}
            onChange={(v) =>
              update("gstType", v === "Regular" ? "regular" : "composition")
            }
          />
        ) : null}
      </Step>
    );
  if (step === 7) return <TemplateStep draft={draft} update={update} />;
  if (step === 8)
    return (
      <ChoiceStep
        title="Choose currency"
        description="INR is active now. More currencies are reserved for future localization."
      >
        <CurrencyCard symbol="₹" code="INR" selected />
        <CurrencyCard symbol="د.إ" code="AED" future />
        <CurrencyCard symbol="$" code="USD" future />
        <CurrencyCard symbol="€" code="EUR" future />
      </ChoiceStep>
    );
  if (step === 9)
    return (
      <Step
        title="Set business preferences"
        description="Use short prefixes that customers can recognize."
      >
        <Input
          label="Invoice prefix"
          value={draft.invoicePrefix}
          onChangeText={(v) => update("invoicePrefix", v)}
          autoCapitalize="characters"
          maxLength={10}
        />
        <Input
          label="Estimate prefix"
          value={draft.estimatePrefix}
          onChangeText={(v) => update("estimatePrefix", v)}
          autoCapitalize="characters"
          maxLength={10}
        />
        <Input
          label="Quotation prefix"
          value={draft.quotationPrefix}
          onChangeText={(v) => update("quotationPrefix", v)}
          autoCapitalize="characters"
          maxLength={10}
        />
        <TextChoice
          title="Payment terms"
          options={[
            { label: "Immediate", value: 0 },
            { label: "7 Days", value: 7 },
            { label: "15 Days", value: 15 },
            { label: "30 Days", value: 30 },
          ]}
          value={draft.paymentTermsDays}
          onChange={(value) => update("paymentTermsDays", value)}
        />
      </Step>
    );
  if (step === 10)
    return (
      <ToggleListStep
        title="Accept payment methods"
        description="Select every method your business accepts"
        options={[
          ["cash", "Cash"],
          ["upi", "UPI"],
          ["bank", "Bank"],
          ["card", "Card"],
          ["cheque", "Cheque"],
        ]}
        selected={draft.paymentMethods}
        onToggle={(value) =>
          update("paymentMethods", toggle(draft.paymentMethods, value))
        }
      />
    );
  if (step === 11)
    return (
      <ChoiceStep
        title="Add your UPI QR"
        description="It can appear on supported invoice templates."
      >
        <PhotoField
          label="UPI payment QR"
          value={draft.paymentQrUri}
          onChoose={() => void choose("paymentQrUri", [1, 1])}
          onRemove={() => update("paymentQrUri", null)}
        />
        <SkipHint />
      </ChoiceStep>
    );
  if (step === 12)
    return (
      <ChoiceStep
        title="Add your signature"
        description="Use a clear signature image with a plain background."
      >
        <PhotoField
          label="Authorized signature"
          value={draft.signatureUri}
          onChoose={() => void choose("signatureUri", [4, 1])}
          onRemove={() => update("signatureUri", null)}
        />
        <SkipHint />
      </ChoiceStep>
    );
  if (step === 13)
    return (
      <ToggleListStep
        title="Choose notifications"
        description="Preferences are saved now. System delivery will be enabled in the notification phase."
        options={[
          ["low_stock", "Low stock"],
          ["due_payments", "Due payments"],
          ["backup_reminder", "Backup reminder"],
          ["daily_report", "Daily report"],
          ["weekly_report", "Weekly report"],
        ]}
        selected={draft.notificationPreferences}
        onToggle={(value) =>
          update(
            "notificationPreferences",
            toggle(draft.notificationPreferences, value),
          )
        }
      />
    );
  if (step === 14) return <PermissionsStep />;
  return <ReadyStep draft={draft} />;
}

function Welcome() {
  return (
    <Step
      title="Welcome to InvoiceFine"
      description="Run your entire business offline."
    >
      <View style={styles.heroMark}>
        <Ionicons name="receipt" size={38} color="#FFFFFF" />
      </View>
      {["Invoices", "Customers", "Stock", "Reports", "Profit"].map((item) => (
        <Feature key={item} label={item} />
      ))}
    </Step>
  );
}
function BusinessTypeStep({
  value,
  onChange,
}: {
  value: BusinessType;
  onChange: (value: BusinessType) => void;
}) {
  return (
    <ChoiceStep
      title="What do you sell?"
      description="This selection changes terminology and available business workflows."
    >
      <ModeCard
        icon="cube-outline"
        title="Product Business"
        examples="Kirana · Medical · Electronics · Hardware · Garments · Mobile Shop"
        selected={value === "product"}
        onPress={() => onChange("product")}
      />
      <ModeCard
        icon="construct-outline"
        title="Service Business"
        examples="Repair · Salon · Agency · Freelancer · Consultant · Coaching"
        selected={value === "service"}
        onPress={() => onChange("service")}
      />
      <ModeCard
        icon="layers-outline"
        title="Both"
        examples="Products + Services"
        selected={value === "both"}
        onPress={() => onChange("both")}
      />
    </ChoiceStep>
  );
}
function TemplateStep({
  draft,
  update,
}: {
  draft: PremiumOnboardingInput;
  update: <K extends keyof PremiumOnboardingInput>(
    key: K,
    value: PremiumOnboardingInput[K],
  ) => void;
}) {
  return (
    <ChoiceStep
      title="Choose invoice style"
      description="Preview the visual identity before continuing."
    >
      <View style={styles.templateGrid}>
        {templates.map((item) => (
          <TemplateCard
            key={item}
            value={item}
            selected={draft.invoiceTemplate === item}
            onPress={() => update("invoiceTemplate", item)}
          />
        ))}
      </View>
      <TextChoice
        title="Page size"
        options={[
          { label: "A4", value: "a4" as const },
          { label: "4 × 6", value: "4x6" as const },
        ]}
        value={draft.invoicePageSize}
        onChange={(value) => update("invoicePageSize", value)}
      />
    </ChoiceStep>
  );
}
function PermissionsStep() {
  return (
    <ChoiceStep
      title="Permissions, only when needed"
      description="InvoiceFine does not request camera access during onboarding."
    >
      <Permission
        icon="images-outline"
        title="Photos"
        caption="Requested only when you choose a logo, QR, or signature."
      />
      <Permission
        icon="notifications-outline"
        title="Notifications"
        caption="Will be requested when notification delivery is enabled."
      />
      <Permission
        icon="folder-outline"
        title="Storage"
        caption="Modern Android app storage needs no broad storage permission."
      />
    </ChoiceStep>
  );
}
function ReadyStep({ draft }: { draft: PremiumOnboardingInput }) {
  const type =
    draft.businessType === "product"
      ? "Products"
      : draft.businessType === "service"
        ? "Services"
        : "Products + Services";
  return (
    <ChoiceStep
      title="You're ready"
      description="Review the setup that will shape InvoiceFine."
    >
      <Summary label="Business" value={draft.businessName || "Your business"} />
      <Summary
        label="Invoice style"
        value={labelTemplate(draft.invoiceTemplate)}
      />
      <Summary
        label="GST"
        value={draft.taxEnabled ? "Enabled" : "Not registered"}
      />
      <Summary label="UPI" value={draft.paymentQrUri ? "Ready" : "Skipped"} />
      <Summary label={type} value="Enabled" />
      <Summary label="Reports" value="Ready" />
    </ChoiceStep>
  );
}
function Step({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const p = useAppPalette();
  return (
    <View style={styles.step}>
      <Text style={[styles.title, { color: p.text }]}>{title}</Text>
      <Text style={[styles.description, { color: p.muted }]}>
        {description}
      </Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}
function ChoiceStep(props: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return <Step {...props} />;
}
function ModeCard({
  icon,
  title,
  examples,
  selected,
  onPress,
}: {
  icon: IconName;
  title: string;
  examples: string;
  selected: boolean;
  onPress: () => void;
}) {
  const p = useAppPalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.modeCard,
        {
          backgroundColor: selected ? p.primarySoft : p.surface,
          borderColor: selected ? p.primary : p.border,
        },
      ]}
    >
      <View
        style={[
          styles.modeIcon,
          { backgroundColor: selected ? p.primary : p.surfaceVariant },
        ]}
      >
        <Ionicons
          name={icon}
          size={27}
          color={selected ? p.textOnPrimary : p.primary}
        />
      </View>
      <View style={styles.modeCopy}>
        <Text style={[styles.modeTitle, { color: p.text }]}>{title}</Text>
        <Text style={[styles.modeExamples, { color: p.muted }]}>
          {examples}
        </Text>
      </View>
      <Ionicons
        name={selected ? "checkmark-circle" : "ellipse-outline"}
        size={24}
        color={selected ? p.primary : p.muted}
      />
    </Pressable>
  );
}
function ChoiceGrid({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const p = useAppPalette();
  return (
    <View style={styles.choiceGrid}>
      {options.map((item) => {
        const selected = value.toLowerCase() === item.toLowerCase();
        return (
          <Pressable
            key={item}
            accessibilityRole="button"
            onPress={() => onChange(item)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? p.primary : p.surface,
                borderColor: selected ? p.primary : p.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: selected ? p.textOnPrimary : p.text },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
function BinaryChoice({
  first,
  second,
  firstSelected,
  onFirst,
  onSecond,
}: {
  first: string;
  second: string;
  firstSelected: boolean;
  onFirst: () => void;
  onSecond: () => void;
}) {
  return (
    <ChoiceGrid
      options={[first, second]}
      value={firstSelected ? first : second}
      onChange={(v) => (v === first ? onFirst() : onSecond())}
    />
  );
}
function TemplateCard({
  value,
  selected,
  onPress,
}: {
  value: InvoiceTemplate;
  selected: boolean;
  onPress: () => void;
}) {
  const p = useAppPalette();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.template,
        {
          backgroundColor: p.surface,
          borderColor: selected ? p.primary : p.border,
        },
      ]}
    >
      <View style={[styles.paper, { backgroundColor: p.surfaceVariant }]}>
        <View style={[styles.paperBrand, { backgroundColor: p.primary }]} />
        <View style={[styles.paperLine, { backgroundColor: p.borderStrong }]} />
        <View
          style={[styles.paperLineSmall, { backgroundColor: p.borderStrong }]}
        />
      </View>
      <Text
        style={[styles.templateText, { color: selected ? p.primary : p.text }]}
      >
        {labelTemplate(value)}
      </Text>
      {selected ? (
        <Ionicons name="checkmark-circle" size={19} color={p.primary} />
      ) : null}
    </Pressable>
  );
}
function TextChoice<T extends string | number>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const p = useAppPalette();
  return (
    <View style={styles.textChoice}>
      <Text style={[styles.fieldLabel, { color: p.text }]}>{title}</Text>
      <View style={styles.choiceGrid}>
        {options.map((item) => {
          const selected = item.value === value;
          return (
            <Pressable
              key={String(item.value)}
              onPress={() => onChange(item.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? p.primary : p.surface,
                  borderColor: selected ? p.primary : p.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? p.textOnPrimary : p.text },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
function ToggleListStep<T extends string>({
  title,
  description,
  options,
  selected,
  onToggle,
}: {
  title: string;
  description: string;
  options: [T, string][];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <ChoiceStep title={title} description={description}>
      {options.map(([value, label]) => (
        <ToggleRow
          key={value}
          label={label}
          selected={selected.includes(value)}
          onPress={() => onToggle(value)}
        />
      ))}
    </ChoiceStep>
  );
}
function ToggleRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const p = useAppPalette();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[
        styles.toggleRow,
        {
          backgroundColor: p.surface,
          borderColor: selected ? p.primary : p.border,
        },
      ]}
    >
      <Text style={[styles.toggleLabel, { color: p.text }]}>{label}</Text>
      <Ionicons
        name={selected ? "checkbox" : "square-outline"}
        size={25}
        color={selected ? p.primary : p.muted}
      />
    </Pressable>
  );
}
function PhotoField({
  label,
  value,
  onChoose,
  onRemove,
}: {
  label: string;
  value: string | null;
  onChoose: () => void;
  onRemove: () => void;
}) {
  const p = useAppPalette();
  return (
    <View
      style={[
        styles.photo,
        { backgroundColor: p.surface, borderColor: p.border },
      ]}
    >
      {value ? (
        <Image source={{ uri: value }} style={styles.photoPreview} />
      ) : (
        <View
          style={[
            styles.photoPlaceholder,
            { backgroundColor: p.surfaceVariant },
          ]}
        >
          <Ionicons name="image-outline" size={34} color={p.muted} />
        </View>
      )}
      <Text style={[styles.fieldLabel, { color: p.text }]}>{label}</Text>
      <View style={styles.photoActions}>
        <Button
          label={value ? "Change" : "Upload"}
          variant="secondary"
          onPress={onChoose}
        />
        {value ? (
          <Button label="Remove" variant="secondary" onPress={onRemove} />
        ) : null}
      </View>
    </View>
  );
}
function CurrencyCard({
  symbol,
  code,
  selected = false,
  future = false,
}: {
  symbol: string;
  code: string;
  selected?: boolean;
  future?: boolean;
}) {
  const p = useAppPalette();
  return (
    <View
      style={[
        styles.currency,
        {
          backgroundColor: p.surface,
          borderColor: selected ? p.primary : p.border,
        },
        future && styles.future,
      ]}
    >
      <Text
        style={[
          styles.currencySymbol,
          { color: selected ? p.primary : p.text },
        ]}
      >
        {symbol}
      </Text>
      <Text style={[styles.currencyCode, { color: p.text }]}>{code}</Text>
      {future ? (
        <Text style={[styles.futureText, { color: p.muted }]}>Future</Text>
      ) : (
        <Ionicons name="checkmark-circle" size={20} color={p.primary} />
      )}
    </View>
  );
}
function Permission({
  icon,
  title,
  caption,
}: {
  icon: IconName;
  title: string;
  caption: string;
}) {
  const p = useAppPalette();
  return (
    <View
      style={[
        styles.permission,
        { backgroundColor: p.surface, borderColor: p.border },
      ]}
    >
      <View style={[styles.permissionIcon, { backgroundColor: p.primarySoft }]}>
        <Ionicons name={icon} size={22} color={p.primary} />
      </View>
      <View style={styles.modeCopy}>
        <Text style={[styles.modeTitle, { color: p.text }]}>{title}</Text>
        <Text style={[styles.modeExamples, { color: p.muted }]}>{caption}</Text>
      </View>
    </View>
  );
}
function Summary({ label, value }: { label: string; value: string }) {
  const p = useAppPalette();
  return (
    <View style={[styles.summary, { borderBottomColor: p.border }]}>
      <Text style={[styles.summaryLabel, { color: p.muted }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: p.text }]}>{value}</Text>
      <Ionicons name="checkmark-circle" size={21} color={p.positive} />
    </View>
  );
}
function Feature({ label }: { label: string }) {
  const p = useAppPalette();
  return (
    <View style={styles.feature}>
      <Ionicons name="checkmark-circle" size={22} color={p.positive} />
      <Text style={[styles.featureText, { color: p.text }]}>{label}</Text>
    </View>
  );
}
function SkipHint() {
  const p = useAppPalette();
  return (
    <Text style={[styles.skip, { color: p.muted }]}>
      You can safely skip this and add it later.
    </Text>
  );
}
function toggle<T>(items: T[], value: T) {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];
}
function labelTemplate(value: InvoiceTemplate) {
  return value === "gst_pro"
    ? "GST Pro"
    : value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  progressHeader: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12 },
  progressCopy: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepLabel: { ...theme.typography.eyebrow },
  progressPercent: { ...theme.typography.caption },
  track: { height: 6, borderRadius: 99, overflow: "hidden", marginTop: 9 },
  fill: { height: "100%", borderRadius: 99 },
  close: {
    position: "absolute",
    right: 14,
    top: 36,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
  },
  footer: {
    minHeight: 78,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 88,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: { ...theme.typography.label },
  continueButton: { flex: 1 },
  step: { gap: 8 },
  title: { fontSize: 32, lineHeight: 39, fontWeight: "700" },
  description: { ...theme.typography.body },
  body: { gap: 14, marginTop: 18 },
  heroMark: {
    width: 74,
    height: 74,
    borderRadius: 24,
    backgroundColor: "#D93632",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 34,
  },
  featureText: { ...theme.typography.body, fontWeight: "600" },
  modeCard: {
    minHeight: 112,
    padding: 16,
    borderWidth: 1.5,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  modeIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modeCopy: { flex: 1 },
  modeTitle: { ...theme.typography.body, fontWeight: "700" },
  modeExamples: { ...theme.typography.caption, marginTop: 4 },
  choiceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  chip: {
    minHeight: 46,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 15,
  },
  chipText: { ...theme.typography.label, fontWeight: "700" },
  templateGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  template: {
    width: "48%",
    padding: 10,
    borderWidth: 1.5,
    borderRadius: 18,
    gap: 8,
  },
  paper: { height: 88, borderRadius: 10, padding: 10, gap: 8 },
  paperBrand: { width: "46%", height: 8, borderRadius: 4 },
  paperLine: { width: "100%", height: 5, borderRadius: 3, marginTop: 8 },
  paperLineSmall: { width: "70%", height: 5, borderRadius: 3 },
  templateText: { ...theme.typography.label, fontWeight: "700" },
  textChoice: { gap: 9 },
  fieldLabel: { ...theme.typography.label, fontWeight: "700" },
  toggleRow: {
    minHeight: 60,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: { ...theme.typography.body, fontWeight: "600" },
  photo: { padding: 16, borderWidth: 1, borderRadius: 22, gap: 12 },
  photoPreview: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    borderRadius: 14,
  },
  photoPlaceholder: {
    height: 140,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  photoActions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  currency: {
    minHeight: 72,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  currencySymbol: { width: 42, fontSize: 26, fontWeight: "700" },
  currencyCode: { flex: 1, ...theme.typography.body, fontWeight: "700" },
  future: { opacity: 0.58 },
  futureText: { ...theme.typography.caption },
  permission: {
    minHeight: 82,
    padding: 14,
    borderWidth: 1,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  permissionIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: {
    minHeight: 62,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryLabel: { width: 105, ...theme.typography.secondary },
  summaryValue: { flex: 1, ...theme.typography.body, fontWeight: "700" },
  skip: { textAlign: "center", ...theme.typography.secondary },
});
