import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
export async function chooseCsvFile(): Promise<{
  name: string;
  text: string;
} | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      "text/csv",
      "text/comma-separated-values",
      "application/vnd.ms-excel",
      "text/plain",
      "*/*",
    ],
    copyToCacheDirectory: false,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) throw new Error("No file selected");
  if (!asset.name.toLowerCase().endsWith(".csv"))
    throw new Error("Choose a file ending in .csv");
  const text = await new File(asset.uri).text();
  const normalized = text.replace(/^\uFEFF/, "");
  if (!normalized.trim()) throw new Error("The selected CSV file is empty.");
  if (normalized.includes("\u0000"))
    throw new Error("Save this file as UTF-8 CSV, then try again.");
  return {
    name: asset.name,
    text: normalized,
  };
}
function utf8Csv(text: string) {
  return text.startsWith("\uFEFF") ? text : `\uFEFF${text}`;
}
async function cacheFile(name: string, text: string) {
  if (!FileSystem.cacheDirectory) throw new Error("Cache unavailable");
  const uri = `${FileSystem.cacheDirectory}${name}`;
  await FileSystem.writeAsStringAsync(uri, utf8Csv(text), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return uri;
}
export async function shareCsv(name: string, text: string): Promise<void> {
  const uri = await cacheFile(name, text);
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Sharing unavailable");
  await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: name });
}
export type CsvFileToSave = { name: string; text: string };

export async function saveCsvFilesToDirectory(
  files: CsvFileToSave[],
): Promise<number> {
  if (files.length === 0) return 0;
  const permission =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permission.granted) return 0;
  for (const file of files) {
    const uri = await FileSystem.StorageAccessFramework.createFileAsync(
      permission.directoryUri,
      file.name,
      "text/csv",
    );
    await FileSystem.writeAsStringAsync(uri, utf8Csv(file.text), {
      encoding: FileSystem.EncodingType.UTF8,
    });
  }
  return files.length;
}

export async function saveCsvToDownloads(
  name: string,
  text: string,
): Promise<boolean> {
  const permission =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permission.granted) return false;
  const uri = await FileSystem.StorageAccessFramework.createFileAsync(
    permission.directoryUri,
    name,
    "text/csv",
  );
  await FileSystem.writeAsStringAsync(uri, utf8Csv(text), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return true;
}
