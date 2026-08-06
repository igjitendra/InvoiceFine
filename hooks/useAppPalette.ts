import { createAppPalette, type AppPalette } from "@/constants/palette";
import { useAppearance } from "@/hooks/useAppearance";

export type { AppPalette } from "@/constants/palette";

export function useAppPalette(): AppPalette {
  const { resolvedColorScheme } = useAppearance();
  return createAppPalette(resolvedColorScheme === "dark");
}
