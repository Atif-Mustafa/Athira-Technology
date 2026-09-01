import { describe, expect, it } from "vitest";
import { validateServerEnvironment } from "@/server/env";

const productionEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  VERCEL: "1",
  NEXT_PUBLIC_SITE_URL: "https://www.athira.test",
  RESEND_API_KEY: "re_test_key_long_enough",
  CONTACT_FROM_EMAIL: "Athira Technology <contact@athira.test>",
  CONTACT_TO_EMAIL: "inquiries@athira.test",
  UPSTASH_REDIS_REST_URL: "https://redis.athira.test",
  UPSTASH_REDIS_REST_TOKEN: "test-token",
  RATE_LIMIT_HASH_SECRET: "a".repeat(32),
};

describe("contact server environment", () => {
  it("accepts a complete HTTPS production configuration", () => {
    const result = validateServerEnvironment(productionEnvironment);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.config.rateLimit.provider).toBe("upstash");
      expect(result.config.allowedOrigins).toContain("https://www.athira.test");
      expect(result.config.trustVercelHeaders).toBe(true);
    }
  });

  it("reports actionable variable names without secret values", () => {
    const result = validateServerEnvironment({ NODE_ENV: "production" });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.issues.join(" ");
      expect(message).toContain("NEXT_PUBLIC_SITE_URL");
      expect(message).toContain("Upstash");
      expect(message).not.toContain("re_test_key_long_enough");
    }
  });

  it("allows an explicit in-memory limiter only outside production", () => {
    const result = validateServerEnvironment({
      NODE_ENV: "development",
      RESEND_API_KEY: "re_local_key_long_enough",
      CONTACT_FROM_EMAIL: "contact@localhost.test",
      CONTACT_TO_EMAIL: "owner@localhost.test",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.config.rateLimit.provider).toBe("memory");
      expect(result.config.siteOrigin).toBe("http://localhost:3000");
    }
  });

  it("rejects HTTP production origins and partial Upstash configuration", () => {
    const result = validateServerEnvironment({
      ...productionEnvironment,
      NEXT_PUBLIC_SITE_URL: "http://athira.test",
      UPSTASH_REDIS_REST_TOKEN: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.join(" ")).toMatch(/HTTPS.*UPSTASH_REDIS_REST_TOKEN/i);
    }
  });

  it("rejects path-based allowed origins", () => {
    const result = validateServerEnvironment({
      ...productionEnvironment,
      CONTACT_ALLOWED_ORIGINS: "https://preview.athira.test/contact",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.join(" ")).toContain("CONTACT_ALLOWED_ORIGINS");
    }
  });

  it("rejects a CONTACT_ALLOWED_ORIGINS list past the bounded length", () => {
    const manyOrigins = Array.from({ length: 21 }, (_, index) => `https://alt-${index}.athira.test`).join(",");
    const result = validateServerEnvironment({
      ...productionEnvironment,
      CONTACT_ALLOWED_ORIGINS: manyOrigins,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.join(" ")).toContain("CONTACT_ALLOWED_ORIGINS");
    }
  });

  it("derives the Preview site origin automatically from VERCEL_PROJECT_PRODUCTION_URL without NEXT_PUBLIC_SITE_URL", () => {
    const withoutSiteUrl: NodeJS.ProcessEnv = { ...productionEnvironment };
    delete withoutSiteUrl.NEXT_PUBLIC_SITE_URL;
    const result = validateServerEnvironment({
      ...withoutSiteUrl,
      VERCEL_PROJECT_PRODUCTION_URL: "athira-technology.vercel.app",
      VERCEL_URL: "athira-technology-git-feat-branch-team.vercel.app",
      VERCEL_BRANCH_URL: "athira-technology-git-feat-branch-team.vercel.app",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.config.siteOrigin).toBe("https://athira-technology.vercel.app");
      expect(result.config.allowedOrigins).toContain("https://athira-technology.vercel.app");
      expect(result.config.allowedOrigins).toContain(
        "https://athira-technology-git-feat-branch-team.vercel.app",
      );
    }
  });

  it("derives the site origin from VERCEL_URL when VERCEL_PROJECT_PRODUCTION_URL is absent", () => {
    const withoutSiteUrl: NodeJS.ProcessEnv = { ...productionEnvironment };
    delete withoutSiteUrl.NEXT_PUBLIC_SITE_URL;
    const result = validateServerEnvironment({
      ...withoutSiteUrl,
      VERCEL_URL: "athira-technology-git-feat-branch-team.vercel.app",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.config.siteOrigin).toBe(
        "https://athira-technology-git-feat-branch-team.vercel.app",
      );
    }
  });

  it("still requires a resolvable origin in production when no Vercel deployment URL is available", () => {
    const withoutSiteUrl: NodeJS.ProcessEnv = { ...productionEnvironment };
    delete withoutSiteUrl.NEXT_PUBLIC_SITE_URL;
    const result = validateServerEnvironment(withoutSiteUrl);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.join(" ")).toContain("NEXT_PUBLIC_SITE_URL");
    }
  });
});
