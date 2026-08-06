import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import {
  SettingsHeader,
  SettingsSection,
} from "@/components/settings/SettingsUI";
import { AppText as Text } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  cancelServiceReminder,
  completeServiceReminder,
  listServiceReminders,
} from "@/db/repositories/reminders";
import { useAppPalette } from "@/hooks/useAppPalette";
import { formatReminderLocal } from "@/lib/reminders";
import {
  cancelReminderNotification,
  syncNotificationSchedule,
} from "@/services/notifications";
import type { ServiceReminder } from "@/types/reminder";
export default function ServiceRemindersScreen() {
  const router = useRouter(),
    p = useAppPalette();
  const [rows, setRows] = useState<ServiceReminder[]>([]),
    [loading, setLoading] = useState(true),
    [busyId, setBusyId] = useState<string | null>(null);
  async function load() {
    try {
      setRows(await listServiceReminders());
    } catch {
      Alert.alert("Reminders unavailable", "Try opening this page again.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function act(row: ServiceReminder, action: "complete" | "cancel") {
    setBusyId(row.id);
    try {
      await cancelReminderNotification(row.notificationId);
      if (action === "complete") await completeServiceReminder(row.id);
      else await cancelServiceReminder(row.id);
      await syncNotificationSchedule();
      await load();
    } catch {
      Alert.alert("Reminder not changed", "Try again.");
    } finally {
      setBusyId(null);
    }
  }
  if (loading) return <LoadingState label="Loading reminders…" />;
  const pending = rows.filter((r) => r.status === "pending"),
    history = rows.filter((r) => r.status !== "pending");
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SettingsHeader
        title="Service Reminders"
        subtitle="Customer follow-ups and recurring service dates."
        onBack={() => router.back()}
      />
      <Button
        label="New Service Reminder"
        onPress={() => router.push("/settings/reminders/new")}
      />
      <SettingsSection
        title="UPCOMING"
        description={`${pending.length} pending reminder${pending.length === 1 ? "" : "s"}`}
      >
        {pending.length ? (
          pending.map((row, index) => (
            <ReminderRow
              key={row.id}
              row={row}
              index={index}
              busy={busyId === row.id}
              onComplete={() => void act(row, "complete")}
              onCancel={() => void act(row, "cancel")}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={{ color: p.muted }}>
              No pending service reminders.
            </Text>
          </View>
        )}
      </SettingsSection>
      {history.length ? (
        <SettingsSection title="HISTORY">
          {history.slice(0, 20).map((row, index) => (
            <ReminderRow key={row.id} row={row} index={index} />
          ))}
        </SettingsSection>
      ) : null}
    </ScreenContainer>
  );
}
function ReminderRow({
  row,
  index,
  busy,
  onComplete,
  onCancel,
}: {
  row: ServiceReminder;
  index: number;
  busy?: boolean;
  onComplete?: () => void;
  onCancel?: () => void;
}) {
  const p = useAppPalette(),
    overdue =
      row.status === "pending" &&
      new Date(row.remindAt).getTime() <= Date.now();
  return (
    <View
      style={[
        styles.row,
        index > 0 && { borderTopWidth: 1, borderTopColor: p.border },
      ]}
    >
      <View style={styles.copy}>
        <View style={styles.line}>
          <Text style={{ color: p.text, fontWeight: "700", flex: 1 }}>
            {row.title}
          </Text>
          <Text
            style={{
              color:
                row.status === "pending"
                  ? overdue
                    ? p.danger
                    : p.primary
                  : p.muted,
              fontWeight: "700",
            }}
          >
            {overdue ? "OVERDUE" : row.status.toUpperCase()}
          </Text>
        </View>
        <Text style={{ color: p.text }}>
          {row.customerName}
          {row.serviceName ? ` · ${row.serviceName}` : ""}
        </Text>
        <Text style={{ color: p.muted }}>
          {formatReminderLocal(row.remindAt)} ·{" "}
          {row.recurrence.replace("_", " ")}
        </Text>
        {row.notes ? <Text style={{ color: p.muted }}>{row.notes}</Text> : null}
      </View>
      {row.status === "pending" ? (
        <View style={styles.actions}>
          <Pressable disabled={busy} onPress={onComplete}>
            <Text style={{ color: p.primary, fontWeight: "700" }}>
              {row.recurrence === "none" ? "Complete" : "Complete & advance"}
            </Text>
          </Pressable>
          <Pressable disabled={busy} onPress={onCancel}>
            <Text style={{ color: p.danger, fontWeight: "700" }}>Cancel</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  content: { gap: 18 },
  row: { padding: 14, gap: 10 },
  copy: { gap: 3 },
  line: { flexDirection: "row", gap: 8 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  empty: { padding: 20, alignItems: "center" },
});
