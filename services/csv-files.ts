import * as DocumentPicker from "expo-document-picker";
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
    ],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) throw new Error("No file selected");
  return {
    name: asset.name,
    text: await FileSystem.readAsStringAsync(asset.uri),
  };
}
async function cacheFile(name: string, text: string) {
  if (!FileSystem.cacheDirectory) throw new Error("Cache unavailable");
  const uri = `${FileSystem.cacheDirectory}${name}`;
  await FileSystem.writeAsStringAsync(uri, text, {
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
    await FileSystem.writeAsStringAsync(uri, file.text, {
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
  await FileSystem.writeAsStringAsync(uri, text, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return true;
}
