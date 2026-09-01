import { describe, expect, it } from "vitest";
import {
  getProductionOrientedSiteUrl,
  parseExplicitOrigin,
  parseVercelHost,
} from "@/lib/deployment-url";

describe("parseExplicitOrigin", () => {
  it("accepts valid HTTP and HTTPS URLs", () => {
    expect(parseExplicitOrigin("https://www.athira.test")?.origin).toBe(
      "https://www.athira.test",
    );
    expect(parseExplicitOrigin("http://localhost:3000")?.origin).toBe(
      "http://localhost:3000",
    );
  });

  it("rejects non-http(s) schemes", () => {
    expect(parseExplicitOrigin("javascript:alert(1)")).toBeNull();
    expect(parseExplicitOrigin("data:text/html,hi")).toBeNull();
    expect(parseExplicitOrigin("file:///etc/passwd")).toBeNull();
    expect(parseExplicitOrigin("ftp://athira.test")).toBeNull();
  });

  it("rejects malformed input", () => {
    expect(parseExplicitOrigin("not a url")).toBeNull();
    expect(parseExplicitOrigin(undefined)).toBeNull();
    expect(parseExplicitOrigin("")).toBeNull();
    expect(parseExplicitOrigin("   ")).toBeNull();
  });
});

describe("parseVercelHost", () => {
  it("normalizes a bare hostname to an HTTPS origin", () => {
    expect(parseVercelHost("my-app-git-branch-team.vercel.app")?.origin).toBe(
      "https://my-app-git-branch-team.vercel.app",
    );
  });

  it("accepts an already-scheme-qualified HTTPS host", () => {
    expect(parseVercelHost("https://my-app.vercel.app")?.origin).toBe(
      "https://my-app.vercel.app",
    );
  });

  it("rejects an explicit non-HTTPS scheme", () => {
    expect(parseVercelHost("http://my-app.vercel.app")).toBeNull();
    expect(parseVercelHost("javascript:alert(1)")).toBeNull();
  });

  it("rejects malformed or missing input", () => {
    expect(parseVercelHost(undefined)).toBeNull();
    expect(parseVercelHost("")).toBeNull();
    expect(parseVercelHost("   ")).toBeNull();
  });
});

describe("getProductionOrientedSiteUrl", () => {
  it("LOCAL: falls back to localhost when nothing is configured", () => {
    expect(getProductionOrientedSiteUrl({}).href).toBe("http://localhost:3000/");
  });

  it("LOCAL: uses an explicit NEXT_PUBLIC_SITE_URL", () => {
    expect(
      getProductionOrientedSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://localhost:4000" }).href,
    ).toBe("http://localhost:4000/");
  });

  it("PREVIEW: derives the origin from VERCEL_PROJECT_PRODUCTION_URL when no explicit URL is set", () => {
    expect(
      getProductionOrientedSiteUrl({
        VERCEL_PROJECT_PRODUCTION_URL: "athira-technology.vercel.app",
      }).origin,
    ).toBe("https://athira-technology.vercel.app");
  });

  it("PREVIEW: falls back to VERCEL_URL when VERCEL_PROJECT_PRODUCTION_URL is absent", () => {
    expect(
      getProductionOrientedSiteUrl({
        VERCEL_URL: "athira-technology-git-feat-branch-team.vercel.app",
      }).origin,
    ).toBe("https://athira-technology-git-feat-branch-team.vercel.app");
  });

  it("PRODUCTION: prefers an explicit NEXT_PUBLIC_SITE_URL over Vercel system variables", () => {
    expect(
      getProductionOrientedSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://www.athira.test",
        VERCEL_PROJECT_PRODUCTION_URL: "athira-technology.vercel.app",
        VERCEL_URL: "athira-technology-abc123.vercel.app",
      }).origin,
    ).toBe("https://www.athira.test");
  });

  it("PRODUCTION: prefers VERCEL_PROJECT_PRODUCTION_URL over VERCEL_URL", () => {
    expect(
      getProductionOrientedSiteUrl({
        VERCEL_PROJECT_PRODUCTION_URL: "athira-technology.vercel.app",
        VERCEL_URL: "athira-technology-abc123.vercel.app",
      }).origin,
    ).toBe("https://athira-technology.vercel.app");
  });

  it("safely falls back to localhost for a malformed configured URL", () => {
    expect(getProductionOrientedSiteUrl({ NEXT_PUBLIC_SITE_URL: "javascript:alert(1)" }).href).toBe(
      "http://localhost:3000/",
    );
  });

  it("normalizes a trailing slash on the explicit URL", () => {
    expect(getProductionOrientedSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://www.athira.test/" }).href).toBe(
      "https://www.athira.test/",
    );
  });
});
