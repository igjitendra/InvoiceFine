import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useColorScheme } from "react-native";

import {
  loadAppearancePreferences,
  saveAppearancePreferences,
} from "@/lib/appearance-storage";
import {
  fontScaleByPreference,
  type AppearancePreferences,
  type CatalogViewPreference,
  type FontSizePreference,
  type ThemePreference,
} from "@/types/appearance";

type AppearanceContextValue = AppearancePreferences & {
  resolvedColorScheme: "light" | "dark";
  fontScale: number;
  setTheme: (theme: ThemePreference) => void;
  setFontSize: (fontSize: FontSizePreference) => void;
  setCompactMode: (compactMode: boolean) => void;
  setCatalogView: (catalogView: CatalogViewPreference) => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme() === "dark" ? "dark" : "light";
  const [preferences, setPreferences] = useState(loadAppearancePreferences);

  const update = useCallback(
    <Key extends keyof AppearancePreferences>(
      key: Key,
      value: AppearancePreferences[Key],
    ) => {
      setPreferences((current) => {
        if (current[key] === value) return current;
        const next = { ...current, [key]: value };
        try {
          saveAppearancePreferences(next);
        } catch {
          // Keep the live preference even if persistence is temporarily unavailable.
        }
        return next;
      });
    },
    [],
  );

  const value = useMemo<AppearanceContextValue>(
    () => ({
      ...preferences,
      resolvedColorScheme:
        preferences.theme === "system" ? systemColorScheme : preferences.theme,
      fontScale: fontScaleByPreference[preferences.fontSize],
      setTheme: (theme) => update("theme", theme),
      setFontSize: (fontSize) => update("fontSize", fontSize),
      setCompactMode: (compactMode) => update("compactMode", compactMode),
      setCatalogView: (catalogView) => update("catalogView", catalogView),
    }),
    [preferences, systemColorScheme, update],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance(): AppearanceContextValue {
  const value = useContext(AppearanceContext);
  if (!value) {
    throw new Error("useAppearance must be used inside AppearanceProvider.");
  }
  return value;
}
