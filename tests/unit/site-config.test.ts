import { afterEach, describe, expect, it, vi } from "vitest";

const environmentKey = "NEXT_PUBLIC_SITE_URL";
const originalSiteUrl = process.env[environmentKey];

async function loadSiteConfig(configuredUrl?: string) {
  vi.resetModules();

  if (configuredUrl === undefined) {
    delete process.env[environmentKey];
  } else {
    process.env[environmentKey] = configuredUrl;
  }

  return import("@/config/site");
}

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env[environmentKey];
  } else {
    process.env[environmentKey] = originalSiteUrl;
  }

  vi.resetModules();
});

describe("site configuration", () => {
  it("uses a valid local URL when no public URL is configured", async () => {
    const { absoluteUrl, siteConfig } = await loadSiteConfig();

    expect(siteConfig.url).toBeInstanceOf(URL);
    expect(siteConfig.url.href).toBe("http://localhost:3000/");
    expect(absoluteUrl("/agents")).toBe("http://localhost:3000/agents");
  });

  it("trims and normalizes an HTTP public URL", async () => {
    const { absoluteUrl, siteConfig } = await loadSiteConfig(
      "  https://www.athira.test/platform  ",
    );

    expect(siteConfig.url.href).toBe("https://www.athira.test/platform");
    expect(absoluteUrl("/agents/planning")).toBe(
      "https://www.athira.test/agents/planning",
    );
  });

  it.each(["not a url", "ftp://athira.test", "javascript:alert(1)"])(
    "safely falls back for malformed or unsupported value %s",
    async (configuredUrl) => {
      const { siteConfig } = await loadSiteConfig(configuredUrl);

      expect(siteConfig.url.href).toBe("http://localhost:3000/");
    },
  );
});
