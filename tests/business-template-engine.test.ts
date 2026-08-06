import {
  businessTemplates,
  fieldsForTemplate,
  sanitizeTemplateData,
  templateForCategory,
} from "../lib/business-template-engine";
import { assert, deepEqual, equal } from "./assertions";

equal(businessTemplates.length, 9);
for (const template of businessTemplates) {
  assert(template.fields.length >= 4);
  const alias = template.aliases[0];
  assert(alias, `Template ${template.id} requires an alias`);
  equal(templateForCategory(alias)?.id, template.id);
}
equal(templateForCategory("Mobile Shop")?.id, "mobile");
equal(templateForCategory("Digital Marketing Agency")?.workflow, "agency");
equal(templateForCategory("CSC / VLE")?.id, "csc");
const medical = templateForCategory("Medical Store");
assert(medical, "Medical template was not resolved");
assert(
  fieldsForTemplate(medical, "product").some(
    (field) => field.key === "composition",
  ),
);
equal(fieldsForTemplate(medical, "service").length, 0);
deepEqual(
  sanitizeTemplateData(medical, "product", {
    composition: " Paracetamol ",
    unknown: "drop",
  }),
  { composition: "Paracetamol" },
);
console.log("BUSINESS_TEMPLATE_RESOLUTION=PASS");
console.log("NINE_VERTICAL_TEMPLATES=PASS");
console.log("TEMPLATE_FIELD_SANITIZATION=PASS");
