import {
  AESEncryptionKey,
  AESSealedData,
  aesDecryptAsync,
  aesEncryptAsync,
  getRandomBytesAsync,
} from "expo-crypto";
import { pbkdf2Async } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { utf8ToBytes } from "@noble/hashes/utils.js";
import {
  ENCRYPTED_BACKUP_ITERATIONS,
  base64ToBytes,
  bytesToBase64,
  decodeUtf8,
  encryptedBackupAad,
  parseEncryptedBackupEnvelope,
  validateBackupPassword,
} from "@/lib/encrypted-backup-format";
import { parseBackupDocument } from "@/lib/backup-format";
import type { BackupDocument, EncryptedBackupEnvelope } from "@/types/backup";

async function deriveKey(password: string, salt: Uint8Array) {
  const keyBytes = await pbkdf2Async(sha256, utf8ToBytes(password), salt, {
    c: ENCRYPTED_BACKUP_ITERATIONS,
    dkLen: 32,
  });
  return AESEncryptionKey.import(keyBytes);
}

export async function encryptBackupDocument(
  document: BackupDocument,
  password: string,
): Promise<string> {
  const passwordError = validateBackupPassword(password);
  if (passwordError) throw new Error(passwordError);
  const salt = await getRandomBytesAsync(16);
  const key = await deriveKey(password, salt);
  const header = {
    format: "invoicefine-encrypted-backup" as const,
    formatVersion: 1 as const,
    appVersion: document.appVersion,
    createdAt: document.createdAt,
    schemaVersion: document.schemaVersion,
    cipher: "AES-256-GCM" as const,
    kdf: "PBKDF2-HMAC-SHA256" as const,
    iterations: ENCRYPTED_BACKUP_ITERATIONS,
    salt: bytesToBase64(salt),
  };
  const sealed = await aesEncryptAsync(
    utf8ToBytes(JSON.stringify(document)),
    key,
    {
      additionalData: utf8ToBytes(encryptedBackupAad(header)),
      tagLength: 16,
    },
  );
  const envelope: EncryptedBackupEnvelope = {
    ...header,
    sealedData: bytesToBase64(await sealed.combined()),
  };
  return JSON.stringify(envelope);
}

export async function decryptBackupDocument(
  encryptedText: string,
  password: string,
): Promise<BackupDocument> {
  const passwordError = validateBackupPassword(password);
  if (passwordError) throw new Error(passwordError);
  const envelope = parseEncryptedBackupEnvelope(encryptedText);
  const { sealedData, ...header } = envelope;
  try {
    const key = await deriveKey(password, base64ToBytes(envelope.salt));
    const sealed = AESSealedData.fromCombined(base64ToBytes(sealedData));
    const bytes = await aesDecryptAsync(sealed, key, {
      additionalData: utf8ToBytes(encryptedBackupAad(header)),
      output: "bytes",
    });
    const parsed = parseBackupDocument(decodeUtf8(bytes));
    if (!parsed.document) throw new Error(parsed.validation.reason);
    return parsed.document;
  } catch {
    throw new Error("Wrong password, damaged file, or modified backup.");
  }
}
