export function parsePercentToBasisPoints(value: string): number | null {
  const normalized = value.trim();
  if (!/^(?:[0-9]{1,2}(?:\.[0-9]{1,2})?|100(?:\.0{1,2})?)$/.test(normalized)) {
    return null;
  }
  const [whole, fraction = ''] = normalized.split('.');
  const basisPoints = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(basisPoints) ? basisPoints : null;
}

export function basisPointsToInput(value: number): string {
  const formatted = (value / 100).toFixed(2);
  return formatted.replace(/\.?0+$/, '');
}
