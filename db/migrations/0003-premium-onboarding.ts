export const premiumOnboardingMigration = {
  version: 3,
  name: "premium_onboarding_settings",
  sql: `
ALTER TABLE business_settings ADD COLUMN business_type TEXT NOT NULL DEFAULT 'both' CHECK(business_type IN ('product','service','both'));
ALTER TABLE business_settings ADD COLUMN business_category TEXT NOT NULL DEFAULT 'other';
ALTER TABLE business_settings ADD COLUMN owner_name TEXT;
ALTER TABLE business_settings ADD COLUMN website TEXT;
ALTER TABLE business_settings ADD COLUMN pan TEXT;
ALTER TABLE business_settings ADD COLUMN state_name TEXT;
ALTER TABLE business_settings ADD COLUMN pincode TEXT;
ALTER TABLE business_settings ADD COLUMN gst_type TEXT NOT NULL DEFAULT 'unregistered' CHECK(gst_type IN ('unregistered','regular','composition'));
ALTER TABLE business_settings ADD COLUMN invoice_template TEXT NOT NULL DEFAULT 'modern' CHECK(invoice_template IN ('classic','modern','minimal','retail','service','corporate','gst_pro','thermal'));
ALTER TABLE business_settings ADD COLUMN estimate_prefix TEXT NOT NULL DEFAULT 'EST';
ALTER TABLE business_settings ADD COLUMN quotation_prefix TEXT NOT NULL DEFAULT 'QT';
ALTER TABLE business_settings ADD COLUMN payment_terms_days INTEGER NOT NULL DEFAULT 0 CHECK(payment_terms_days IN (0,7,15,30));
ALTER TABLE business_settings ADD COLUMN payment_methods_json TEXT NOT NULL DEFAULT '["cash"]';
ALTER TABLE business_settings ADD COLUMN notification_preferences_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE business_settings ADD COLUMN onboarding_completed INTEGER NOT NULL DEFAULT 1 CHECK(onboarding_completed IN (0,1));
`,
} as const;
