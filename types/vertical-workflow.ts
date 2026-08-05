export type VerticalWorkflow =
  | "repair"
  | "agency"
  | "freelancer"
  | "salon"
  | "plumber"
  | "ac_service"
  | "general";
export type VerticalInvoiceDetails = {
  workflow: VerticalWorkflow;
  imei: string;
  serialNumber: string;
  model: string;
  problem: string;
  accessoriesReceived: string;
  warranty: string;
  deliveryDate: string;
  technician: string;
  status: string;
  projectName: string;
  packageName: string;
  revisionCount: string;
  domain: string;
  hosting: string;
  websiteUrl: string;
  milestone: string;
  hours: string;
  advance: string;
  staff: string;
  serviceDuration: string;
  chair: string;
  appointment: string;
  visitCharge: string;
  materialCost: string;
  labour: string;
  location: string;
  gasFilled: string;
  compressor: string;
  serviceDate: string;
};
export const verticalDetailKeys = [
  "imei",
  "serialNumber",
  "model",
  "problem",
  "accessoriesReceived",
  "warranty",
  "deliveryDate",
  "technician",
  "status",
  "projectName",
  "packageName",
  "revisionCount",
  "domain",
  "hosting",
  "websiteUrl",
  "milestone",
  "hours",
  "advance",
  "staff",
  "serviceDuration",
  "chair",
  "appointment",
  "visitCharge",
  "materialCost",
  "labour",
  "location",
  "gasFilled",
  "compressor",
  "serviceDate",
] as const;
export type VerticalDetailKey = (typeof verticalDetailKeys)[number];
export function createEmptyVerticalDetails(
  workflow: VerticalWorkflow,
): VerticalInvoiceDetails {
  return {
    workflow,
    imei: "",
    serialNumber: "",
    model: "",
    problem: "",
    accessoriesReceived: "",
    warranty: "",
    deliveryDate: "",
    technician: "",
    status: "",
    projectName: "",
    packageName: "",
    revisionCount: "",
    domain: "",
    hosting: "",
    websiteUrl: "",
    milestone: "",
    hours: "",
    advance: "",
    staff: "",
    serviceDuration: "",
    chair: "",
    appointment: "",
    visitCharge: "",
    materialCost: "",
    labour: "",
    location: "",
    gasFilled: "",
    compressor: "",
    serviceDate: "",
  };
}
