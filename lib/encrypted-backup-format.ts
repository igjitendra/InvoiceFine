import type { EncryptedBackupEnvelope } from "../types/backup";
import { isBackupRecord } from "./backup-format";

export const ENCRYPTED_BACKUP_ITERATIONS = 210000 as const;
const alphabet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function decodeUtf8(bytes: Uint8Array): string {
  const output: string[] = [];
  let index = 0;
  function continuation(position: number): number {
    const value = bytes[position];
    if (value === undefined || (value & 0xc0) !== 0x80)
      throw new Error("Backup plaintext is not valid UTF-8.");
    return value & 0x3f;
  }
  while (index < bytes.length) {
    const first = bytes[index];
    if (first === undefined) break;
    if (first <= 0x7f) {
      output.push(String.fromCodePoint(first));
      index += 1;
    } else if (first >= 0xc2 && first <= 0xdf) {
      output.push(
        String.fromCodePoint(((first & 0x1f) << 6) | continuation(index + 1)),
      );
      index += 2;
    } else if (first >= 0xe0 && first <= 0xef) {
      const second = continuation(index + 1);
      const third = continuation(index + 2);
      if (
        (first === 0xe0 && second < 0x20) ||
        (first === 0xed && second >= 0x20)
      )
        throw new Error("Backup plaintext is not valid UTF-8.");
      output.push(
        String.fromCodePoint(((first & 0x0f) << 12) | (second << 6) | third),
      );
      index += 3;
    } else if (first >= 0xf0 && first <= 0xf4) {
      const second = continuation(index + 1);
      const third = continuation(index + 2);
      const fourth = continuation(index + 3);
      if (
        (first === 0xf0 && second < 0x10) ||
        (first === 0xf4 && second >= 0x10)
      )
        throw new Error("Backup plaintext is not valid UTF-8.");
      output.push(
        String.fromCodePoint(
          ((first & 0x07) << 18) | (second << 12) | (third << 6) | fourth,
        ),
      );
      index += 4;
    } else {
      throw new Error("Backup plaintext is not valid UTF-8.");
    }
  }
  return output.join("");
}

export function bytesToBase64(bytes: Uint8Array): string {
  let result = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0;
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    const value = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);
    result += alphabet[(value >>> 18) & 63] ?? "";
    result += alphabet[(value >>> 12) & 63] ?? "";
    result += second === undefined ? "=" : (alphabet[(value >>> 6) & 63] ?? "");
    result += third === undefined ? "=" : (alphabet[value & 63] ?? "");
  }
  return result;
}

export function base64ToBytes(value: string): Uint8Array {
  if (
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      value,
    )
  )
    throw new Error("Backup contains invalid encoded data.");
  const output: number[] = [];
  for (let index = 0; index < value.length; index += 4) {
    const a = alphabet.indexOf(value[index] ?? "");
    const b = alphabet.indexOf(value[index + 1] ?? "");
    const c =
      value[index + 2] === "=" ? 0 : alphabet.indexOf(value[index + 2] ?? "");
    const d =
      value[index + 3] === "=" ? 0 : alphabet.indexOf(value[index + 3] ?? "");
    const combined = (a << 18) | (b << 12) | (c << 6) | d;
    output.push((combined >>> 16) & 255);
    if (value[index + 2] !== "=") output.push((combined >>> 8) & 255);
    if (value[index + 3] !== "=") output.push(combined & 255);
  }
  return Uint8Array.from(output);
}

export function encryptedBackupAad(
  envelope: Omit<EncryptedBackupEnvelope, "sealedData">,
): string {
  return JSON.stringify(envelope);
}

export function validateEncryptedBackupEnvelope(
  value: unknown,
): value is EncryptedBackupEnvelope {
  if (!isBackupRecord(value)) return false;
  if (
    value.format !== "invoicefine-encrypted-backup" ||
    value.formatVersion !== 1 ||
    value.cipher !== "AES-256-GCM" ||
    value.kdf !== "PBKDF2-HMAC-SHA256" ||
    value.iterations !== ENCRYPTED_BACKUP_ITERATIONS ||
    typeof value.appVersion !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.schemaVersion !== "number" ||
    typeof value.salt !== "string" ||
    typeof value.sealedData !== "string"
  )
    return false;
  try {
    return (
      base64ToBytes(value.salt).length === 16 &&
      base64ToBytes(value.sealedData).length >= 29
    );
  } catch {
    return false;
  }
}

export function parseEncryptedBackupEnvelope(
  text: string,
): EncryptedBackupEnvelope {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("This is not a valid InvoiceFine encrypted backup.");
  }
  if (!validateEncryptedBackupEnvelope(value))
    throw new Error("Unsupported or incomplete encrypted backup.");
  return value;
}

export function validateBackupPassword(password: string): string | null {
  if (password.length < 8) return "Use at least 8 characters.";
  if (password.length > 128) return "Password must be 128 characters or fewer.";
  return null;
}
