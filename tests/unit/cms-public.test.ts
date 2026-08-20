import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: <Arguments extends unknown[], Result>(fn: (...args: Arguments) => Result) => fn,
}));

describe("CMS public transition boundary", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });

  it("preserves existing public content only when Supabase is unconfigured", async () => {
    const { cmsStaticFallback } = await import("@/server/cms/public");
    expect(cmsStaticFallback.posts()).toHaveLength(3);
    expect(cmsStaticFallback.services()).toHaveLength(8);
    expect(cmsStaticFallback.pricingPlans()).toHaveLength(3);
    expect(cmsStaticFallback.posts().every((post) => post.status === "published")).toBe(true);
    expect(cmsStaticFallback.services().every((service) => service.active)).toBe(true);
  });

  it("converts legacy article sections to safe minimal Markdown", async () => {
    const { cmsStaticFallback } = await import("@/server/cms/public");
    const body = cmsStaticFallback.posts()[0].body;
    expect(body).toContain("## Why specialization matters");
    expect(body).toContain("- Planning should expose assumptions");
    expect(body).not.toContain("<script");
  });
});
