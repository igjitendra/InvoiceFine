import assert from "node:assert/strict";
import {
  businessTemplates,
  fieldsForTemplate,
  sanitizeTemplateData,
  templateForCategory,
} from "../lib/business-template-engine";
assert.equal(businessTemplates.length, 9);
for (const template of businessTemplates) {
  assert.ok(template.fields.length >= 4);
  assert.equal(templateForCategory(template.aliases[0])?.id, template.id);
}
assert.equal(templateForCategory("Mobile Shop")?.id, "mobile");
assert.equal(
  templateForCategory("Digital Marketing Agency")?.workflow,
  "agency",
);
assert.equal(templateForCategory("CSC / VLE")?.id, "csc");
const medical = templateForCategory("Medical Store");
assert.ok(medical);
assert.ok(
  fieldsForTemplate(medical, "product").some(
    (field) => field.key === "composition",
  ),
);
assert.equal(fieldsForTemplate(medical, "service").length, 0);
assert.deepEqual(
  sanitizeTemplateData(medical, "product", {
    composition: " Paracetamol ",
    unknown: "drop",
  }),
  { composition: "Paracetamol" },
);
console.log("BUSINESS_TEMPLATE_RESOLUTION=PASS");
console.log("NINE_VERTICAL_TEMPLATES=PASS");
console.log("TEMPLATE_FIELD_SANITIZATION=PASS");
