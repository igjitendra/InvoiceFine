import * as ImagePicker from "expo-image-picker";

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

  return result.assets[0]?.uri ?? null;
}
