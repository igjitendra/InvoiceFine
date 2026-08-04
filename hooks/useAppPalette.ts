import { useChartPalette, type ChartPalette } from '@/components/charts/palette';

export type AppPalette = ChartPalette;

export function useAppPalette(): AppPalette {
  return useChartPalette();
}
