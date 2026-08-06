import Storage from "expo-sqlite/kv-store";

import {
  defaultAppearancePreferences,
  isAppearancePreferences,
  type AppearancePreferences,
} from "@/types/appearance";

const appearanceStorageKey = "invoicefine.appearance.v1";

export function loadAppearancePreferences(): AppearancePreferences {
  try {
    const saved = Storage.getItemSync(appearanceStorageKey);
    if (!saved) return defaultAppearancePreferences;
    const parsed: unknown = JSON.parse(saved);
    return isAppearancePreferences(parsed)
      ? parsed
      : defaultAppearancePreferences;
  } catch {
    return defaultAppearancePreferences;
  }
}

export function saveAppearancePreferences(
  preferences: AppearancePreferences,
): void {
  Storage.setItemSync(appearanceStorageKey, JSON.stringify(preferences));
}
