import type { CatalogItemType, ServicePricingModel } from "./catalog";
export type CatalogCsvField =
  | "name"
  | "sku"
  | "barcode"
  | "category"
  | "brand"
  | "unit"
  | "purchasePrice"
  | "sellingPrice"
  | "mrp"
  | "gstRate"
  | "openingStock"
  | "lowStockThreshold"
  | "reorderLevel"
  | "hsnSacCode"
  | "description"
  | "servicePricingModel"
  | "serviceDurationMinutes"
  | "appointmentRequired"
  | "warrantyDays";
export type CatalogCsvMapping = Record<string, CatalogCsvField | null>;
export type CatalogDuplicatePolicy = "skip" | "update" | "create";
export type CatalogImportValues = Record<CatalogCsvField, string>;
export type CatalogImportRow = {
  rowNumber: number;
  type: CatalogItemType;
  values: CatalogImportValues;
  errors: string[];
  warnings: string[];
};
export type CatalogImportSummary = {
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  pendingClassification: number;
};
export const servicePricingModels: ServicePricingModel[] = [
  "fixed",
  "hourly",
  "per_visit",
  "per_km",
  "per_day",
];
