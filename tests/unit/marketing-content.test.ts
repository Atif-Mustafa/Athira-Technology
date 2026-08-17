import { isValidElement } from "react";
import { describe, expect, it } from "vitest";
import { blogArticles } from "@/content/blog";
import { footerGroups, homepageFaqs, primaryNavigation } from "@/content/marketing";
import { pricingPlans } from "@/content/pricing";
import { aiSoftwareEngineerContent } from "@/content/product";
import { services } from "@/content/services";
import { marketingIconKeys } from "@/content/shared";

function containsNonSerializableValue(value: unknown, visited = new WeakSet<object>()): boolean {
  if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint" || isValidElement(value)) return true;
  if (value === null || typeof value !== "object") return false;
  if (visited.has(value)) return false;
  visited.add(value);
  return Object.values(value).some((entry) => containsNonSerializableValue(entry, visited));
}

describe("public marketing content", () => {
  it("publishes the complete working primary navigation", () => {
    expect(primaryNavigation).toEqual([
      { label: "Product", href: "/ai-software-engineer" },
      { label: "SDLC Agents", href: "/agents" },
      { label: "Services", href: "/services" },
      { label: "Pricing", href: "/pricing" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ]);
    expect(new Set(primaryNavigation.map((item) => item.href)).size).toBe(primaryNavigation.length);
  });

  it("keeps footer links and homepage FAQs complete", () => {
    expect(footerGroups).toHaveLength(3);
    expect(footerGroups.every((group) => group.links.length >= 2)).toBe(true);
    expect(homepageFaqs.length).toBeGreaterThanOrEqual(4);
  });

  it("contains eight uniquely identified services with scoped deliverables", () => {
    expect(services).toHaveLength(8);
    expect(new Set(services.map((service) => service.slug)).size).toBe(8);
    expect(services.every((service) => service.deliverables.length >= 4)).toBe(true);
    expect(services.every((service) => service.businessProblem && service.scope && service.engagementModel)).toBe(true);
  });

  it("uses indicative labels instead of invented monetary prices", () => {
    expect(pricingPlans.map((plan) => plan.slug)).toEqual(["starter", "growth", "enterprise"]);
    expect(pricingPlans.every((plan) => /indicative|custom quote|contact for pricing/i.test(plan.priceLabel))).toBe(true);
    expect(JSON.stringify(pricingPlans)).not.toMatch(/[$€£]\s?\d/);
  });

  it("contains three complete, uniquely linked local articles", () => {
    const slugs = new Set(blogArticles.map((article) => article.slug));
    expect(blogArticles).toHaveLength(3);
    expect(slugs.size).toBe(3);
    for (const article of blogArticles) {
      expect(article.sections.length).toBeGreaterThanOrEqual(4);
      expect(article.relatedSlugs.length).toBeGreaterThanOrEqual(2);
      expect(article.relatedSlugs.every((slug) => slug !== article.slug && slugs.has(slug))).toBe(true);
      expect(article.author).toBe("Athira Technology editorial team");
    }
  });

  it("stores marketing, service, pricing, and blog content as serializable data", () => {
    const content = { primaryNavigation, footerGroups, homepageFaqs, services, pricingPlans, blogArticles, aiSoftwareEngineerContent, marketingIconKeys };
    expect(containsNonSerializableValue(content)).toBe(false);
    expect(() => JSON.parse(JSON.stringify(content))).not.toThrow();
  });
});
