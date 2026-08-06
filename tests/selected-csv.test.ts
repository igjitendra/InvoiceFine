import { assert, equal } from "./assertions";
import {
  csvPercent,
  csvQuantity,
  csvRecordStatus,
  csvRupees,
  csvYesNo,
  readableCsv,
} from "../lib/selected-csv";

equal(csvRupees(12345), "123.45");
equal(csvRupees(-1), "-0.01");
equal(csvPercent(1800), "18");
equal(csvPercent(1250), "12.50");
equal(csvQuantity(1000), "1");
equal(csvQuantity(1250), "1.25");
equal(csvQuantity(1), "0.001");
equal(csvYesNo(1), "Yes");
equal(csvYesNo(0), "No");
equal(csvRecordStatus(1), "Archived");
equal(csvRecordStatus(0), "Active");
const csv = readableCsv([
  ["Name", "Notes"],
  ["A, B", 'Uses "quotes"'],
]);
assert(csv.startsWith("\uFEFFName,Notes\r\n"));
assert(csv.includes('"A, B"'));
assert(csv.includes('"Uses ""quotes"""'));
console.log("READABLE_CSV_FORMATTING=PASS");
console.log("PAISE_AND_SCALED_EXPORT_FORMATS=PASS");
console.log("UTF8_BOM_AND_QUOTING=PASS");
