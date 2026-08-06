import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export async function chooseEncryptedBackup(): Promise<{
  name: string;
  text: string;
} | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/octet-stream", "application/json", "*/*"],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) throw new Error("No backup file selected.");
  if (!asset.name.toLowerCase().endsWith(".ifb"))
    throw new Error("Choose an InvoiceFine .ifb backup file.");
  return {
    name: asset.name,
    text: await FileSystem.readAsStringAsync(asset.uri),
  };
}

export async function saveEncryptedBackup(
  name: string,
  text: string,
): Promise<void> {
  const permission =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permission.granted)
    throw new Error("Folder permission was not granted.");
  const uri = await FileSystem.StorageAccessFramework.createFileAsync(
    permission.directoryUri,
    name,
    "application/octet-stream",
  );
  await FileSystem.writeAsStringAsync(uri, text, {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

export async function shareEncryptedBackup(
  name: string,
  text: string,
): Promise<void> {
  if (!FileSystem.cacheDirectory)
    throw new Error("Temporary storage is unavailable.");
  const uri = `${FileSystem.cacheDirectory}${name}`;
  await FileSystem.writeAsStringAsync(uri, text, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Sharing is unavailable.");
  await Sharing.shareAsync(uri, {
    mimeType: "application/octet-stream",
    dialogTitle: `Share ${name}`,
  });
}

export function encryptedBackupFileName(createdAt = new Date()): string {
  const stamp = createdAt.toISOString().replace(/[:.]/g, "-");
  return `InvoiceFine-${stamp}.ifb`;
}
