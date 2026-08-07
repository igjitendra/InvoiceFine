import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

type PickBusinessImageOptions = {
  aspect: [number, number];
};

export async function pickBusinessImage({
  aspect,
}: PickBusinessImageOptions): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect,
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset) return null;
  if (!FileSystem.documentDirectory) return asset.uri;
  const extension =
    asset.mimeType === "image/png"
      ? "png"
      : asset.mimeType === "image/webp"
        ? "webp"
        : "jpg";
  const destination = `${FileSystem.documentDirectory}invoicefine-business-${Date.now()}.${extension}`;
  await FileSystem.copyAsync({ from: asset.uri, to: destination });
  return destination;
}
