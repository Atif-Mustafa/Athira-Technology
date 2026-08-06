import { describe, expect, it, vi } from "vitest";
import type { ContactServerConfig, EnvironmentValidationResult } from "@/server/env";
import type { ContactEmailResult } from "@/server/contact/email";
import { createContactHandler } from "@/server/contact/handler";
import type { ContactRateLimitResult } from "@/server/contact/rate-limit";

const validSubmission = {
  fullName: "Ada Lovelace",
  workEmail: "ada@example.com",
  companyName: "Analytical Engines Ltd",
  interest: "ai-software-engineer",
  projectStage: "defining-pilot",
  budgetRange: "prototype-implementation",
  message: "We are evaluating a governed planning and testing workflow.",
  consent: true,
  website: "",
} as const;

const config: ContactServerConfig = {
  mode: "test",
  siteOrigin: "http://localhost:3000",
  allowedOrigins: ["http://localhost:3000"],
  trustVercelHeaders: false,
  email: {
    apiKey: "resend-secret-that-must-not-leak",
    fromEmail: "contact@athira.test",
    toEmail: "private-recipient@athira.test",
  },
  rateLimit: { provider: "memory", hashSecret: "rate-limit-secret" },
};

const allowed: ContactRateLimitResult = {
  available: true,
  allowed: true,
  limit: 3,
  remaining: 2,
  resetAt: 901_000,
};

function makeRequest(
  body: unknown = validSubmission,
  options: { contentType?: string; raw?: string; headers?: HeadersInit } = {},
) {
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: {
      "content-type": options.contentType ?? "application/json",
      origin: "http://localhost:3000",
      "x-test-client-ip": "203.0.113.10",
      ...options.headers,
    },
    body: options.raw ?? JSON.stringify(body),
  });
}

function setup({
  configResult = { success: true, config } as EnvironmentValidationResult,
  rateLimitResult = allowed,
  emailResult = { status: "accepted", providerMessageId: "email_test" } as ContactEmailResult,
  emailFailure,
}: {
  configResult?: EnvironmentValidationResult;
  rateLimitResult?: ContactRateLimitResult;
  emailResult?: ContactEmailResult;
  emailFailure?: Error;
} = {}) {
  const limit = vi.fn().mockResolvedValue(rateLimitResult);
  const send = emailFailure
    ? vi.fn().mockRejectedValue(emailFailure)
    : vi.fn().mockResolvedValue(emailResult);
  const logger = vi.fn();
  const createRateLimiter = vi.fn(() => ({ limit }));
  const createEmailProvider = vi.fn(() => ({ send }));
  const handler = createContactHandler({
    getConfig: () => configResult,
    createRateLimiter,
    createEmailProvider,
    createRequestId: () => "contact_test_request",
    logger,
    now: () => 1_000,
  });

  return { handler, limit, send, logger, createRateLimiter, createEmailProvider };
}

