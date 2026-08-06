import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { theme } from "@/constants/theme";
import {
  preflightRestore,
  restoreLocalDataBackup,
} from "@/db/repositories/data-restore";
import { createLocalDataBackup } from "@/db/repositories/data-backup";
import { useAppPalette } from "@/hooks/useAppPalette";
import { validateBackupPassword } from "@/lib/encrypted-backup-format";
import {
  chooseEncryptedBackup,
  encryptedBackupFileName,
  saveEncryptedBackup,
} from "@/services/backup-files";
import {
  decryptBackupDocument,
  encryptBackupDocument,
} from "@/services/encrypted-backup";
import {
  cancelAllInvoiceFineNotifications,
  syncNotificationSchedule,
} from "@/services/notifications";
import type { BackupDocument } from "@/types/backup";

export default function DataControlsRoute() {
  const router = useRouter();
  const palette = useAppPalette();
  const [backupPassword, setBackupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [restorePassword, setRestorePassword] = useState("");
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    text: string;
  } | null>(null);
  const [validated, setValidated] = useState<BackupDocument | null>(null);
  const [busy, setBusy] = useState<"backup" | "validate" | "restore" | null>(
    null,
  );
  const recordCount = useMemo(
    () =>
      validated
        ? Object.values(validated.tableCounts).reduce(
            (sum, count) => sum + count,
            0,
          )
        : 0,
    [validated],
  );

  function passwordField(
    label: string,
    value: string,
    onChangeText: (value: string) => void,
  ) {
    return (
      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { color: palette.text }]}>
          {label}
        </Text>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          value={value}
          onChangeText={onChangeText}
          placeholder="At least 8 characters"
          placeholderTextColor={palette.muted}
          style={[
            styles.input,
            {
              backgroundColor: palette.background,
              borderColor: palette.borderStrong,
              color: palette.text,
            },
          ]}
        />
      </View>
    );
  }

  async function createBackup() {
    const passwordError = validateBackupPassword(backupPassword);
    if (passwordError) return Alert.alert("Check password", passwordError);
    if (backupPassword !== confirmPassword)
      return Alert.alert(
        "Passwords do not match",
        "Enter the same backup password twice.",
      );
    setBusy("backup");
    try {
      const document = await createLocalDataBackup();
      const encrypted = await encryptBackupDocument(document, backupPassword);
      await saveEncryptedBackup(encryptedBackupFileName(), encrypted);
      setBackupPassword("");
      setConfirmPassword("");
      Alert.alert(
        "Encrypted backup saved",
        "Keep the .ifb file and its password separately. InvoiceFine cannot recover a forgotten password.",
      );
    } catch (error) {
      Alert.alert(
        "Backup could not be created",
        error instanceof Error ? error.message : "The backup was not saved.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function chooseFile() {
    try {
      const file = await chooseEncryptedBackup();
      if (!file) return;
      setSelectedFile(file);
      setValidated(null);
      setRestorePassword("");
    } catch (error) {
      Alert.alert(
        "Backup could not be opened",
        error instanceof Error ? error.message : "Choose another .ifb file.",
      );
    }
  }

  async function validateRestore() {
    if (!selectedFile)
      return Alert.alert(
        "Choose backup",
        "Select an InvoiceFine .ifb file first.",
      );
    setBusy("validate");
    try {
      const document = await decryptBackupDocument(
        selectedFile.text,
        restorePassword,
      );
      await preflightRestore(document);
      setValidated(document);
    } catch (error) {
      setValidated(null);
      Alert.alert(
        "Backup validation failed",
        error instanceof Error
          ? error.message
          : "The current data was not changed.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function performRestore() {
    if (!validated) return;
    setBusy("restore");
    try {
      await cancelAllInvoiceFineNotifications();
      await restoreLocalDataBackup(validated);
      await syncNotificationSchedule();
      setSelectedFile(null);
      setValidated(null);
      setRestorePassword("");
      Alert.alert(
        "Restore complete",
        "InvoiceFine data was replaced atomically and notification schedules were rebuilt.",
      );
    } catch (error) {
      await syncNotificationSchedule().catch(() => undefined);
      Alert.alert(
        "Restore failed safely",
        error instanceof Error
          ? error.message
          : "The previous database was kept.",
      );
    } finally {
      setBusy(null);
    }
  }

  function confirmRestore() {
    Alert.alert(
      "Replace all local business data?",
      "This restores the validated backup in one transaction. Current records will be replaced. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore backup",
          style: "destructive",
          onPress: () => void performRestore(),
        },
      ],
    );
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
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={palette.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: palette.text }]}>
            Encrypted backup
          </Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            Complete offline recovery with password protection.
          </Text>
        </View>
      </View>

      <View style={[styles.notice, { backgroundColor: palette.primarySoft }]}>
        <Ionicons
          name="shield-checkmark-outline"
          size={22}
          color={palette.primary}
        />
        <Text style={[styles.noticeText, { color: palette.text }]}>
          AES-256-GCM encryption with PBKDF2-SHA-256. The password is never
          saved or uploaded. A forgotten password cannot be recovered.
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: palette.text }]}>
          Create complete database backup
        </Text>
        <Text style={[styles.cardBody, { color: palette.muted }]}>
          Includes profile, customers, catalog, invoices, payments, expenses,
          stock, templates, favorites and service reminders. Local image files
          are not embedded; their saved URI references are retained.
        </Text>
        {passwordField("Backup password", backupPassword, setBackupPassword)}
        {passwordField(
          "Confirm backup password",
          confirmPassword,
          setConfirmPassword,
        )}
        <Button
          label="Encrypt & save .ifb backup"
          loading={busy === "backup"}
          disabled={busy !== null && busy !== "backup"}
          onPress={() => void createBackup()}
        />
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: palette.text }]}>
          Restore backup
        </Text>
        <Text style={[styles.cardBody, { color: palette.muted }]}>
          Decryption and all preflight checks happen before current records are
          touched.
        </Text>
        <Button
          label={
            selectedFile ? "Choose another .ifb file" : "Choose .ifb backup"
          }
          variant="secondary"
          onPress={() => void chooseFile()}
          disabled={busy !== null}
        />
        {selectedFile ? (
          <Text
            style={[styles.fileName, { color: palette.text }]}
            numberOfLines={2}
          >
            {selectedFile.name}
          </Text>
        ) : null}
        {passwordField(
          "Backup password for restore",
          restorePassword,
          (value) => {
            setRestorePassword(value);
            setValidated(null);
          },
        )}
        <Button
          label="Decrypt & validate"
          variant="secondary"
          loading={busy === "validate"}
          disabled={!selectedFile || (busy !== null && busy !== "validate")}
          onPress={() => void validateRestore()}
        />
        {validated ? (
          <View
            style={[
              styles.preview,
              {
                backgroundColor: palette.background,
                borderColor: palette.border,
              },
            ]}
          >
            <Text style={[styles.previewTitle, { color: palette.text }]}>
              VALIDATED — NO DATA CHANGED YET
            </Text>
            <Text style={[styles.cardBody, { color: palette.muted }]}>
              Created: {new Date(validated.createdAt).toLocaleString("en-IN")}
            </Text>
            <Text style={[styles.cardBody, { color: palette.muted }]}>
              Schema: {validated.schemaVersion} · Records: {recordCount}
            </Text>
            <Button
              label="Replace local data"
              variant="danger"
              loading={busy === "restore"}
              onPress={confirmRestore}
            />
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: palette.danger }]}>
          Delete Local Data
        </Text>
        <Text style={[styles.cardBody, { color: palette.muted }]}>
          Deletion remains safety-locked until encrypted recovery passes
          physical-device release QA.
        </Text>
        <Button label="Deletion safety-locked" variant="danger" disabled />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  back: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: { flex: 1 },
  title: { fontSize: 30, lineHeight: 37, fontWeight: "700" },
  subtitle: { ...theme.typography.secondary },
  notice: {
    padding: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  noticeText: { flex: 1, ...theme.typography.secondary },
  card: { padding: 18, borderWidth: 1, borderRadius: 22, gap: 14 },
  cardTitle: { ...theme.typography.sectionTitle },
  cardBody: { ...theme.typography.secondary },
  field: { gap: 7 },
  fieldLabel: { ...theme.typography.label },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  fileName: { ...theme.typography.label },
  preview: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 9 },
  previewTitle: { ...theme.typography.eyebrow, fontWeight: "800" },
});
