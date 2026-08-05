import { useState } from "react";
import { Alert, Share, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { theme } from "@/constants/theme";
import { createLocalDataBackup } from "@/db/repositories/data-backup";
import {
  preflightRestore,
  restoreLocalDataBackup,
} from "@/db/repositories/data-restore";
import { useAppPalette } from "@/hooks/useAppPalette";
import { parseBackupDocument } from "@/lib/backup-format";
import type { BackupDocument } from "@/types/backup";

const shareLimit = 500_000;

type Props = { onRestored: () => void };

export function RestoreBackupCard({ onRestored }: Props) {
  const palette = useAppPalette();
  const [importText, setImportText] = useState("");
  const [imported, setImported] = useState<BackupDocument | null>(null);
  const [safetyBackup, setSafetyBackup] = useState<BackupDocument | null>(null);
  const [safetyShared, setSafetyShared] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState(
    "Paste a JSON backup created by InvoiceFine.",
  );
  const [validating, setValidating] = useState(false);
  const [restoring, setRestoring] = useState(false);

  async function validateImport() {
    setValidating(true);
    setImported(null);
    setSafetyBackup(null);
    setSafetyShared(false);
    setConfirmation("");
    try {
      const parsed = parseBackupDocument(importText.trim());
      if (!parsed.document) {
        setMessage(parsed.validation.reason);
        return;
      }
      await preflightRestore(parsed.document);
      setImported(parsed.document);
      setMessage("Checksum, table counts, cells and schema version are valid.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Backup preflight failed.",
      );
    } finally {
      setValidating(false);
    }
  }

  async function prepareSafetyBackup() {
    setValidating(true);
    try {
      const current = await createLocalDataBackup();
      setSafetyBackup(current);
      setSafetyShared(false);
      setMessage(
        "Current database safety backup is ready. Share and save it before restoring.",
      );
    } catch {
      setMessage(
        "Current database safety backup could not be prepared. Restore remains disabled.",
      );
    } finally {
      setValidating(false);
    }
  }

  async function shareSafetyBackup() {
    if (!safetyBackup) return;
    const json = JSON.stringify(safetyBackup);
    if (json.length > shareLimit) {
      Alert.alert(
        "Safety backup is too large",
        "Restore remains disabled because the current database cannot be safely shared with this dependency-free exporter.",
      );
      return;
    }
    const result = await Share.share({
      title: "InvoiceFine pre-restore backup",
      message: json,
    });
    if (result.action === Share.sharedAction) {
      setSafetyShared(true);
      setMessage(
        "Safety backup shared. Type RESTORE to enable the final confirmation.",
      );
    }
  }

  function requestRestore() {
    if (!imported || !safetyShared || confirmation !== "RESTORE") return;
    Alert.alert(
      "Replace current local data?",
      "This imports the validated backup inside one transaction. If any row or integrity check fails, the existing database is rolled back unchanged.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore data",
          style: "destructive",
          onPress: () => void executeRestore(imported),
        },
      ],
    );
  }

  async function executeRestore(document: BackupDocument) {
    setRestoring(true);
    try {
      await restoreLocalDataBackup(document);
      Alert.alert(
        "Restore completed",
        "All rows passed foreign-key and SQLite integrity checks. Reopen the app screens to view restored data.",
        [{ text: "Continue", onPress: onRestored }],
      );
    } catch (error) {
      Alert.alert(
        "Restore rolled back",
        error instanceof Error
          ? error.message
          : "Restore failed. The existing database was not replaced.",
      );
    } finally {
      setRestoring(false);
    }
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <Text style={[styles.title, { color: palette.text }]}>
        Restore My Data
      </Text>
      <Text style={[styles.body, { color: palette.muted }]}>
        Manual JSON import is available without adding an unverified Expo
        dependency. Logo, QR and signature file URIs are restored as text
        references; the image files themselves are not bundled.
      </Text>
      <Input
        label="InvoiceFine backup JSON"
        value={importText}
        onChangeText={(value) => {
          setImportText(value);
          setImported(null);
          setSafetyBackup(null);
          setSafetyShared(false);
        }}
        placeholder='{"format":"invoicefine-backup",...}'
        autoCapitalize="none"
        autoCorrect={false}
        multiline
        numberOfLines={7}
        textAlignVertical="top"
        editable={!restoring}
      />
      <Button
        label="Validate backup"
        variant="secondary"
        loading={validating}
        disabled={!importText.trim() || restoring}
        onPress={() => void validateImport()}
      />
      <View
        style={[
          styles.status,
          {
            backgroundColor: imported
              ? palette.positiveSoft
              : palette.surfaceVariant,
          },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            { color: imported ? palette.positive : palette.muted },
          ]}
        >
          {message}
        </Text>
      </View>
      {imported ? (
        <View
          style={[styles.manifest, { backgroundColor: palette.surfaceVariant }]}
        >
          <Row
            label="Created"
            value={imported.createdAt.replace("T", " ").slice(0, 19)}
          />
          <Row label="Schema" value={`Version ${imported.schemaVersion}`} />
          <Row label="Invoices" value={String(imported.tableCounts.invoices)} />
          <Row
            label="Customers"
            value={String(imported.tableCounts.customers)}
          />
          <Row label="Checksum" value={imported.checksum} />
        </View>
      ) : null}
      {imported ? (
        <Button
          label="Prepare current safety backup"
          variant="secondary"
          loading={validating}
          disabled={restoring}
          onPress={() => void prepareSafetyBackup()}
        />
      ) : null}
      {safetyBackup ? (
        <Button
          label={
            safetyShared
              ? "Safety backup shared"
              : "Share current safety backup"
          }
          variant="secondary"
          disabled={safetyShared || restoring}
          onPress={() => void shareSafetyBackup()}
        />
      ) : null}
      {safetyShared ? (
        <Input
          label="Type RESTORE to confirm"
          value={confirmation}
          onChangeText={setConfirmation}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!restoring}
        />
      ) : null}
      {safetyShared ? (
        <Button
          label="Restore validated backup"
          variant="danger"
          loading={restoring}
          disabled={confirmation !== "RESTORE"}
          onPress={requestRestore}
        />
      ) : null}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const palette = useAppPalette();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: palette.muted }]}>{label}</Text>
      <Text
        numberOfLines={1}
        style={[styles.rowValue, { color: palette.text }]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, borderWidth: 1, borderRadius: 22, gap: 12 },
  title: { ...theme.typography.sectionTitle },
  body: { ...theme.typography.secondary },
  status: { padding: 12, borderRadius: 14 },
  statusText: { ...theme.typography.caption },
  manifest: { padding: 12, borderRadius: 16 },
  row: { minHeight: 32, flexDirection: "row", alignItems: "center", gap: 12 },
  rowLabel: { width: 82, ...theme.typography.caption },
  rowValue: { flex: 1, textAlign: "right", ...theme.typography.label },
});
