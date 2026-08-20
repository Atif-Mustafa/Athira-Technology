import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SafeMarkdown, parseSafeMarkdown } from "@/components/content/SafeMarkdown";
import {
  isSafeInternalPath,
  normalizeCmsSlug,
  pageInputSchema,
  postInputSchema,
  pricingPlanInputSchema,
} from "@/server/cms/schema";

describe("CMS slug and URL validation", () => {
  it("normalizes human input into a bounded lowercase slug", () => {
    expect(normalizeCmsSlug("  Déploy & Operate / Safely  ")).toBe("deploy-and-operate-safely");
    expect(normalizeCmsSlug("---A---B---")).toBe("a-b");
    expect(normalizeCmsSlug("x".repeat(200))).toHaveLength(80);
  });

  it("rejects reserved page routes after normalization", () => {
    const result = pageInputSchema.safeParse({
      version: 0,
      slug: "ADMIN",
      title: "Reserved",
      summary: "",
      body: "Body",
      status: "draft",
      seoTitle: "",
      seoDescription: "",
      canonicalPath: "/admin",
    });
    expect(result.success).toBe(false);
  });

  it("requires a page canonical path to match its root slug", () => {
    const base = {
      version: 0,
      slug: "about",
      title: "About",
      summary: "About us",
      body: "Body",
      status: "draft" as const,
      seoTitle: "",
      seoDescription: "",
    };
    expect(pageInputSchema.safeParse({ ...base, canonicalPath: "/about" }).success).toBe(true);
    expect(pageInputSchema.safeParse({ ...base, canonicalPath: "/services" }).success).toBe(false);
    expect(pageInputSchema.safeParse({ ...base, canonicalPath: "/about/team" }).success).toBe(false);
  });

  it("allows only same-origin internal CTA paths", () => {
    for (const safe of ["/contact", "/contact?plan=growth", "/services#quality"]) {
      expect(isSafeInternalPath(safe)).toBe(true);
    }
    for (const unsafe of ["javascript:alert(1)", "data:text/html,boom", "vbscript:msgbox(1)", "//evil.test/path", "/\\evil"]) {
      expect(isSafeInternalPath(unsafe)).toBe(false);
    }

    const base = {
      version: 0,
      name: "Growth",
      slug: "growth",
      label: "Custom quote",
      targetUser: "Teams",
      description: "Description",
      features: [],
      limitations: [],
      ctaLabel: "Contact",
      featured: false,
      sortOrder: 10,
      active: true,
    };
    expect(pricingPlanInputSchema.safeParse({ ...base, ctaHref: "/contact" }).success).toBe(true);
    expect(pricingPlanInputSchema.safeParse({ ...base, ctaHref: "javascript:alert(1)" }).success).toBe(false);
  });

  it("validates exact post lifecycle values and content bounds", () => {
    const base = {
      version: 0,
      slug: "safe-post",
      title: "Safe post",
      excerpt: "Summary",
      body: "Body",
      authorName: "Editorial team",
      category: "Engineering",
      readingTime: "4 min read",
      seoTitle: "",
      seoDescription: "",
    };
    expect(postInputSchema.safeParse({ ...base, status: "published" }).success).toBe(true);
    expect(postInputSchema.safeParse({ ...base, status: "scheduled" }).success).toBe(false);
    expect(postInputSchema.safeParse({ ...base, status: "draft", body: "x".repeat(50001) }).success).toBe(false);
  });
});

describe("minimal Markdown XSS boundary", () => {
  it("parses only explicitly supported block constructs", () => {
    expect(parseSafeMarkdown("## Heading\n\n- One\n- Two\n\nParagraph")).toEqual([
      { kind: "heading", level: 2, text: "Heading" },
      { kind: "list", items: ["One", "Two"] },
      { kind: "paragraph", text: "Paragraph" },
    ]);
  });

  it("renders raw HTML and scripts as escaped text", () => {
    const { container } = render(<SafeMarkdown source={'<script>window.pwned = true</script>\n\n<img src=x onerror="alert(1)">'} />);
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("<script>window.pwned = true</script>");
    expect(container.textContent).toContain("onerror");
  });
});
