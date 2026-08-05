import type {
  VerticalDetailKey,
  VerticalInvoiceDetails,
  VerticalWorkflow,
} from "../types/vertical-workflow";
export type VerticalFieldDefinition = {
  key: VerticalDetailKey;
  label: string;
  multiline?: boolean;
  keyboard?: "default" | "decimal-pad" | "number-pad" | "url";
};
const fields: Record<VerticalWorkflow, VerticalFieldDefinition[]> = {
  repair: [
    { key: "imei", label: "IMEI" },
    { key: "serialNumber", label: "Serial number" },
    { key: "model", label: "Model" },
    { key: "problem", label: "Problem", multiline: true },
    {
      key: "accessoriesReceived",
      label: "Accessories received",
      multiline: true,
    },
    { key: "warranty", label: "Warranty" },
    { key: "deliveryDate", label: "Delivery date (YYYY-MM-DD)" },
    { key: "technician", label: "Technician" },
    { key: "status", label: "Repair status" },
  ],
  agency: [
    { key: "projectName", label: "Project name" },
    { key: "packageName", label: "Package" },
    { key: "deliveryDate", label: "Delivery date (YYYY-MM-DD)" },
    { key: "revisionCount", label: "Revision count", keyboard: "number-pad" },
    { key: "domain", label: "Domain" },
    { key: "hosting", label: "Hosting" },
    { key: "websiteUrl", label: "Website URL", keyboard: "url" },
  ],
  freelancer: [
    { key: "projectName", label: "Project" },
    { key: "milestone", label: "Milestone" },
    { key: "hours", label: "Hours", keyboard: "decimal-pad" },
    { key: "deliveryDate", label: "Due date (YYYY-MM-DD)" },
    { key: "advance", label: "Advance amount", keyboard: "decimal-pad" },
  ],
  salon: [
    { key: "staff", label: "Staff" },
    {
      key: "serviceDuration",
      label: "Service duration (minutes)",
      keyboard: "number-pad",
    },
    { key: "chair", label: "Chair" },
    { key: "appointment", label: "Appointment" },
  ],
  plumber: [
    { key: "visitCharge", label: "Visit charge", keyboard: "decimal-pad" },
    { key: "materialCost", label: "Material cost", keyboard: "decimal-pad" },
    { key: "labour", label: "Labour charge", keyboard: "decimal-pad" },
    { key: "location", label: "Service location", multiline: true },
  ],
  ac_service: [
    { key: "gasFilled", label: "Gas filled" },
    { key: "compressor", label: "Compressor" },
    { key: "serviceDate", label: "Service date (YYYY-MM-DD)" },
    { key: "warranty", label: "Warranty" },
    { key: "technician", label: "Technician" },
  ],
  general: [],
};
export function fieldsForWorkflow(workflow: VerticalWorkflow) {
  return fields[workflow];
}
export function workflowTitle(workflow: VerticalWorkflow) {
  return workflow === "ac_service"
    ? "AC service details"
    : workflow === "agency"
      ? "Project details"
      : workflow === "freelancer"
        ? "Freelance project"
        : workflow.charAt(0).toUpperCase() + workflow.slice(1) + " details";
}
export function verticalDetailEntries(details: VerticalInvoiceDetails) {
  return fieldsForWorkflow(details.workflow)
    .map((field) => ({ label: field.label, value: details[field.key].trim() }))
    .filter((row) => row.value.length > 0);
}