async function responseJson(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("POST /api/contact", () => {
  it("accepts a valid enquiry only after rate limiting and provider acceptance", async () => {
    const context = setup();
    const response = await context.handler(makeRequest());
    const body = await responseJson(response);

    expect(response.status).toBe(202);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-request-id")).toBe("contact_test_request");
    expect(body).toEqual({
      ok: true,
      requestId: "contact_test_request",
      message: "Your enquiry was delivered to Athira Technology.",
    });
    expect(context.limit).toHaveBeenCalledOnce();
    expect(context.limit.mock.calls[0][0]).toMatch(/^[0-9a-f]{64}$/);
    expect(context.send).toHaveBeenCalledOnce();
    expect(context.send.mock.calls[0][0]).toMatchObject({
      replyTo: "ada@example.com",
      requestId: "contact_test_request",
    });
  });

  it("rejects malformed JSON", async () => {
    const context = setup();
    const response = await context.handler(makeRequest(undefined, { raw: "{" }));

    expect(response.status).toBe(400);
    expect(await responseJson(response)).toMatchObject({ code: "invalid_request" });
    expect(context.send).not.toHaveBeenCalled();
  });

  it("rejects unsupported content types", async () => {
    const context = setup();
    const response = await context.handler(
      makeRequest(undefined, { contentType: "text/plain", raw: "hello" }),
    );

    expect(response.status).toBe(415);
    expect(context.limit).not.toHaveBeenCalled();
  });

  it("returns structured field errors for invalid and unknown input", async () => {
    const context = setup();
    const response = await context.handler(
      makeRequest({ ...validSubmission, workEmail: "invalid", extra: "rejected" }),
    );
    const body = await responseJson(response);

    expect(response.status).toBe(422);
    expect(body).toMatchObject({ code: "validation_error" });
    expect(body.fieldErrors).toBeDefined();
    expect(context.send).not.toHaveBeenCalled();
  });

  it("rejects declared and actual oversized bodies", async () => {
    const first = setup();
    const declared = await first.handler(
      makeRequest(validSubmission, { headers: { "content-length": "20000" } }),
    );
    const second = setup();
    const actual = await second.handler(
      makeRequest(undefined, { raw: JSON.stringify({ message: "x".repeat(17_000) }) }),
    );

    expect(declared.status).toBe(413);
    expect(actual.status).toBe(413);
    expect(first.send).not.toHaveBeenCalled();
    expect(second.send).not.toHaveBeenCalled();
  });

  it("neutralizes honeypot submissions without consuming rate-limit or email capacity", async () => {
    const context = setup();
    const response = await context.handler(
      makeRequest({ ...validSubmission, website: "https://spam.example" }),
    );

    expect(response.status).toBe(202);
    expect(await responseJson(response)).toMatchObject({ ok: true });
    expect(context.createRateLimiter).not.toHaveBeenCalled();
    expect(context.createEmailProvider).not.toHaveBeenCalled();
  });

  it("returns Retry-After when the client is rate limited", async () => {
    const context = setup({
      rateLimitResult: { ...allowed, allowed: false, remaining: 0, resetAt: 61_000 },
    });
    const response = await context.handler(makeRequest());

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(await responseJson(response)).toMatchObject({ code: "rate_limited" });
    expect(context.send).not.toHaveBeenCalled();
  });

  it("fails closed when rate-limit protection is unavailable", async () => {
    const context = setup({
      rateLimitResult: { ...allowed, available: false, allowed: false, remaining: 0 },
    });
    const response = await context.handler(makeRequest());

    expect(response.status).toBe(503);
    expect(await responseJson(response)).toMatchObject({ code: "service_unavailable" });
    expect(context.send).not.toHaveBeenCalled();
  });

  it("fails safely when server configuration is unavailable", async () => {
    const context = setup({
      configResult: { success: false, issues: ["RESEND_API_KEY is required."] },
    });
    const response = await context.handler(makeRequest());

    expect(response.status).toBe(503);
    const serialized = JSON.stringify(await responseJson(response));
    expect(serialized).not.toContain("RESEND_API_KEY");
    expect(context.send).not.toHaveBeenCalled();
  });

  it("rejects a disallowed browser origin", async () => {
    const context = setup();
    const response = await context.handler(
      makeRequest(validSubmission, { headers: { origin: "https://attacker.test" } }),
    );

    expect(response.status).toBe(403);
    expect(context.limit).not.toHaveBeenCalled();
  });

  it.each([
    [{ status: "rejected" } as ContactEmailResult, 502, "delivery_failed"],
    [{ status: "unavailable" } as ContactEmailResult, 503, "service_unavailable"],
  ])("maps provider result %j to a safe response", async (emailResult, status, code) => {
    const context = setup({ emailResult });
    const response = await context.handler(makeRequest());
    const serialized = JSON.stringify(await responseJson(response));

    expect(response.status).toBe(status);
    expect(serialized).toContain(code);
    expect(serialized).not.toContain(config.email.apiKey);
    expect(serialized).not.toContain(config.email.toEmail);
  });

  it("returns a generic 500 when an unexpected provider failure escapes", async () => {
    const context = setup({ emailFailure: new Error("secret provider diagnostic") });
    const response = await context.handler(makeRequest());
    const serialized = JSON.stringify(await responseJson(response));

    expect(response.status).toBe(500);
    expect(serialized).toContain("unexpected_error");
    expect(serialized).not.toContain("secret provider diagnostic");
    expect(context.logger).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "unexpected_failure" }),
    );
  });
});
