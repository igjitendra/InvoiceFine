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
import type { NotificationPreference } from "@/types/onboarding";

const options: Array<{
  key: NotificationPreference;
  label: string;
  description: string;
  icon: "cash-outline" | "cube-outline" | "today-outline" | "calendar-outline";
}> = [
  {
    key: "due_payments",
    label: "Due Payments",
    description: "Remember customers with outstanding invoices",
    icon: "cash-outline",
  },
  {
    key: "low_stock",
    label: "Low Stock",
    description: "Watch products that reach their low-stock threshold",
    icon: "cube-outline",
  },
  {
    key: "daily_report",
    label: "Daily Summary",
    description: "Preference for an end-of-day business summary",
    icon: "today-outline",
  },
  {
    key: "weekly_report",
    label: "Weekly Report",
    description: "Preference for a weekly performance summary",
    icon: "calendar-outline",
  },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const palette = useAppPalette();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void getNotificationSettings()
      .then((value) => {
        if (active) setPreferences(value.preferences);
      })
      .catch(() => {
        if (active) {
          Alert.alert(
            "Preferences unavailable",
            "Try opening this page again.",
          );
        }
      })
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

  async function save() {
    setSaving(true);
    try {
      await saveNotificationSettings(preferences);
      Alert.alert(
        "Preferences saved",
        "Delivery scheduling will be enabled in the notification engine phase.",
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

  if (loading) return <LoadingState label="Loading preferences…" />;

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SettingsHeader
        title="Notifications"
        subtitle="Choose useful business reminders without enabling delivery yet."
        onBack={() => router.back()}
      />
      <SettingsSection
        title="PREFERENCES"
        description="These choices are saved now. Android permission and scheduling arrive in Phase 14F."
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
                trackColor={{
                  false: palette.borderStrong,
                  true: palette.primarySoftText,
                }}
                thumbColor={
                  preferences.includes(option.key)
                    ? palette.primary
                    : palette.surface
                }
              />
            }
          />
        ))}
      </SettingsSection>
      <SettingsSection title="SERVICE BUSINESSES">
        <SettingsRow
          icon="alarm-outline"
          label="Customer Service Reminder"
          description="Customer-specific date, repeat schedule and service notes"
          badge="PHASE 14F"
          disabled
        />
      </SettingsSection>
      <View style={styles.action}>
        <Button
          label="Save Preferences"
          loading={saving}
          onPress={() => void save()}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 22 },
  action: { marginTop: 2 },
});
