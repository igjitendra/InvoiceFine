import { assert, equal } from "./assertions";
import {
  autoMapCatalogColumns,
  parseCatalogCsv,
  productSampleCsv,
  serviceSampleCsv,
} from "../lib/catalog-csv";
const productMap = autoMapCatalogColumns(
  ["Product Name", "Item Code", "Sale Price", "Opening Stock", "HSN"],
  "product",
);
equal(productMap["Product Name"], "name");
equal(productMap["Item Code"], "sku");
equal(productMap["Sale Price"], "sellingPrice");
equal(productMap["Opening Stock"], "openingStock");
const product = parseCatalogCsv(productSampleCsv, "product");
equal(product.rows.length, 1);
assert(product.rows[0]?.errors.length === 0);
const invalid = parseCatalogCsv(
  "Name,SellingPrice,GST,OpeningStock\n,-1,101,-2",
  "product",
);
assert((invalid.rows[0]?.errors.length ?? 0) >= 4);
const service = parseCatalogCsv(serviceSampleCsv, "service");
assert(service.rows[0]?.errors.length === 0);
const pending = parseCatalogCsv(
  "Name,SellingPrice,SAC\nConsulting,500,",
  "service",
);
equal(pending.rows[0]?.warnings[0], "SAC pending classification");
console.log("PRODUCT_CSV_MAPPING_VALIDATION=PASS");
console.log("SERVICE_CSV_MAPPING_VALIDATION=PASS");
console.log("SERVICE_SAC_PENDING_CLASSIFICATION=PASS");
