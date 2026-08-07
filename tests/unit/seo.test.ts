import { afterEach, describe, expect, it, vi } from "vitest";
import { blogArticles } from "@/content/blog";

const environmentKey = "NEXT_PUBLIC_SITE_URL";
const originalSiteUrl = process.env[environmentKey];

async function loadSeoHelpers(configuredUrl?: string) {
  vi.resetModules();

  if (configuredUrl === undefined) {
    delete process.env[environmentKey];
  } else {
    process.env[environmentKey] = configuredUrl;
  }

  return import("@/lib/seo");
}

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env[environmentKey];
  } else {
    process.env[environmentKey] = originalSiteUrl;
  }

  vi.resetModules();
});

describe("SEO helpers", () => {
  it("uses the documented localhost fallback when no site URL is configured", async () => {
    const { createMetadata } = await loadSeoHelpers();
    const metadata = createMetadata({ title: "Services", description: "Service description", path: "/services" });

    expect(metadata.title).toBe("Services");
    expect(metadata.alternates).toEqual({ canonical: "/services" });
    expect(metadata.openGraph).toMatchObject({ title: "Services", url: "http://localhost:3000/services" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: "Services" });
  });

  it("uses the configured deployment origin for absolute metadata URLs", async () => {
    const { createMetadata } = await loadSeoHelpers("https://preview.athira.test");
    const metadata = createMetadata({ title: "Services", description: "Service description", path: "/services" });

    expect(metadata.alternates).toEqual({ canonical: "/services" });
    expect(metadata.openGraph).toMatchObject({
      title: "Services",
      url: "https://preview.athira.test/services",
    });
  });

  it("builds meaningful structured data from the configured origin", async () => {
    const {
      articleStructuredData,
      breadcrumbStructuredData,
      faqStructuredData,
      organizationStructuredData,
      softwareApplicationStructuredData,
    } = await loadSeoHelpers("https://preview.athira.test");
    const organization = organizationStructuredData();
    const softwareApplication = softwareApplicationStructuredData();
    const faq = faqStructuredData([{ question: "Question?", answer: "Answer." }]);
    const breadcrumbs = breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]);
    const article = articleStructuredData(blogArticles[0]);
    const serialized = JSON.stringify({ faq, breadcrumbs, article });

    expect(organization).toMatchObject({
      "@type": "Organization",
      name: "Athira Technology",
      url: "https://preview.athira.test/",
    });
    expect(softwareApplication).toMatchObject({
      "@type": "SoftwareApplication",
      operatingSystem: "Web-based planned platform",
      url: "https://preview.athira.test/ai-software-engineer",
    });
    expect(faq.mainEntity).toHaveLength(1);
    expect(breadcrumbs.itemListElement).toHaveLength(2);
    expect(breadcrumbs.itemListElement[1]).toMatchObject({
      item: "https://preview.athira.test/blog",
    });
    expect(article).toMatchObject({
      "@type": "Article",
      headline: blogArticles[0].title,
      mainEntityOfPage: `https://preview.athira.test/blog/${blogArticles[0].slug}`,
    });
    expect(serialized).not.toMatch(/aggregateRating|reviewCount|offers/);
  });
});
