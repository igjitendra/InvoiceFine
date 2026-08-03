export type CatalogItemType = 'product' | 'service';
export type CatalogFilter = 'all' | CatalogItemType;

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
};

export type CatalogItemInput = {
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
