export type CatalogItemType = "product" | "service";
export type CatalogFilter = "all" | CatalogItemType;
export type ServicePricingModel =
  "fixed" | "hourly" | "per_visit" | "per_km" | "per_day";

export type CatalogItem = {
  id: string;
  type: CatalogItemType;
  name: string;
  sku: string | null;
  barcode: string | null;
  categoryName: string | null;
  brand: string | null;
  unitName: string | null;
  purchasePricePaise: number;
  sellingPricePaise: number;
  gstRateBasisPoints: number;
  currentStockScaled: number;
  lowStockThresholdScaled: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  shortName?: string | null;
  hsnSacCode?: string | null;
  mrpPaise?: number;
  wholesalePricePaise?: number;
  taxInclusive?: boolean;
  reorderLevelScaled?: number;
  storageLocation?: string | null;
  supplier?: string | null;
  description?: string | null;
  imageUri?: string | null;
  weight?: string | null;
  dimensions?: string | null;
  color?: string | null;
  size?: string | null;
  expiryDate?: string | null;
  batchNumber?: string | null;
  warranty?: string | null;
  manufacturer?: string | null;
  purchaseAccount?: string | null;
  salesAccount?: string | null;
  cogsAccount?: string | null;
  servicePricingModel?: ServicePricingModel;
  serviceDurationMinutes?: number;
  assignedStaff?: string | null;
  appointmentRequired?: boolean;
  warrantyDays?: number;
  checklist?: string[];
  internalNotes?: string | null;
  customerNotes?: string | null;
  templateId?: string | null;
  templateData?: Record<string, string>;
};

export type ProfessionalCatalogInputFields = {
  shortName: string;
  hsnSacCode: string;
  mrp: string;
  wholesalePrice: string;
  taxInclusive: boolean;
  reorderLevel: string;
  storageLocation: string;
  supplier: string;
  description: string;
  imageUri: string;
  weight: string;
  dimensions: string;
  color: string;
  size: string;
  expiryDate: string;
  batchNumber: string;
  warranty: string;
  manufacturer: string;
  purchaseAccount: string;
  salesAccount: string;
  cogsAccount: string;
  servicePricingModel: ServicePricingModel;
  serviceDurationMinutes: string;
  assignedStaff: string;
  appointmentRequired: boolean;
  warrantyDays: string;
  checklist: string;
  internalNotes: string;
  customerNotes: string;
  openingStock: string;
};

export const professionalCatalogDefaults: ProfessionalCatalogInputFields = {
  shortName: "",
  hsnSacCode: "",
  mrp: "0.00",
  wholesalePrice: "0.00",
  taxInclusive: false,
  reorderLevel: "0",
  storageLocation: "",
  supplier: "",
  description: "",
  imageUri: "",
  weight: "",
  dimensions: "",
  color: "",
  size: "",
  expiryDate: "",
  batchNumber: "",
  warranty: "",
  manufacturer: "",
  purchaseAccount: "",
  salesAccount: "",
  cogsAccount: "",
  servicePricingModel: "fixed",
  serviceDurationMinutes: "0",
  assignedStaff: "",
  appointmentRequired: false,
  warrantyDays: "0",
  checklist: "",
  internalNotes: "",
  customerNotes: "",
  openingStock: "0",
};

export type CatalogItemInput = ProfessionalCatalogInputFields & {
  type: CatalogItemType;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  unit: string;
  purchasePrice: string;
  sellingPrice: string;
  gstRate: string;
  lowStockThreshold: string;
};
