import { createCsv, parseCsv } from "./csv";
import type { CatalogItemType } from "../types/catalog";
import type {
  CatalogCsvField,
  CatalogCsvMapping,
  CatalogImportRow,
  CatalogImportValues,
} from "../types/catalog-csv";
import { servicePricingModels } from "../types/catalog-csv";
export const catalogCsvFields: CatalogCsvField[] = [
  "name",
  "sku",
  "barcode",
  "category",
  "brand",
  "unit",
  "purchasePrice",
  "sellingPrice",
  "mrp",
  "gstRate",
  "openingStock",
  "lowStockThreshold",
  "reorderLevel",
  "hsnSacCode",
  "description",
  "servicePricingModel",
  "serviceDurationMinutes",
  "appointmentRequired",
  "warrantyDays",
];
export const catalogCsvLabels: Record<CatalogCsvField, string> = {
  name: "Name",
  sku: "SKU",
  barcode: "Barcode",
  category: "Category",
  brand: "Brand",
  unit: "Unit",
  purchasePrice: "Purchase Price",
  sellingPrice: "Selling Price",
  mrp: "MRP",
  gstRate: "GST %",
  openingStock: "Opening Stock",
  lowStockThreshold: "Low Stock",
  reorderLevel: "Reorder Level",
  hsnSacCode: "HSN/SAC",
  description: "Description",
  servicePricingModel: "Pricing Model",
  serviceDurationMinutes: "Duration Minutes",
  appointmentRequired: "Appointment Required",
  warrantyDays: "Warranty Days",
};
const aliases: Record<CatalogCsvField, string[]> = {
  name: ["name", "itemname", "productname", "servicename"],
  sku: ["sku", "itemcode", "productcode", "servicecode"],
  barcode: ["barcode", "ean", "upc"],
  category: ["category", "categoryname"],
  brand: ["brand", "manufacturer"],
  unit: ["unit", "uom"],
  purchasePrice: ["purchaseprice", "costprice", "cost"],
  sellingPrice: ["sellingprice", "saleprice", "price", "rate"],
  mrp: ["mrp", "maximumretailprice"],
  gstRate: ["gstrate", "gst", "taxrate", "tax"],
  openingStock: ["openingstock", "stock", "quantity"],
  lowStockThreshold: ["lowstock", "lowstockthreshold"],
  reorderLevel: ["reorderlevel", "reorderpoint"],
  hsnSacCode: ["hsn", "sac", "hsnsac", "hsnsaccode"],
  description: ["description", "details"],
  servicePricingModel: ["pricingmodel", "servicepricingmodel"],
  serviceDurationMinutes: ["duration", "durationminutes", "serviceduration"],
  appointmentRequired: ["appointmentrequired", "appointment"],
  warrantyDays: ["warrantydays", "servicewarranty"],
};
const key = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");
export function fieldsForCatalogType(type: CatalogItemType): CatalogCsvField[] {
  return type === "product"
    ? catalogCsvFields.filter(
        (f) =>
          ![
            "servicePricingModel",
            "serviceDurationMinutes",
            "appointmentRequired",
            "warrantyDays",
          ].includes(f),
      )
    : catalogCsvFields.filter(
        (f) =>
          ![
            "barcode",
            "brand",
            "purchasePrice",
            "mrp",
            "openingStock",
            "lowStockThreshold",
            "reorderLevel",
          ].includes(f),
      );
}
export function autoMapCatalogColumns(
  headers: string[],
  type: CatalogItemType,
): CatalogCsvMapping {
  const allowed = fieldsForCatalogType(type),
    map: CatalogCsvMapping = {};
  for (const h of headers) {
    const k = key(h);
    map[h] = allowed.find((f) => aliases[f].includes(k)) ?? null;
  }
  return map;
}
const validNumber = (v: string) =>
  v === "" || (/^\d+(\.\d{1,3})?$/.test(v) && Number.isFinite(Number(v)));
export function parseCatalogCsv(
  text: string,
  type: CatalogItemType,
  mapping?: CatalogCsvMapping,
) {
  const raw = parseCsv(text),
    headers = (raw[0] ?? []).map((v) => v.trim()),
    active = mapping ?? autoMapCatalogColumns(headers, type);
  const rows: CatalogImportRow[] = raw.slice(1).map((cells, index) => {
    const values = Object.fromEntries(
      catalogCsvFields.map((f) => [f, ""]),
    ) as CatalogImportValues;
    headers.forEach((h, i) => {
      const f = active[h];
      if (f) values[f] = (cells[i] ?? "").trim();
    });
    const errors: string[] = [],
      warnings: string[] = [];
    if (!values.name) errors.push("Name is required");
    for (const f of [
      "purchasePrice",
      "sellingPrice",
      "mrp",
      "gstRate",
      "openingStock",
      "lowStockThreshold",
      "reorderLevel",
    ] as CatalogCsvField[])
      if (!validNumber(values[f]))
        errors.push(`${catalogCsvLabels[f]} must be zero or positive`);
    if (values.gstRate && Number(values.gstRate) > 100)
      errors.push("GST rate cannot exceed 100");
    if (type === "service") {
      if (
        values.servicePricingModel &&
        !servicePricingModels.includes(
          values.servicePricingModel as (typeof servicePricingModels)[number],
        )
      )
        errors.push("Pricing model is invalid");
      if (
        values.serviceDurationMinutes &&
        !/^\d+$/.test(values.serviceDurationMinutes)
      )
        errors.push("Duration must be whole minutes");
      if (values.warrantyDays && !/^\d+$/.test(values.warrantyDays))
        errors.push("Warranty must be whole days");
      if (!values.hsnSacCode) warnings.push("SAC pending classification");
    }
    return { rowNumber: index + 2, type, values, errors, warnings };
  });
  return { headers, mapping: active, rows };
}
export const productSampleCsv = createCsv([
  [
    "Name",
    "SKU",
    "Barcode",
    "Category",
    "Brand",
    "Unit",
    "PurchasePrice",
    "SellingPrice",
    "MRP",
    "GST",
    "OpeningStock",
    "LowStock",
    "ReorderLevel",
    "HSN",
    "Description",
  ],
  [
    "Premium Charger",
    "CHG-001",
    "8901234567890",
    "Mobile Accessories",
    "VoltPro",
    "PCS",
    "500",
    "899",
    "999",
    "18",
    "20",
    "5",
    "10",
    "85044090",
    "Fast charger",
  ],
]);
export const serviceSampleCsv = createCsv([
  [
    "Name",
    "SKU",
    "Category",
    "Unit",
    "SellingPrice",
    "GST",
    "SAC",
    "PricingModel",
    "DurationMinutes",
    "AppointmentRequired",
    "WarrantyDays",
    "Description",
  ],
  [
    "AC Basic Service",
    "AC-SVC-01",
    "AC Service",
    "Visit",
    "799",
    "18",
    "998719",
    "per_visit",
    "90",
    "yes",
    "30",
    "Inspection and cleaning",
  ],
]);
export function catalogErrorReportCsv(rows: CatalogImportRow[]): string {
  return createCsv([
    ["Row", "Type", "Name", "SKU", "Barcode", "Errors", "Warnings"],
    ...rows
      .filter((r) => r.errors.length || r.warnings.length)
      .map((r) => [
        String(r.rowNumber),
        r.type,
        r.values.name,
        r.values.sku,
        r.values.barcode,
        r.errors.join("; "),
        r.warnings.join("; "),
      ]),
  ]);
}
