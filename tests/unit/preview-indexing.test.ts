import { afterEach, describe, expect, it, vi } from "vitest";
import { createSecurityHeaders } from "@/config/security";

const vercelEnvironmentKey = "VERCEL_ENV";
const siteUrlKey = "NEXT_PUBLIC_SITE_URL";
const originalVercelEnvironment = process.env[vercelEnvironmentKey];
const originalSiteUrl = process.env[siteUrlKey];

async function loadRobots(vercelEnvironment: string, siteUrl: string) {
  vi.resetModules();
  process.env[vercelEnvironmentKey] = vercelEnvironment;
  process.env[siteUrlKey] = siteUrl;

  return (await import("@/app/robots")).default;
}

afterEach(() => {
  if (originalVercelEnvironment === undefined) {
    delete process.env[vercelEnvironmentKey];
  } else {
    process.env[vercelEnvironmentKey] = originalVercelEnvironment;
  }

  if (originalSiteUrl === undefined) {
    delete process.env[siteUrlKey];
  } else {
    process.env[siteUrlKey] = originalSiteUrl;
  }

  vi.resetModules();
});

describe("preview indexing protection", () => {
  it("blocks crawlers and emits a noindex header in Vercel Preview", async () => {
    const robots = await loadRobots("preview", "https://preview.athira.test");

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });
    expect(
      createSecurityHeaders({
        isDevelopment: false,
        isProductionHttps: false,
        isPreview: true,
      }),
    ).toContainEqual({
      key: "X-Robots-Tag",
      value: "noindex, nofollow",
    });
  });

  it("preserves indexable robots behavior outside Preview", async () => {
    const robots = await loadRobots("production", "https://www.athira.test");

    expect(robots()).toMatchObject({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      sitemap: "https://www.athira.test/sitemap.xml",
    });
    expect(
      createSecurityHeaders({
        isDevelopment: false,
        isProductionHttps: true,
        isPreview: false,
      }),
    ).not.toContainEqual({
      key: "X-Robots-Tag",
      value: "noindex, nofollow",
    });
  });
});
