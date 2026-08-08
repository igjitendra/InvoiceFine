from pathlib import Path

root = Path(__file__).resolve().parents[1]
finalization = (root / "db/repositories/invoice-finalization.ts").read_text()
profile_repo = (root / "db/repositories/product-profile.ts").read_text()
profile_ui = (root / "components/catalog/ProductProfileScreen.tsx").read_text()
stock_ui = (root / "components/catalog/StockEntryScreen.tsx").read_text()
customer_repo = (root / "db/repositories/customer-insights.ts").read_text()
customers = (root / "db/repositories/customers.ts").read_text()
customer_ui = (root / "components/customers/CustomerDetailScreen.tsx").read_text()
invoice_list = (root / "components/invoices/InvoiceListScreen.tsx").read_text()
invoice_detail = (root / "components/invoices/FinalizedInvoiceScreen.tsx").read_text()
draft = (root / "components/invoices/InvoiceDraftScreen.tsx").read_text()

# Same product on multiple lines must be aggregated before stock validation.
assert "const requiredStock = new Map<string, number>()" in finalization
assert "(requiredStock.get(line.item_id) ?? 0) + line.quantity_scaled" in finalization
assert "product.current_stock_scaled < required" in finalization
assert "AND current_stock_scaled >= ?" in finalization
assert "Not enough stock for" in finalization
assert "error instanceof Error" in draft and "error.message" in draft
print("ATOMIC_OUT_OF_STOCK_FINALIZATION_GUARD=PASS")

# Product profile and stock ledger use existing invoice and stock movement data.
assert "loadProductProfile" in profile_repo
assert "SUM(ii.quantity_scaled) quantity_scaled" in profile_repo
assert "FROM stock_movements sm" in profile_repo
assert "addProductStock" in profile_repo
assert "'manual_in'" in profile_repo
assert "Add new stock" in profile_ui
assert "Sales history" in profile_ui
assert "Stock history" in profile_ui
assert "Quantity to add" in stock_ui
print("PRODUCT_PROFILE_STOCK_AND_SALES_HISTORY=PASS")

# Customer profile exposes every invoice with an unpaid balance.
assert "outstandingInvoices" in customer_repo
assert "total_paise-paid_paise-settlement_discount_paise>0" in customer_repo
assert "Pending payments" in customer_ui
assert "invoice.outstandingPaise" in customer_ui
assert "This customer has an outstanding payment" in customers
print("CUSTOMER_PENDING_PAYMENT_PROFILE=PASS")

# Deletion is exposed but payment history is protected; unpaid stock is restored.
assert "export async function deleteInvoice" in finalization
assert "SELECT COUNT(*) count FROM payments" in finalization
assert "cannot be deleted" in finalization
assert "current_stock_scaled=current_stock_scaled+?" in finalization
assert "DELETE FROM invoices WHERE id=?" in finalization
assert "Delete" in invoice_list and "deleteInvoice(item.id)" in invoice_list
assert "Delete invoice" in invoice_detail and "deleteInvoice(id)" in invoice_detail
assert "Delete product" in profile_ui
assert "Delete customer" in customer_ui
print("SAFE_INVOICE_CUSTOMER_PRODUCT_DELETE=PASS")

print("INVENTORY_PRODUCT_PROFILE_DELETE_REGRESSION=PASS")
