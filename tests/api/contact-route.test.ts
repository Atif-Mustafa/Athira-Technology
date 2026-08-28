import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
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
  persistenceFailure,
}: {
  configResult?: EnvironmentValidationResult;
  rateLimitResult?: ContactRateLimitResult;
  emailResult?: ContactEmailResult;
  emailFailure?: Error;
  persistenceFailure?: Error;
} = {}) {
  const limit = vi.fn().mockResolvedValue(rateLimitResult);
  const send = emailFailure
    ? vi.fn().mockRejectedValue(emailFailure)
    : vi.fn().mockResolvedValue(emailResult);
  const persist = persistenceFailure ? vi.fn().mockRejectedValue(persistenceFailure) : vi.fn().mockResolvedValue({ enquiryId: "11111111-1111-4111-8111-111111111111", referenceCode: "ATH-ABCDEF1234", notificationStatus: "pending", created: true });
  const setNotificationStatus = vi.fn().mockResolvedValue(undefined);
  const logger = vi.fn();
  const createRateLimiter = vi.fn(() => ({ limit }));
  const createEmailProvider = vi.fn(() => ({ send }));
  const createPersistenceProvider = vi.fn(() => ({ persist, setNotificationStatus }));
  const handler = createContactHandler({
    getConfig: () => configResult,
    createRateLimiter,
    createEmailProvider,
    createPersistenceProvider,
    createRequestId: () => "contact_test_request",
    createDecoyReference: () => "ATH-DECOY00000",
    logger,
    now: () => 1_000,
  });

  return { handler, limit, persist, setNotificationStatus, send, logger, createRateLimiter, createEmailProvider, createPersistenceProvider };
}

async function responseJson(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("POST /api/contact", () => {
  it("persists a valid enquiry before attempting its email notification", async () => {
    const context = setup();
    const response = await context.handler(makeRequest());
    const body = await responseJson(response);

    expect(response.status).toBe(202);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-request-id")).toBe("contact_test_request");
    expect(body).toEqual({
      ok: true,
      referenceCode: "ATH-ABCDEF1234",
      message: "Your enquiry has been received by Athira Technology.",
    });
    expect(context.limit).toHaveBeenCalledOnce();
    expect(context.limit.mock.calls[0][0]).toMatch(/^[0-9a-f]{64}$/);
    expect(context.persist).toHaveBeenCalledOnce();
    expect(context.send).toHaveBeenCalledOnce();
    expect(context.persist.mock.invocationCallOrder[0]).toBeLessThan(context.send.mock.invocationCallOrder[0]);
    expect(context.send.mock.calls[0][0]).toMatchObject({
      replyTo: "ada@example.com",
      idempotencyKey: expect.stringMatching(/^[0-9a-f-]{36}$/),
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
    expect(context.createPersistenceProvider).not.toHaveBeenCalled();
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
    [{ status: "rejected" } as ContactEmailResult, "rejected"],
    [{ status: "unavailable" } as ContactEmailResult, "unavailable"],
  ])("keeps the enquiry when provider result is %j", async (emailResult, providerState) => {
    const context = setup({ emailResult });
    const response = await context.handler(makeRequest());
    const serialized = JSON.stringify(await responseJson(response));

    expect(response.status).toBe(202);
    expect(serialized).toContain("ATH-ABCDEF1234");
    expect(context.setNotificationStatus).toHaveBeenCalledWith("11111111-1111-4111-8111-111111111111", "failed");
    expect(serialized).not.toContain(config.email.apiKey);
    expect(serialized).not.toContain(config.email.toEmail);
    expect(context.logger).toHaveBeenCalledWith(expect.objectContaining({ outcome: "accepted_notification_degraded", provider: providerState }));
  });

  it("keeps the enquiry when the provider throws", async () => {
    const context = setup({ emailFailure: new Error("secret provider diagnostic") });
    const response = await context.handler(makeRequest());
    const serialized = JSON.stringify(await responseJson(response));

    expect(response.status).toBe(202);
    expect(serialized).toContain("ATH-ABCDEF1234");
    expect(serialized).not.toContain("secret provider diagnostic");
    expect(context.logger).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "accepted_notification_degraded" }),
    );
  });
});
