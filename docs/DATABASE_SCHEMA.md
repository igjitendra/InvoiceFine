# SQLite Data Model

## General rules

- IDs: text UUIDs.
- Money: integer paise.
- Quantities: integer for indivisible units or scaled decimal strategy defined centrally.
- Timestamps: ISO 8601 UTC text.
- Soft-delete or archive catalog/customer records referenced by financial history.
- Use foreign keys and transactions.
- Add `created_at` and `updated_at` to mutable entities.

## Tables

### business_settings

- `id`
- `business_name`
- `gstin` nullable
- `state_code` nullable
- `address`
- `phone`
- `email` nullable
- `logo_uri` nullable
- `signature_uri` nullable
- `payment_qr_uri` nullable
- `invoice_prefix`
- `next_invoice_number`
- `tax_enabled`
- `currency_code`
- timestamps

### customers

- `id`
- `name`
- `phone` nullable
- `email` nullable
- `gstin` nullable
- `state_code` nullable
- `billing_address` nullable
- `notes` nullable
- `is_archived`
- timestamps

### categories

- `id`
- `kind`: item or expense
- `name`
- `is_archived`

### units

- `id`
- `name`
- `short_name`
- optional GST unit code

### items

- `id`
- `type`: product or service
- `name`
- `sku` nullable
- `barcode` nullable
- `category_id` nullable
- `brand` nullable
- `unit_id` nullable
- `purchase_price_paise`
- `selling_price_paise`
- `gst_rate_basis_points`
- `current_stock_scaled`
- `low_stock_threshold_scaled` nullable
- `is_archived`
- timestamps

### invoices

- `id`
- `invoice_number` unique
- `kind`: tax_invoice or non_tax_invoice for MVP
- `status`: draft, finalized, partially_paid, paid, overdue, cancelled
- `customer_id` nullable
- `invoice_date`
- `due_date` nullable
- customer snapshot fields
- business snapshot fields
- `subtotal_paise`
- `discount_paise`
- `taxable_paise`
- `cgst_paise`
- `sgst_paise`
- `igst_paise`
- `rounding_paise`
- `total_paise`
- `paid_paise`
- `notes` nullable
- `finalized_at` nullable
- timestamps

### invoice_items

- `id`
- `invoice_id`
- `item_id` nullable
- `item_type`
- description snapshot
- SKU/unit snapshots nullable
- `quantity_scaled`
- `unit_price_paise`
- `cost_price_paise`
- `discount_paise`
- `gst_rate_basis_points`
- `taxable_paise`
- tax amount fields
- `line_total_paise`
- `sort_order`

### payments

- `id`
- `invoice_id`
- `customer_id` nullable
- `amount_paise`
- `payment_date`
- `method`
- `reference` nullable
- `notes` nullable
- timestamps

### expenses

- `id`
- `category_id`
- `expense_date`
- `amount_paise`
- `payee` nullable
- `notes` nullable
- timestamps

### stock_movements

- `id`
- `item_id`
- `type`: opening, sale, sale_reversal, manual_in, manual_out, adjustment
- `quantity_delta_scaled`
- `reference_type` nullable
- `reference_id` nullable
- `reason` nullable
- `occurred_at`
- `created_at`

### schema_migrations

- `version`
- `name`
- `applied_at`

## Required indexes

- invoice date and status
- invoice customer
- payment invoice/customer/date
- expense date/category
- item name, SKU, barcode, archived state
- stock movement item/date
- customer name and phone

## Transaction boundaries

### Finalize invoice

One transaction must:

1. validate the draft
2. allocate invoice number
3. calculate and store snapshots/totals
4. change status to finalized
5. create stock-out movements
6. update current product stock
7. increment next invoice number

### Record payment

One transaction must:

1. validate positive amount and outstanding limit
2. insert payment
3. recalculate paid amount
4. set invoice payment status

### Cancel finalized invoice

One transaction must:

1. validate cancellation rules
2. mark invoice cancelled
3. create reversal stock movements when applicable
4. update current stock
5. preserve invoice and payment history
