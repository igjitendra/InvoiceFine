import { useAppPalette, type AppPalette } from "@/hooks/useAppPalette";
export type ChartPalette = AppPalette;
export function useChartPalette(): ChartPalette {
  return useAppPalette();
}
