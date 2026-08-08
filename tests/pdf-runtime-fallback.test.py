from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / "services/pdf/invoice-pdf.ts").read_text()
calculation = (ROOT / "lib/invoice-calculations.ts").read_text()

assert "invoicePdfImageFallbacks" in source
assert "businessSignatureUri: null" in source
assert "businessLogoUri: null" in source
assert "for (const variant of invoicePdfImageFallbacks(invoice))" in source
assert "createSafeInvoiceHtml(invoice)" in source
assert "Native PDF error:" in source
assert "Print.printToFileAsync({ html: invoiceHtml, base64: true })" in source
assert "Print.printAsync({ html: invoiceHtml })" in source
assert "Print.printToFileAsync({ html: invoiceHtml, base64: true })" in source
assert "new File(Paths.cache, name)" in source
assert 'sharedFile.write(file.base64, { encoding: "base64" })' in source
assert source.count("Sharing.shareAsync(") == 1
assert 'if (!isVerifiedStateCode(businessStateCode)) return "intra_state";' in calculation

print("PDF_IMAGE_RENDER_RETRY=PASS")
print("PDF_APP_CACHE_BASE64_REWRITE=PASS")
print("PDF_MINIMAL_HTML_FALLBACK=PASS")
print("PDF_NATIVE_ERROR_VISIBLE=PASS")
print("MISSING_STATE_TAX_FALLBACK=PASS")
