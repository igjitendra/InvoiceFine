export function parseRupeesToPaise(value: string): number | null {
  const normalized = value.trim();
  if (!/^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,2})?$/.test(normalized)) return null;
  const [rupees, fraction = ""] = normalized.split(".");
  const paise = Number(rupees) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(paise) ? paise : null;
}

export function formatPaise(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

export function paiseToInput(paise: number): string {
  return (paise / 100).toFixed(2);
}
