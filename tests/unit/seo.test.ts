import { describe, expect, it } from "vitest";
import { blogArticles } from "@/content/blog";
import {
  articleStructuredData,
  breadcrumbStructuredData,
  createMetadata,
  faqStructuredData,
  organizationStructuredData,
  softwareApplicationStructuredData,
} from "@/lib/seo";

describe("SEO helpers", () => {
  it("creates canonical, Open Graph, and Twitter metadata from a route path", () => {
    const metadata = createMetadata({ title: "Services", description: "Service description", path: "/services" });

    expect(metadata.title).toBe("Services");
    expect(metadata.alternates).toEqual({ canonical: "/services" });
    expect(metadata.openGraph).toMatchObject({ title: "Services", url: "http://localhost:3000/services" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: "Services" });
  });

  it("builds honest organization and planned-product structured data", () => {
    expect(organizationStructuredData()).toMatchObject({ "@type": "Organization", name: "Athira Technology" });
    expect(softwareApplicationStructuredData()).toMatchObject({
      "@type": "SoftwareApplication",
      operatingSystem: "Web-based planned platform",
    });
  });

  it("builds FAQ, breadcrumb, and article schema without ratings or offers", () => {
    const faq = faqStructuredData([{ question: "Question?", answer: "Answer." }]);
    const breadcrumbs = breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]);
    const article = articleStructuredData(blogArticles[0]);
    const serialized = JSON.stringify({ faq, breadcrumbs, article });

    expect(faq.mainEntity).toHaveLength(1);
    expect(breadcrumbs.itemListElement).toHaveLength(2);
    expect(article).toMatchObject({ "@type": "Article", headline: blogArticles[0].title });
    expect(serialized).not.toMatch(/aggregateRating|reviewCount|offers/);
  });
});
