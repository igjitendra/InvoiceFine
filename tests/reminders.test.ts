import { assert, equal } from "./assertions";
import {
  formatReminderLocal,
  isValidReminderDateTime,
  nextReminderOccurrence,
} from "../lib/reminders";

equal(
  nextReminderOccurrence(
    "2026-01-31T09:00:00.000Z",
    "monthly",
    new Date("2026-01-31T09:00:00.000Z"),
  ),
  "2026-02-28T09:00:00.000Z",
);
equal(
  nextReminderOccurrence(
    "2026-01-31T09:00:00.000Z",
    "quarterly",
    new Date("2026-04-30T09:00:00.000Z"),
  ),
  "2026-07-30T09:00:00.000Z",
);
equal(
  nextReminderOccurrence(
    "2026-08-06T09:00:00.000Z",
    "none",
    new Date("2026-08-06T09:00:00.000Z"),
  ),
  null,
);
assert(isValidReminderDateTime("2026-08-07T09:00:00.000Z"));
assert(!isValidReminderDateTime("not-a-date"));
assert(formatReminderLocal("not-a-date") === "not-a-date");
console.log("REMINDER_RECURRENCE_MONTH_END=PASS");
console.log("REMINDER_RECURRENCE_ADVANCE=PASS");
console.log("REMINDER_DATETIME_VALIDATION=PASS");
