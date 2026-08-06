export type ThemePreference = "system" | "light" | "dark";
export type FontSizePreference = "small" | "medium" | "large";
export type CatalogViewPreference = "card" | "list";

export type AppearancePreferences = {
  theme: ThemePreference;
  fontSize: FontSizePreference;
  compactMode: boolean;
  catalogView: CatalogViewPreference;
};

export const defaultAppearancePreferences: AppearancePreferences = {
  theme: "system",
  fontSize: "medium",
  compactMode: false,
  catalogView: "card",
};

export const fontScaleByPreference: Record<FontSizePreference, number> = {
  small: 0.9,
  medium: 1,
  large: 1.12,
};

export function isAppearancePreferences(
  value: unknown,
): value is AppearancePreferences {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AppearancePreferences>;
  return (
    (candidate.theme === "system" ||
      candidate.theme === "light" ||
      candidate.theme === "dark") &&
    (candidate.fontSize === "small" ||
      candidate.fontSize === "medium" ||
      candidate.fontSize === "large") &&
    typeof candidate.compactMode === "boolean" &&
    (candidate.catalogView === "card" || candidate.catalogView === "list")
  );
}
