import { strings } from "@/constants/strings";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const invoicePrefixPattern = /^[A-Z0-9/-]{2,10}$/;
const phonePattern = /^[6-9][0-9]{9}$/;
const stateCodePattern = /^(0[1-9]|[1-3][0-9]|[4-8][0-9]|9[0-7])$/;

export function validateRequired(value: string): true | string {
  return value.trim().length > 0 || strings.onboarding.validation.required;
}

export function validatePhone(value: string): true | string {
  return phonePattern.test(value.trim()) || strings.onboarding.validation.phone;
}

export function validateOptionalPhone(value: string): true | string {
  const normalized = value.trim();
  return normalized.length === 0 || phonePattern.test(normalized)
    ? true
    : strings.customers.validation.phone;
}

export function validateOptionalEmail(value: string): true | string {
  const normalized = value.trim();
  return normalized.length === 0 || emailPattern.test(normalized)
    ? true
    : strings.onboarding.validation.email;
}

export function validateOptionalGstin(value: string): true | string {
  const normalized = value.trim().toUpperCase();
  return normalized.length === 0 || gstinPattern.test(normalized)
    ? true
    : strings.customers.validation.gstin;
}

export function validateOptionalStateCode(value: string): true | string {
  const normalized = value.trim();
  return normalized.length === 0 || stateCodePattern.test(normalized)
    ? true
    : strings.customers.validation.stateCode;
}

export function validateGstin(
  value: string,
  taxEnabled: boolean,
): true | string {
  const normalized = value.trim().toUpperCase();
  if (!taxEnabled && normalized.length === 0) return true;
  return gstinPattern.test(normalized) || strings.onboarding.validation.gstin;
}

export function validateStateCode(
  value: string,
  taxEnabled: boolean,
): true | string {
  const normalized = value.trim();
  if (!taxEnabled && normalized.length === 0) return true;
  return (
    stateCodePattern.test(normalized) || strings.onboarding.validation.stateCode
  );
}

export function validateInvoicePrefix(value: string): true | string {
  return (
    invoicePrefixPattern.test(value.trim().toUpperCase()) ||
    strings.onboarding.validation.invoicePrefix
  );
}

export function validateInvoiceNumber(value: string): true | string {
  const normalized = value.trim();
  const parsed = Number(normalized);
  return (
    (/^[0-9]+$/.test(normalized) &&
      Number.isSafeInteger(parsed) &&
      parsed > 0) ||
    strings.onboarding.validation.invoiceNumber
  );
}
