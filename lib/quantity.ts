export const QUANTITY_SCALE = 1000;

export function parseQuantityToScaled(value: string): number | null {
  const normalized = value.trim();
  if (!/^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,3})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const scaled =
    Number(whole) * QUANTITY_SCALE + Number(fraction.padEnd(3, "0"));
  return Number.isSafeInteger(scaled) ? scaled : null;
}

export function scaledToInput(value: number): string {
  const formatted = (value / QUANTITY_SCALE).toFixed(3);
  return formatted.replace(/\.?0+$/, "");
}
