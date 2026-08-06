import { createCsv } from "./csv";

export function csvRupees(value: number): string {
  return (value / 100).toFixed(2);
}

export function csvPercent(value: number): string {
  return (value / 100).toFixed(2).replace(/\.00$/, "");
}

export function csvQuantity(value: number): string {
  return (value / 1000).toFixed(3).replace(/\.?0+$/, "");
}

export function csvYesNo(value: number): string {
  return value === 1 ? "Yes" : "No";
}

export function csvRecordStatus(value: number): string {
  return value === 1 ? "Archived" : "Active";
}

export function readableCsv(rows: string[][]): string {
  return `\uFEFF${createCsv(rows)}`;
}
