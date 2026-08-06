import type { ServiceReminderRecurrence } from "../types/reminder";

const monthStep: Record<Exclude<ServiceReminderRecurrence, "none">, number> = {
  monthly: 1,
  quarterly: 3,
  half_yearly: 6,
  yearly: 12,
};

export function isValidReminderDateTime(value: string): boolean {
  const date = new Date(value);
  return value.trim().length > 0 && !Number.isNaN(date.getTime());
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

export function nextReminderOccurrence(
  currentIso: string,
  recurrence: ServiceReminderRecurrence,
  after: Date,
): string | null {
  if (recurrence === "none") return null;
  let next = new Date(currentIso);
  if (Number.isNaN(next.getTime())) return null;
  const step = monthStep[recurrence];
  do {
    next = addMonths(next, step);
  } while (next.getTime() <= after.getTime());
  return next.toISOString();
}

export function formatReminderLocal(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
