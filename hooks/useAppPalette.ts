import { useColorScheme } from "react-native";
import { createAppPalette, type AppPalette } from "@/constants/palette";
export type { AppPalette } from "@/constants/palette";
export function useAppPalette(): AppPalette {
  return createAppPalette(useColorScheme() === "dark");
}
