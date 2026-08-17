import { afterEach, describe, expect, it, vi } from "vitest";
import { createSecurityHeaders } from "@/config/security";
import type { ContactServerConfig } from "@/server/env";
import { logContactEvent } from "@/server/contact/logging";
import {
  createContactRequestId,
  getTrustedClientAddress,
  hashRateLimitIdentifier,
  isAllowedContactOrigin,
  readRequestBodyWithLimit,
} from "@/server/contact/request";

const config: ContactServerConfig = {
  mode: "production",
  siteOrigin: "https://athira.test",
  allowedOrigins: ["https://athira.test"],
  trustVercelHeaders: true,
  email: { apiKey: "secret", fromEmail: "from@test.dev", toEmail: "to@test.dev" },
  rateLimit: {
    provider: "upstash",
    url: "https://redis.test",
    token: "token",
    hashSecret: "hash-secret",
  },
};

afterEach(() => vi.restoreAllMocks());

describe("contact request security", () => {
  it("creates non-identifying request identifiers", () => {
    const first = createContactRequestId();
    const second = createContactRequestId();
    expect(first).toMatch(/^contact_[0-9a-f-]{36}$/);
    expect(second).not.toBe(first);
  });

  it("creates deterministic keyed hashes without retaining the raw address", () => {
    const hash = hashRateLimitIdentifier("203.0.113.10", "a-private-test-secret");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain("203.0.113.10");
    expect(hashRateLimitIdentifier("203.0.113.10", "a-private-test-secret")).toBe(hash);
    expect(hashRateLimitIdentifier("203.0.113.11", "a-private-test-secret")).not.toBe(hash);
  });

  it("stops reading request bodies after the byte limit", async () => {
    const unicodeBody = `four-byte: ${String.fromCodePoint(0x1f4bb)}`;
    const withinLimit = await readRequestBodyWithLimit(
      new Request("https://athira.test/api/contact", {
        method: "POST",
        body: unicodeBody,
      }),
      20,
    );
    const oversized = await readRequestBodyWithLimit(
      new Request("https://athira.test/api/contact", {
        method: "POST",
        body: "x".repeat(21),
      }),
      20,
    );

    expect(withinLimit).toEqual({ tooLarge: false, body: unicodeBody });
    expect(oversized).toEqual({ tooLarge: true, body: "" });
  });

  it("trusts forwarding headers only for the configured Vercel environment", () => {
    const request = new Request("https://athira.test/api/contact", {
      headers: { "x-vercel-forwarded-for": "203.0.113.10, 10.0.0.1" },
    });
    expect(getTrustedClientAddress(request, config)).toBe("203.0.113.10");
    expect(
      getTrustedClientAddress(request, { ...config, trustVercelHeaders: false }),
    ).toBeNull();
  });

  it("requires an allowed origin in production", () => {
    expect(
      isAllowedContactOrigin(
        new Request("https://athira.test/api/contact", {
          headers: { origin: "https://athira.test" },
        }),
        config,
      ),
    ).toBe(true);
    expect(
      isAllowedContactOrigin(
        new Request("https://athira.test/api/contact", {
          headers: { origin: "https://attacker.test" },
        }),
        config,
      ),
    ).toBe(false);
  });

  it("logs operational categories without accepting personal fields", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    logContactEvent({
      timestamp: "2026-08-06T00:00:00.000Z",
      requestId: "contact_test",
      outcome: "accepted",
      validation: "accepted",
      rateLimit: "allowed",
      provider: "accepted",
      durationMs: 25,
    });
    const serialized = String(info.mock.calls[0][0]);
    expect(JSON.parse(serialized)).toMatchObject({
      event: "contact_submission",
      requestId: "contact_test",
      outcome: "accepted",
    });
    expect(serialized).not.toMatch(/ada@example|203\.0\.113|message/i);
  });

  it("adds CSP and production-only HSTS without unsafe-eval", () => {
    const production = createSecurityHeaders({
      isDevelopment: false,
      isProductionHttps: true,
    });
    const csp = production.find(
      (header) => header.key === "Content-Security-Policy",
    )?.value;
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("unsafe-eval");
    expect(production).toContainEqual({
      key: "Strict-Transport-Security",
      value: "max-age=31536000",
    });

    const local = createSecurityHeaders({
      isDevelopment: true,
      isProductionHttps: false,
    });
    expect(
      local.some((header) => header.key === "Strict-Transport-Security"),
    ).toBe(false);
    expect(
      local.find((header) => header.key === "Content-Security-Policy")?.value,
    ).toContain("unsafe-eval");
  });
});
