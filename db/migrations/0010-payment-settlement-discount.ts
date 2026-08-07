export const paymentSettlementDiscountMigration = {
  version: 10,
  name: "payment_settlement_discount",
  sql: `
ALTER TABLE invoices ADD COLUMN settlement_discount_paise INTEGER NOT NULL DEFAULT 0 CHECK(settlement_discount_paise >= 0);
`,
} as const;
