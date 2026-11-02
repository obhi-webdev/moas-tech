import crypto from "node:crypto";

function getKey() {
  const secret = process.env.META_ENCRYPTION_KEY;

  if (!secret || !/^[a-f0-9]{64}$/i.test(secret)) {
    throw new Error("META_ENCRYPTION_KEY must be 64 hex characters");
  }

  return Buffer.from(secret, "hex");
}

export function encryptToken(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  return [
    iv.toString("hex"),
    cipher.getAuthTag().toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptToken(value) {
  const [iv, tag, encrypted] = value.split(":");

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(tag, "hex"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "hex")),
    decipher.final(),
  ]).toString("utf8");
}
