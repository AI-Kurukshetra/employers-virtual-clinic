const ALGO = "AES-GCM";

function toUint8Array(value: string, mode: "base64" | "utf8") {
  if (mode === "utf8") {
    return new TextEncoder().encode(value);
  }

  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey() {
  const raw = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  if (!raw) throw new Error("NEXT_PUBLIC_ENCRYPTION_KEY is not configured");

  const keyBytes = toUint8Array(raw, "utf8");
  const digest = await crypto.subtle.digest("SHA-256", keyBytes);

  return crypto.subtle.importKey("raw", digest, { name: ALGO }, false, ["decrypt"]);
}

export async function decryptClientMessage(serialized: string) {
  const parsed = JSON.parse(serialized) as { iv: string; authTag: string; ciphertext: string };
  const key = await getCryptoKey();

  const iv = toUint8Array(parsed.iv, "base64");
  const authTag = toUint8Array(parsed.authTag, "base64");
  const ciphertext = toUint8Array(parsed.ciphertext, "base64");

  const combined = new Uint8Array(ciphertext.length + authTag.length);
  combined.set(ciphertext, 0);
  combined.set(authTag, ciphertext.length);

  const plainBuffer = await crypto.subtle.decrypt({ name: ALGO, iv, tagLength: 128 }, key, combined);

  return new TextDecoder().decode(plainBuffer);
}
