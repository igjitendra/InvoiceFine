import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "@/db/database";
import {
  csvPercent as percent,
  csvQuantity as quantity,
  csvRecordStatus as archive,
  csvRupees as rupees,
  csvYesNo as yesNo,
  readableCsv as bom,
} from "@/lib/selected-csv";
import type {
  ExportCounts,
  ExportDateBounds,
  SelectedCsvExport,
  SelectedExportKey,
} from "@/types/selected-export";

type CountRow = { count: number };
type CustomerRow = {
  name: string;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  state_code: string | null;
  state_name: string | null;
  pincode: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  notes: string | null;
  is_archived: number;
  created_at: string;
};
type ItemRow = {
  name: string;
  short_name: string | null;
  sku: string | null;
  barcode: string | null;
  category: string | null;
  brand: string | null;
  unit: string | null;
  hsn_sac_code: string | null;
  purchase_price_paise: number;
  selling_price_paise: number;
  mrp_paise: number;
  wholesale_price_paise: number;
  gst_rate_basis_points: number;
  tax_inclusive: number;
  current_stock_scaled: number;
  low_stock_threshold_scaled: number | null;
  reorder_level_scaled: number;
  description: string | null;
  service_pricing_model: string;
  service_duration_minutes: number;
  appointment_required: number;
  warranty_days: number;
  is_archived: number;
  created_at: string;
};
type ExpenseRow = {
  expense_date: string;
  category: string;
  amount_paise: number;
  payee: string | null;
  notes: string | null;
  created_at: string;
};
type PaymentRow = {
  payment_date: string;
  invoice_number: string;
  customer_name: string | null;
  amount_paise: number;
  method: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
};
type InvoiceRow = {
  invoice_number: string;
  kind: string;
  status: string;
  invoice_date: string;
  due_date: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_gstin: string | null;
  currency_code: string;
  subtotal_paise: number;
  discount_paise: number;
  taxable_paise: number;
  cgst_paise: number;
  sgst_paise: number;
  igst_paise: number;
  rounding_paise: number;
  total_paise: number;
  paid_paise: number;
  settlement_discount_paise: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
type StockRow = {
  name: string;
  sku: string | null;
  barcode: string | null;
  category: string | null;
  unit: string | null;
  current_stock_scaled: number;
  low_stock_threshold_scaled: number | null;
  reorder_level_scaled: number;
  purchase_price_paise: number;
  selling_price_paise: number;
  stock_value_paise: number;
  is_archived: number;
  updated_at: string;
};

const value = (input: string | null) => input ?? "";
function rangeSql(column: string, bounds: ExportDateBounds) {
  return bounds.startDate && bounds.endDate
    ? {
        sql: ` AND ${column} BETWEEN ? AND ?`,
        params: [bounds.startDate, bounds.endDate],
      }
    : { sql: "", params: [] as string[] };
}
function datedFile(prefix: string, bounds: ExportDateBounds) {
  const range =
    bounds.startDate && bounds.endDate
      ? `${bounds.startDate}_to_${bounds.endDate}`
      : "All_Time";
  return `InvoiceFine_${prefix}_${range}.csv`;
}

async function count(
  db: SQLiteDatabase,
  sql: string,
  params: Array<string | number> = [],
) {
  const row = await db.getFirstAsync<CountRow>(sql, ...params);
  return row?.count ?? 0;
}
export async function loadSelectedExportCounts(
  bounds: ExportDateBounds,
  includeArchived: boolean,
): Promise<ExportCounts> {
  const db = await getDatabase(),
    invoiceRange = rangeSql("invoice_date", bounds),
    expenseRange = rangeSql("expense_date", bounds),
    paymentRange = rangeSql("payment_date", bounds),
    active = includeArchived ? "" : " AND is_archived=0";
  return {
    customers: await count(
      db,
      `SELECT COUNT(*) count FROM customers WHERE 1=1${active}`,
    ),
    products: await count(
      db,
      `SELECT COUNT(*) count FROM items WHERE type='product'${active}`,
    ),
    services: await count(
      db,
      `SELECT COUNT(*) count FROM items WHERE type='service'${active}`,
    ),
    expenses: await count(
      db,
      `SELECT COUNT(*) count FROM expenses WHERE 1=1${expenseRange.sql}`,
      expenseRange.params,
    ),
    payments: await count(
      db,
      `SELECT COUNT(*) count FROM payments WHERE 1=1${paymentRange.sql}`,
      paymentRange.params,
    ),
    invoices: await count(
      db,
      `SELECT COUNT(*) count FROM invoices WHERE 1=1${invoiceRange.sql}`,
      invoiceRange.params,
    ),
    stock: await count(
      db,
      `SELECT COUNT(*) count FROM items WHERE type='product'${active}`,
    ),
  };
}

async function customers(
  db: SQLiteDatabase,
  includeArchived: boolean,
): Promise<SelectedCsvExport> {
  const active = includeArchived ? "" : " WHERE is_archived=0",
    rows = await db.getAllAsync<CustomerRow>(
      `SELECT name,phone,email,gstin,state_code,state_name,pincode,billing_address,shipping_address,notes,is_archived,created_at FROM customers${active} ORDER BY name COLLATE NOCASE`,
    );
  return {
    key: "customers",
    label: "Customers",
    fileName: "InvoiceFine_Customers.csv",
    rowCount: rows.length,
    csv: bom([
      [
        "Name",
        "Phone",
        "Email",
        "GSTIN",
        "StateCode",
        "State",
        "Pincode",
        "BillingAddress",
        "ShippingAddress",
        "Notes",
        "RecordStatus",
        "CreatedAt",
      ],
      ...rows.map((r) => [
        r.name,
        value(r.phone),
        value(r.email),
        value(r.gstin),
        value(r.state_code),
        value(r.state_name),
        value(r.pincode),
        value(r.billing_address),
        value(r.shipping_address),
        value(r.notes),
        archive(r.is_archived),
        r.created_at,
      ]),
    ]),
  };
}
async function catalog(
  db: SQLiteDatabase,
  type: "product" | "service",
  includeArchived: boolean,
): Promise<SelectedCsvExport> {
  const active = includeArchived ? "" : " AND i.is_archived=0",
    rows = await db.getAllAsync<ItemRow>(
      `SELECT i.name,i.short_name,i.sku,i.barcode,c.name category,i.brand,u.name unit,i.hsn_sac_code,i.purchase_price_paise,i.selling_price_paise,i.mrp_paise,i.wholesale_price_paise,i.gst_rate_basis_points,i.tax_inclusive,i.current_stock_scaled,i.low_stock_threshold_scaled,i.reorder_level_scaled,i.description,i.service_pricing_model,i.service_duration_minutes,i.appointment_required,i.warranty_days,i.is_archived,i.created_at FROM items i LEFT JOIN categories c ON c.id=i.category_id LEFT JOIN units u ON u.id=i.unit_id WHERE i.type=?${active} ORDER BY i.name COLLATE NOCASE`,
      type,
    );
  const product = type === "product";
  return {
    key: product ? "products" : "services",
    label: product ? "Products" : "Services",
    fileName: `InvoiceFine_${product ? "Products" : "Services"}.csv`,
    rowCount: rows.length,
    csv: bom(
      product
        ? [
            [
              "Name",
              "ShortName",
              "SKU",
              "Barcode",
              "Category",
              "Brand",
              "Unit",
              "HSN",
              "PurchasePriceINR",
              "SellingPriceINR",
              "MRPINR",
              "WholesalePriceINR",
              "GSTPercent",
              "TaxInclusive",
              "CurrentStock",
              "LowStock",
              "ReorderLevel",
              "Description",
              "RecordStatus",
              "CreatedAt",
            ],
            ...rows.map((r) => [
              r.name,
              value(r.short_name),
              value(r.sku),
              value(r.barcode),
              value(r.category),
              value(r.brand),
              value(r.unit),
              value(r.hsn_sac_code),
              rupees(r.purchase_price_paise),
              rupees(r.selling_price_paise),
              rupees(r.mrp_paise),
              rupees(r.wholesale_price_paise),
              percent(r.gst_rate_basis_points),
              yesNo(r.tax_inclusive),
              quantity(r.current_stock_scaled),
              quantity(r.low_stock_threshold_scaled ?? 0),
              quantity(r.reorder_level_scaled),
              value(r.description),
              archive(r.is_archived),
              r.created_at,
            ]),
          ]
        : [
            [
              "Name",
              "ShortName",
              "SKU",
              "Category",
              "Unit",
              "SAC",
              "SellingPriceINR",
              "GSTPercent",
              "TaxInclusive",
              "PricingModel",
              "DurationMinutes",
              "AppointmentRequired",
              "WarrantyDays",
              "Description",
              "RecordStatus",
              "CreatedAt",
            ],
            ...rows.map((r) => [
              r.name,
              value(r.short_name),
              value(r.sku),
              value(r.category),
              value(r.unit),
              value(r.hsn_sac_code),
              rupees(r.selling_price_paise),
              percent(r.gst_rate_basis_points),
              yesNo(r.tax_inclusive),
              r.service_pricing_model,
              String(r.service_duration_minutes),
              yesNo(r.appointment_required),
              String(r.warranty_days),
              value(r.description),
              archive(r.is_archived),
              r.created_at,
            ]),
          ],
    ),
  };
}
async function expenses(
  db: SQLiteDatabase,
  bounds: ExportDateBounds,
): Promise<SelectedCsvExport> {
  const range = rangeSql("e.expense_date", bounds),
    rows = await db.getAllAsync<ExpenseRow>(
      `SELECT e.expense_date,c.name category,e.amount_paise,e.payee,e.notes,e.created_at FROM expenses e JOIN categories c ON c.id=e.category_id WHERE 1=1${range.sql} ORDER BY e.expense_date DESC,e.created_at DESC`,
      ...range.params,
    );
  return {
    key: "expenses",
    label: "Expenses",
    fileName: datedFile("Expenses", bounds),
    rowCount: rows.length,
    csv: bom([
      ["ExpenseDate", "Category", "AmountINR", "Payee", "Notes", "CreatedAt"],
      ...rows.map((r) => [
        r.expense_date,
        r.category,
        rupees(r.amount_paise),
        value(r.payee),
        value(r.notes),
        r.created_at,
      ]),
    ]),
  };
}
async function payments(
  db: SQLiteDatabase,
  bounds: ExportDateBounds,
): Promise<SelectedCsvExport> {
  const range = rangeSql("p.payment_date", bounds),
    rows = await db.getAllAsync<PaymentRow>(
      `SELECT p.payment_date,i.invoice_number,i.customer_name_snapshot customer_name,p.amount_paise,p.method,p.reference,p.notes,p.created_at FROM payments p JOIN invoices i ON i.id=p.invoice_id WHERE 1=1${range.sql} ORDER BY p.payment_date DESC,p.created_at DESC`,
      ...range.params,
    );
  return {
    key: "payments",
    label: "Payments",
    fileName: datedFile("Payments", bounds),
    rowCount: rows.length,
    csv: bom([
      [
        "PaymentDate",
        "InvoiceNumber",
        "Customer",
        "AmountINR",
        "Method",
        "Reference",
        "Notes",
        "CreatedAt",
      ],
      ...rows.map((r) => [
        r.payment_date,
        r.invoice_number,
        value(r.customer_name),
        rupees(r.amount_paise),
        r.method,
        value(r.reference),
        value(r.notes),
        r.created_at,
      ]),
    ]),
  };
}
async function invoices(
  db: SQLiteDatabase,
  bounds: ExportDateBounds,
): Promise<SelectedCsvExport> {
  const range = rangeSql("invoice_date", bounds),
    rows = await db.getAllAsync<InvoiceRow>(
      `SELECT invoice_number,kind,status,invoice_date,due_date,customer_name_snapshot customer_name,customer_phone_snapshot customer_phone,customer_gstin_snapshot customer_gstin,currency_code_snapshot currency_code,subtotal_paise,discount_paise,taxable_paise,cgst_paise,sgst_paise,igst_paise,rounding_paise,total_paise,paid_paise,settlement_discount_paise,notes,created_at,updated_at FROM invoices WHERE 1=1${range.sql} ORDER BY invoice_date DESC,created_at DESC`,
      ...range.params,
    );
  return {
    key: "invoices",
    label: "Invoices",
    fileName: datedFile("Invoices", bounds),
    rowCount: rows.length,
    csv: bom([
      [
        "InvoiceNumber",
        "Kind",
        "Status",
        "InvoiceDate",
        "DueDate",
        "Customer",
        "CustomerPhone",
        "CustomerGSTIN",
        "Currency",
        "Subtotal",
        "Discount",
        "Taxable",
        "CGST",
        "SGST",
        "IGST",
        "Rounding",
        "Total",
        "Paid",
        "PaymentDiscount",
        "Outstanding",
        "Notes",
        "CreatedAt",
        "UpdatedAt",
      ],
      ...rows.map((r) => [
        r.invoice_number,
        r.kind,
        r.status,
        r.invoice_date,
        value(r.due_date),
        value(r.customer_name),
        value(r.customer_phone),
        value(r.customer_gstin),
        r.currency_code,
        rupees(r.subtotal_paise),
        rupees(r.discount_paise),
        rupees(r.taxable_paise),
        rupees(r.cgst_paise),
        rupees(r.sgst_paise),
        rupees(r.igst_paise),
        rupees(r.rounding_paise),
        rupees(r.total_paise),
        rupees(r.paid_paise),
        rupees(r.settlement_discount_paise),
        rupees(r.total_paise - r.paid_paise - r.settlement_discount_paise),
        value(r.notes),
        r.created_at,
        r.updated_at,
      ]),
    ]),
  };
}
async function stock(
  db: SQLiteDatabase,
  includeArchived: boolean,
): Promise<SelectedCsvExport> {
  const active = includeArchived ? "" : " AND i.is_archived=0",
    rows = await db.getAllAsync<StockRow>(
      `SELECT i.name,i.sku,i.barcode,c.name category,u.name unit,i.current_stock_scaled,i.low_stock_threshold_scaled,i.reorder_level_scaled,i.purchase_price_paise,i.selling_price_paise,CAST(ROUND(i.purchase_price_paise*i.current_stock_scaled/1000.0) AS INTEGER) stock_value_paise,i.is_archived,i.updated_at FROM items i LEFT JOIN categories c ON c.id=i.category_id LEFT JOIN units u ON u.id=i.unit_id WHERE i.type='product'${active} ORDER BY i.name COLLATE NOCASE`,
    );
  return {
    key: "stock",
    label: "Stock",
    fileName: "InvoiceFine_Stock_Snapshot.csv",
    rowCount: rows.length,
    csv: bom([
      [
        "Product",
        "SKU",
        "Barcode",
        "Category",
        "Unit",
        "CurrentStock",
        "LowStock",
        "ReorderLevel",
        "PurchasePriceINR",
        "SellingPriceINR",
        "StockValueAtCostINR",
        "StockStatus",
        "RecordStatus",
        "UpdatedAt",
      ],
      ...rows.map((r) => [
        r.name,
        value(r.sku),
        value(r.barcode),
        value(r.category),
        value(r.unit),
        quantity(r.current_stock_scaled),
        quantity(r.low_stock_threshold_scaled ?? 0),
        quantity(r.reorder_level_scaled),
        rupees(r.purchase_price_paise),
        rupees(r.selling_price_paise),
        rupees(r.stock_value_paise),
        r.current_stock_scaled <= 0
          ? "Out of stock"
          : r.low_stock_threshold_scaled !== null &&
              r.current_stock_scaled <= r.low_stock_threshold_scaled
            ? "Low stock"
            : "In stock",
        archive(r.is_archived),
        r.updated_at,
      ]),
    ]),
  };
}

export async function buildSelectedCsvExport(
  key: SelectedExportKey,
  bounds: ExportDateBounds,
  includeArchived: boolean,
): Promise<SelectedCsvExport> {
  const db = await getDatabase();
  switch (key) {
    case "customers":
      return customers(db, includeArchived);
    case "products":
      return catalog(db, "product", includeArchived);
    case "services":
      return catalog(db, "service", includeArchived);
    case "expenses":
      return expenses(db, bounds);
    case "payments":
      return payments(db, bounds);
    case "invoices":
      return invoices(db, bounds);
    case "stock":
      return stock(db, includeArchived);
  }
}
