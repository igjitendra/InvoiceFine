import { assert, equal } from "./assertions";
import {
  autoMapCustomerColumns,
  customerSampleCsv,
  parseCustomerCsv,
} from "../lib/customer-csv";
import { createCsv, parseCsv } from "../lib/csv";
const parsed = parseCsv('Name,Notes\r\n"Rahul, Traders","Uses ""quotes"""');
equal(parsed[1]?.[0], "Rahul, Traders");
equal(parsed[1]?.[1], 'Uses "quotes"');
equal(parseCsv(createCsv(parsed))[1]?.[0], "Rahul, Traders");
const map = autoMapCustomerColumns([
  "Customer Name",
  "Mobile No",
  "GST Number",
  "Postal Code",
]);
equal(map["Customer Name"], "name");
equal(map["Mobile No"], "phone");
equal(map["GST Number"], "gstin");
equal(map["Postal Code"], "pincode");
const sample = parseCustomerCsv(customerSampleCsv);
equal(sample.rows.length, 1);
assert(sample.rows[0]?.errors.length === 0);
const invalid = parseCustomerCsv("Name,Phone\n,123");
assert((invalid.rows[0]?.errors.length ?? 0) >= 2);
console.log("CSV_QUOTING=PASS");
console.log("CUSTOMER_SMART_MAPPING=PASS");
console.log("CUSTOMER_VALIDATION=PASS");
