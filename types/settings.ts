import type { InvoicePageSize } from "@/types/business";
import type { NotificationPreference } from "@/types/onboarding";

export type InvoiceSettings = {
  invoicePrefix: string;
  nextInvoiceNumber: number;
  invoicePageSize: InvoicePageSize;
  defaultDueDays: number;
};

export type NotificationSettings = {
  preferences: NotificationPreference[];
};
