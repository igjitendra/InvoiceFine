export const legalDocuments = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    summary: "How InvoiceFine handles local business data.",
    content:
      "InvoiceFine is designed as an offline-first application. Business records are stored on your device unless you explicitly export or share them. InvoiceFine does not sell personal or business data. You are responsible for protecting device access and exported files.",
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    summary: "Rules for using InvoiceFine.",
    content:
      "Use InvoiceFine only for lawful business activity. You remain responsible for invoice accuracy, tax compliance, backups, and records submitted to customers or authorities. Features may change as the product develops.",
  },
  {
    slug: "refund",
    title: "Refund Policy (Premium)",
    summary: "Premium purchase and refund information.",
    content:
      "Premium purchase terms and refund eligibility follow the store or payment provider used for the transaction, together with applicable consumer law. Final commercial terms must be published before paid subscriptions launch.",
  },
  {
    slug: "subscription",
    title: "Subscription Policy",
    summary: "Premium billing and renewal terms.",
    content:
      "InvoiceFine does not currently activate paid subscriptions in this build. Before subscriptions launch, price, billing period, renewal, cancellation, and feature access will be shown clearly before purchase.",
  },
  {
    slug: "backup",
    title: "Data & Backup Policy",
    summary: "Your responsibility for offline records.",
    content:
      "The primary database is stored locally on the device. Device loss, reset, app removal, or storage corruption may remove local data. A verified export and restore workflow must be used before relying on backups.",
  },
  {
    slug: "licenses",
    title: "Third-Party Licenses",
    summary: "Open-source software notices.",
    content:
      "InvoiceFine uses Expo, React, React Native, Expo Router, SQLite, React Hook Form, react-native-svg, and other open-source packages. Their respective licenses and notices apply.",
  },
  {
    slug: "disclaimer",
    title: "Disclaimer",
    summary: "Tax, accounting, and availability limitations.",
    content:
      "InvoiceFine is a record-keeping tool, not legal, tax, or accounting advice. Verify GST, totals, filing obligations, and printed documents with a qualified professional.",
  },
  {
    slug: "about",
    title: "About InvoiceFine",
    summary: "Pocket ERP for Indian Small Business.",
    content:
      "InvoiceFine is an offline-first invoicing and business management app built for Indian small businesses, product sellers, and service professionals.",
  },
  {
    slug: "support",
    title: "Contact Support",
    summary: "Get help with InvoiceFine.",
    content:
      "Support email: jitendraeditiz@gmail.com. Do not send passwords, payment credentials, or unprotected customer databases.",
  },
  {
    slug: "changelog",
    title: "App Version & Changelog",
    summary: "Current release information.",
    content:
      "Version 1.0.0. Current source includes offline invoices, customers, catalog, stock, payments, expenses, reports, PDF output, premium onboarding, live appearance controls, and professional Settings foundations.",
  },
] as const;
