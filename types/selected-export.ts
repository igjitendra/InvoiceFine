export type SelectedExportKey =
  | "customers"
  | "products"
  | "services"
  | "expenses"
  | "payments"
  | "invoices"
  | "stock";

export type ExportDateRange = "all" | "this_month" | "financial_year";

export type ExportDateBounds = {
  startDate: string | null;
  endDate: string | null;
};

export type SelectedCsvExport = {
  key: SelectedExportKey;
  label: string;
  fileName: string;
  csv: string;
  rowCount: number;
};

export type ExportCounts = Record<SelectedExportKey, number>;
