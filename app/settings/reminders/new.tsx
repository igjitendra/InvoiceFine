import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import {
  SettingsHeader,
  SettingsSection,
} from "@/components/settings/SettingsUI";
import { AppText as Text } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { listCatalogItems } from "@/db/repositories/catalog";
import { listCustomers } from "@/db/repositories/customers";
import { createServiceReminder } from "@/db/repositories/reminders";
import { useAppPalette } from "@/hooks/useAppPalette";
import {
  getNotificationPermissionState,
  syncNotificationSchedule,
} from "@/services/notifications";
import type { CatalogItem } from "@/types/catalog";
import type { Customer } from "@/types/customer";
import type { ServiceReminderRecurrence } from "@/types/reminder";
const recurrence: Array<{ value: ServiceReminderRecurrence; label: string }> = [
  { value: "none", label: "Once" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "3 months" },
  { value: "half_yearly", label: "6 months" },
  { value: "yearly", label: "Yearly" },
];
function localParts() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  const y = d.getFullYear(),
    m = String(d.getMonth() + 1).padStart(2, "0"),
    day = String(d.getDate()).padStart(2, "0");
  return { date: `${y}-${m}-${day}`, time: "09:00" };
}
export default function NewServiceReminderScreen() {
  const router = useRouter(),
    p = useAppPalette(),
    defaults = useMemo(localParts, []);
  const [customers, setCustomers] = useState<Customer[]>([]),
    [services, setServices] = useState<CatalogItem[]>([]),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [customerSearch, setCustomerSearch] = useState(""),
    [serviceSearch, setServiceSearch] = useState(""),
    [customerId, setCustomerId] = useState(""),
    [itemId, setItemId] = useState<string | null>(null),
    [title, setTitle] = useState("Service follow-up"),
    [notes, setNotes] = useState(""),
    [date, setDate] = useState(defaults.date),
    [time, setTime] = useState(defaults.time),
    [repeat, setRepeat] = useState<ServiceReminderRecurrence>("none");
  useEffect(() => {
    let active = true;
    void Promise.all([listCustomers(""), listCatalogItems("", "service")])
      .then(([c, s]) => {
        if (active) {
          setCustomers(c);
          setServices(s);
        }
      })
      .catch(() =>
        Alert.alert(
          "Data unavailable",
          "Customers and services could not be loaded.",
        ),
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const shownCustomers = customers
      .filter((c) =>
        `${c.name} ${c.phone ?? ""}`
          .toLowerCase()
          .includes(customerSearch.toLowerCase()),
      )
      .slice(0, 8),
    shownServices = services
      .filter((s) => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
      .slice(0, 8);
  async function save() {
    if (!customerId) {
      Alert.alert(
        "Choose a customer",
        "A service reminder must belong to a customer.",
      );
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert("Check date and time", "Use YYYY-MM-DD and HH:mm.");
      return;
    }
    const when = new Date(`${date}T${time}:00`);
    if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      Alert.alert(
        "Choose a future time",
        "Reminder time must be in the future.",
      );
      return;
    }
    setSaving(true);
    try {
      await createServiceReminder({
        customerId,
        itemId,
        title,
        notes,
        remindAt: when.toISOString(),
        recurrence: repeat,
      });
      const permission = await getNotificationPermissionState();
      if (permission === "granted") await syncNotificationSchedule();
      Alert.alert(
        "Reminder saved",
        permission === "granted"
          ? "The local notification has been scheduled."
          : "Enable Android notifications from Notification Settings to schedule delivery.",
      );
      router.back();
    } catch {
      Alert.alert(
        "Reminder not saved",
        "Check the customer, service, date and title.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (loading) return <LoadingState label="Loading customers and services…" />;
  return (
    <ScreenContainer keyboardAware contentContainerStyle={styles.content}>
      <SettingsHeader
        title="New Service Reminder"
        subtitle="Schedule a customer follow-up without cloud sync."
        onBack={() => router.back()}
      />
      <SettingsSection title="CUSTOMER">
        <View style={styles.pad}>
          <Input
            label="Search customer"
            value={customerSearch}
            onChangeText={setCustomerSearch}
          />
          {shownCustomers.map((c) => (
            <Choice
              key={c.id}
              label={c.name}
              description={c.phone ?? "No phone"}
              selected={customerId === c.id}
              onPress={() => setCustomerId(c.id)}
            />
          ))}
        </View>
      </SettingsSection>
      <SettingsSection title="SERVICE" description="Optional">
        <View style={styles.pad}>
          <Input
            label="Search service"
            value={serviceSearch}
            onChangeText={setServiceSearch}
          />
          <Choice
            label="No specific service"
            description="General customer follow-up"
            selected={itemId === null}
            onPress={() => setItemId(null)}
          />
          {shownServices.map((s) => (
            <Choice
              key={s.id}
              label={s.name}
              description={s.hsnSacCode ? `SAC ${s.hsnSacCode}` : "SAC pending"}
              selected={itemId === s.id}
              onPress={() => {
                setItemId(s.id);
                if (title === "Service follow-up")
                  setTitle(`${s.name} follow-up`);
              }}
            />
          ))}
        </View>
      </SettingsSection>
      <SettingsSection title="REMINDER">
        <View style={styles.pad}>
          <Input label="Title" value={title} onChangeText={setTitle} />
          <View style={styles.dateRow}>
            <View style={styles.flex}>
              <Input
                label="Date"
                helperText="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
              />
            </View>
            <View style={styles.time}>
              <Input
                label="Time"
                helperText="HH:mm"
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>
          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </SettingsSection>
      <SettingsSection title="REPEAT">
        <View style={styles.chips}>
          {recurrence.map((r) => (
            <Pressable
              key={r.value}
              onPress={() => setRepeat(r.value)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    repeat === r.value ? p.primary : p.surfaceVariant,
                },
              ]}
            >
              <Text
                style={{
                  color: repeat === r.value ? p.textOnPrimary : p.text,
                  fontWeight: "700",
                }}
              >
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </SettingsSection>
      <Button
        label="Save Reminder"
        loading={saving}
        onPress={() => void save()}
      />
    </ScreenContainer>
  );
}
function Choice({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  const p = useAppPalette();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.choice,
        {
          borderColor: selected ? p.primary : p.border,
          backgroundColor: selected ? p.primarySoft : p.surfaceVariant,
        },
      ]}
    >
      <View style={styles.flex}>
        <Text style={{ color: p.text, fontWeight: "700" }}>{label}</Text>
        <Text style={{ color: p.muted }}>{description}</Text>
      </View>
      <Text
        style={{ color: selected ? p.primary : p.muted, fontWeight: "700" }}
      >
        {selected ? "SELECTED" : "SELECT"}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  content: { gap: 18 },
  pad: { padding: 14, gap: 10 },
  choice: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  flex: { flex: 1 },
  dateRow: { flexDirection: "row", gap: 10 },
  time: { width: 120 },
  chips: { padding: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});
