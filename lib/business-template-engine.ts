import type { CatalogItemType } from "@/types/catalog";
import type { VerticalWorkflow } from "@/types/vertical-workflow";

export type TemplateFieldDefinition = {
  key: string;
  label: string;
  type: "text" | "multiline";
  appliesTo: CatalogItemType | "both";
  placeholder?: string;
};
export type BusinessTemplate = {
  id: string;
  name: string;
  icon: string;
  aliases: string[];
  workflow: VerticalWorkflow;
  fields: TemplateFieldDefinition[];
};
const text = (
  key: string,
  label: string,
  appliesTo: TemplateFieldDefinition["appliesTo"] = "both",
): TemplateFieldDefinition => ({ key, label, type: "text", appliesTo });
const multi = (
  key: string,
  label: string,
  appliesTo: TemplateFieldDefinition["appliesTo"] = "both",
): TemplateFieldDefinition => ({ key, label, type: "multiline", appliesTo });
export const businessTemplates: readonly BusinessTemplate[] = [
  {
    id: "medical",
    name: "Medical & Pharmacy",
    icon: "medical-outline",
    aliases: ["medical", "pharmacy", "chemist", "medicine"],
    workflow: "general",
    fields: [
      text("composition", "Composition", "product"),
      text("drugSchedule", "Drug schedule", "product"),
      text("prescriptionRequired", "Prescription required", "product"),
      text("medicineForm", "Tablet / syrup / injection", "product"),
    ],
  },
  {
    id: "garment",
    name: "Garment & Fashion",
    icon: "shirt-outline",
    aliases: ["garment", "fashion", "clothing", "boutique"],
    workflow: "general",
    fields: [
      text("fabric", "Fabric", "product"),
      text("gender", "Gender / audience", "product"),
      text("designCode", "Design code", "product"),
      text("season", "Season / collection", "product"),
    ],
  },
  {
    id: "mobile",
    name: "Mobile & Electronics",
    icon: "phone-portrait-outline",
    aliases: ["mobile", "electronics", "computer", "laptop"],
    workflow: "general",
    fields: [
      text("modelNumber", "Model number", "product"),
      text("ramStorage", "RAM / storage", "product"),
      text("serialImei", "Serial / IMEI", "product"),
      text("deviceWarranty", "Device warranty", "product"),
    ],
  },
  {
    id: "repair",
    name: "Repair Center",
    icon: "construct-outline",
    aliases: ["repair", "service center", "workshop"],
    workflow: "repair",
    fields: [
      text("deviceType", "Device type", "service"),
      text("brandModel", "Brand / model", "service"),
      text("defaultWarranty", "Default service warranty", "service"),
      multi("diagnosticChecklist", "Diagnostic checklist", "service"),
    ],
  },
  {
    id: "salon",
    name: "Salon & Beauty",
    icon: "cut-outline",
    aliases: ["salon", "beauty", "spa"],
    workflow: "salon",
    fields: [
      text("serviceCategory", "Service category", "service"),
      text("recommendedStaff", "Recommended staff", "service"),
      text("chairRoom", "Chair / room", "service"),
      multi("preparation", "Customer preparation", "service"),
    ],
  },
  {
    id: "agency",
    name: "Digital Agency",
    icon: "megaphone-outline",
    aliases: [
      "agency",
      "digital marketing",
      "marketing",
      "website development",
      "graphic design",
    ],
    workflow: "agency",
    fields: [
      text("projectType", "Project type", "service"),
      text("platform", "Platform", "service"),
      text("includedRevisions", "Included revisions", "service"),
      multi("deliverables", "Deliverables", "service"),
    ],
  },
  {
    id: "freelancer",
    name: "Freelancer",
    icon: "person-outline",
    aliases: ["freelance", "consultant", "professional"],
    workflow: "freelancer",
    fields: [
      text("skillCategory", "Skill / category", "service"),
      text("billingUnit", "Billing unit", "service"),
      text("defaultMilestone", "Default milestone", "service"),
      multi("scopeTemplate", "Scope template", "service"),
    ],
  },
  {
    id: "restaurant",
    name: "Restaurant & Food",
    icon: "restaurant-outline",
    aliases: ["restaurant", "food", "cafe", "bakery", "hotel"],
    workflow: "general",
    fields: [
      text("foodType", "Veg / non-veg / vegan", "product"),
      text("portionSize", "Portion size", "product"),
      text("variant", "Variant", "product"),
      multi("kitchenNotes", "Kitchen notes", "product"),
    ],
  },
  {
    id: "csc",
    name: "CSC / VLE Services",
    icon: "document-text-outline",
    aliases: ["csc", "vle", "citizen service", "online service"],
    workflow: "general",
    fields: [
      text("serviceDepartment", "Department", "service"),
      text("serviceType", "Service type", "service"),
      text("deliveryTime", "Expected delivery", "service"),
      multi("requiredDocuments", "Required documents", "service"),
    ],
  },
];
export function templateForCategory(category: string): BusinessTemplate | null {
  const value = category.trim().toLowerCase();
  if (!value) return null;
  return (
    businessTemplates.find((template) =>
      template.aliases.some((alias) => value.includes(alias)),
    ) ?? null
  );
}
export function fieldsForTemplate(
  template: BusinessTemplate,
  itemType: CatalogItemType,
) {
  return template.fields.filter(
    (field) => field.appliesTo === "both" || field.appliesTo === itemType,
  );
}
export function sanitizeTemplateData(
  template: BusinessTemplate,
  itemType: CatalogItemType,
  value: Record<string, string>,
): Record<string, string> {
  const allowed = new Set(
    fieldsForTemplate(template, itemType).map((field) => field.key),
  );
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, item]) => allowed.has(key) && typeof item === "string")
      .map(([key, item]) => [key, item.trim()]),
  );
}
