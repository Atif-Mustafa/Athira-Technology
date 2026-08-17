import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "../config/site";
import type { BlogArticle } from "../content/blog";
import type { FaqItem } from "../content/shared";

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
};

export function createMetadata({
  title,
  description,
  path,
  type = "website",
}: MetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type,
      title,
      description,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function organizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
  };
}

export function softwareApplicationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Athira AI Software Engineer",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web-based planned platform",
    url: absoluteUrl("/ai-software-engineer"),
    description: "A planned, human-reviewed multi-agent platform for coordinating software-development lifecycle artifacts.",
    creator: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
  };
}

export function faqStructuredData(faqs: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbStructuredData(
  items: readonly { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleStructuredData(article: BlogArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: absoluteUrl(`/blog/${article.slug}`),
    author: {
      "@type": "Organization",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
  };
}
