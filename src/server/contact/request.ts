import { createHmac, randomUUID } from "node:crypto";
import type { ContactServerConfig } from "../env";

export function createContactRequestId(): string {
  return `contact_${randomUUID()}`;
}

export function getContactSubmissionKey(request: Request): string {
  const candidate = request.headers.get("x-contact-submission-key")?.trim();
  return candidate && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate)
    ? candidate.toLowerCase()
    : randomUUID();
}

export function createDecoyContactReference(): string {
  return `ATH-${randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}

export async function readRequestBodyWithLimit(
  request: Request,
  maximumBytes: number,
): Promise<{ tooLarge: boolean; body: string }> {
  if (!request.body) {
    return { tooLarge: false, body: "" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        return { tooLarge: true, body: "" };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { tooLarge: false, body: new TextDecoder().decode(bytes) };
}

export function isAllowedContactOrigin(
  request: Request,
  config: ContactServerConfig,
): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return config.mode !== "production";
  }

  try {
    const normalizedOrigin = new URL(origin).origin;
    const requestOrigin = new URL(request.url).origin;
    return (
      normalizedOrigin === requestOrigin ||
      config.allowedOrigins.includes(normalizedOrigin)
    );
  } catch {
    return false;
  }
}

export function getTrustedClientAddress(
  request: Request,
  config: ContactServerConfig,
): string | null {
  if (config.trustVercelHeaders) {
    const address =
      request.headers.get("x-vercel-forwarded-for") ??
      request.headers.get("x-forwarded-for");
    return address?.split(",")[0]?.trim() || null;
  }

  if (config.mode === "production") {
    return null;
  }

  return (
    request.headers.get("x-test-client-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local-development-client"
  );
}

export function hashRateLimitIdentifier(
  address: string,
  secret: string,
): string {
  return createHmac("sha256", secret).update(address).digest("hex");
}
