import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Switch, View } from "react-native";
import {
  SettingsHeader,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/SettingsUI";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  getNotificationSettings,
  saveNotificationSettings,
} from "@/db/repositories/app-settings";
import { useAppPalette } from "@/hooks/useAppPalette";
import {
  getNotificationPermissionState,
  isNotificationRuntimeSupported,
  requestNotificationPermission,
  sendTestNotification,
  syncNotificationSchedule,
} from "@/services/notifications";
import type { NotificationPreference } from "@/types/onboarding";
import type { NotificationPermissionState } from "@/types/reminder";
const options: Array<{
  key: NotificationPreference;
  label: string;
  description: string;
  icon: "cash-outline" | "cube-outline" | "today-outline" | "calendar-outline";
}> = [
  {
    key: "due_payments",
    label: "Due Payments",
    description: "Daily 9:00 AM summary when invoices are due",
    icon: "cash-outline",
  },
  {
    key: "low_stock",
    label: "Low Stock",
    description: "Daily 9:15 AM summary when stock is low",
    icon: "cube-outline",
  },
  {
    key: "daily_report",
    label: "Daily Summary",
    description: "Sales and payments summary at 8:00 PM",
    icon: "today-outline",
  },
  {
    key: "weekly_report",
    label: "Weekly Report",
    description: "Seven-day summary on Monday at 9:00 AM",
    icon: "calendar-outline",
  },
];
export default function NotificationSettingsScreen() {
  const router = useRouter(),
    p = useAppPalette();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]),
    [permission, setPermission] =
      useState<NotificationPermissionState>("undetermined"),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    void Promise.all([
      getNotificationSettings(),
      getNotificationPermissionState(),
    ])
      .then(([settings, state]) => {
        if (active) {
          setPreferences(settings.preferences);
          setPermission(state);
        }
      })
      .catch(() =>
        Alert.alert("Settings unavailable", "Try opening this page again."),
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  function toggle(key: NotificationPreference) {
    setPreferences((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }
  async function enable() {
    if (!isNotificationRuntimeSupported) {
      Alert.alert(
        "Development build required",
        "Expo Go cannot load Android notifications in SDK 57. Your preferences and service reminders remain saved, but delivery requires an InvoiceFine development or preview build.",
      );
      return;
    }
    setSaving(true);
    try {
      const next = await requestNotificationPermission();
      setPermission(next);
      if (next === "granted") {
        const summary = await syncNotificationSchedule();
        Alert.alert(
          "Notifications enabled",
          `${summary.scheduled} local reminder${summary.scheduled === 1 ? "" : "s"} scheduled.`,
        );
      } else
        Alert.alert(
          "Permission not granted",
          "You can enable notifications later from Android App Settings.",
        );
    } catch {
      Alert.alert(
        "Could not enable notifications",
        "Try again from Android App Settings.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function save() {
    setSaving(true);
    try {
      await saveNotificationSettings(preferences);
      const summary =
        permission === "granted" ? await syncNotificationSchedule() : null;
      Alert.alert(
        "Preferences saved",
        !isNotificationRuntimeSupported
          ? "Preferences saved. Android notification delivery requires an InvoiceFine development or preview build; Expo Go remains usable without delivery."
          : summary
            ? `${summary.scheduled} local reminder${summary.scheduled === 1 ? "" : "s"} scheduled. ${summary.overdue} service reminder${summary.overdue === 1 ? " is" : "s are"} overdue.`
            : "Enable Android notifications to schedule delivery.",
      );
    } catch {
      Alert.alert(
        "Could not save",
        "Your notification preferences were not changed.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (loading) return <LoadingState label="Loading notification settings…" />;
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SettingsHeader
        title="Notifications"
        subtitle="Local business alerts and customer service reminders."
        onBack={() => router.back()}
      />
      <SettingsSection title="ANDROID DELIVERY">
        <SettingsRow
          icon={
            permission === "unsupported"
              ? "build-outline"
              : permission === "granted"
                ? "checkmark-circle-outline"
                : "notifications-outline"
          }
          label={
            permission === "unsupported"
              ? "Development build required"
              : permission === "granted"
                ? "Notifications enabled"
                : "Enable notifications"
          }
          description={
            permission === "unsupported"
              ? "Expo Go stays usable; local delivery is disabled to prevent an SDK 57 startup crash"
              : permission === "granted"
                ? "Local scheduling is active on this device"
                : "Permission is requested only when you press Enable"
          }
          value={
            permission === "unsupported" ? "EXPO GO" : permission.toUpperCase()
          }
          onPress={
            permission === "granted" || permission === "unsupported"
              ? undefined
              : () => void enable()
          }
        />
      </SettingsSection>
      <SettingsSection
        title="BUSINESS SCHEDULES"
        description="Schedules refresh when InvoiceFine opens or preferences change."
      >
        {options.map((option, index) => (
          <SettingsRow
            key={option.key}
            index={index}
            icon={option.icon}
            label={option.label}
            description={option.description}
            trailing={
              <Switch
                accessibilityLabel={option.label}
                value={preferences.includes(option.key)}
                onValueChange={() => toggle(option.key)}
                trackColor={{ false: p.borderStrong, true: p.primarySoftText }}
                thumbColor={
                  preferences.includes(option.key) ? p.primary : p.surface
                }
              />
            }
          />
        ))}
      </SettingsSection>
      <SettingsSection title="SERVICE BUSINESSES">
        <SettingsRow
          icon="alarm-outline"
          label="Customer Service Reminders"
          description="Customer, service, date, time and recurring follow-ups"
          badge={isNotificationRuntimeSupported ? "READY" : "SAVES ONLY"}
          onPress={() => router.push("/settings/reminders")}
        />
      </SettingsSection>
      <View style={styles.actions}>
        <Button
          label={
            isNotificationRuntimeSupported
              ? "Save & Refresh Schedule"
              : "Save Preferences"
          }
          loading={saving}
          onPress={() => void save()}
        />
        <Button
          label="Send Test Notification"
          variant="secondary"
          disabled={
            !isNotificationRuntimeSupported ||
            permission !== "granted" ||
            saving
          }
          onPress={() =>
            void sendTestNotification().catch(() =>
              Alert.alert(
                "Test failed",
                "A local notification could not be shown.",
              ),
            )
          }
        />
      </View>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  content: { gap: 22 },
  actions: { gap: 10 },
});
