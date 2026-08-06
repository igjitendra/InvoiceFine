import {
  base64ToBytes,
  bytesToBase64,
  decodeUtf8,
  parseEncryptedBackupEnvelope,
  validateBackupPassword,
  validateEncryptedBackupEnvelope,
} from "../lib/encrypted-backup-format";

const bytes = Uint8Array.from([0, 1, 2, 127, 128, 254, 255]);
const encoded = bytesToBase64(bytes);
const decoded = base64ToBytes(encoded);
if (
  decoded.length !== bytes.length ||
  decoded.some((value, index) => value !== bytes[index])
)
  throw new Error("Base64 round-trip failed");
const unicodeBytes = Uint8Array.from([
  0x49, 0x6e, 0x76, 0x6f, 0x69, 0x63, 0x65, 0x46, 0x69, 0x6e, 0x65, 0x20, 0xe0,
  0xa4, 0xb8, 0xe0, 0xa5, 0x81, 0xe0, 0xa4, 0xb0, 0xe0, 0xa4, 0x95, 0xe0, 0xa5,
  0x8d, 0xe0, 0xa4, 0xb7, 0xe0, 0xa4, 0xbf, 0xe0, 0xa4, 0xa4, 0x20, 0xf0, 0x9f,
  0x94, 0x90,
]);
if (decodeUtf8(unicodeBytes) !== "InvoiceFine सुरक्षित 🔐")
  throw new Error("UTF-8 decoding failed");
const envelope = {
  format: "invoicefine-encrypted-backup",
  formatVersion: 1,
  appVersion: "1.0.0",
  createdAt: "2026-08-06T10:00:00.000Z",
  schemaVersion: 9,
  cipher: "AES-256-GCM",
  kdf: "PBKDF2-HMAC-SHA256",
  iterations: 210000,
  salt: bytesToBase64(new Uint8Array(16)),
  sealedData: bytesToBase64(new Uint8Array(40)),
};
if (!validateEncryptedBackupEnvelope(envelope))
  throw new Error("Valid envelope rejected");
if (validateEncryptedBackupEnvelope({ ...envelope, iterations: 1000 }))
  throw new Error("Weak KDF accepted");
if (parseEncryptedBackupEnvelope(JSON.stringify(envelope)).schemaVersion !== 9)
  throw new Error("Envelope parse failed");
if (
  validateBackupPassword("12345678") !== null ||
  !validateBackupPassword("short")
)
  throw new Error("Password policy failed");
console.log("IFB_ENVELOPE_VALIDATION=PASS");
console.log("BASE64_BINARY_ROUND_TRIP=PASS");
console.log("BACKUP_PASSWORD_POLICY=PASS");
console.log("UTF8_BACKUP_DECODING=PASS");
