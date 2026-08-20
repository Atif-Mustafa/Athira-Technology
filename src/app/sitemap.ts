import { MetadataRoute } from "next";
import { absoluteUrl } from "../config/site";
import { agentsData } from "../content/agents";
import { listPublishedPages, listPublishedPosts } from "../server/cms/public";
import type { CmsPage, CmsPost } from "../server/cms/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let blogArticles: CmsPost[] = [];
  let cmsPages: CmsPage[] = [];
  try {
    [blogArticles, cmsPages] = await Promise.all([listPublishedPosts(), listPublishedPages()]);
  } catch {
    // Fixed routes remain valid if the CMS is temporarily unavailable.
  }

  const agentUrls = agentsData.map((agent) => ({
    url: absoluteUrl(`/agents/${agent.slug}`),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogUrls = blogArticles.map((article) => ({
    url: absoluteUrl(`/blog/${article.slug}`),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const cmsPageUrls = cmsPages.map((page) => ({
    url: absoluteUrl(page.canonicalPath),
    lastModified: page.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const publicPages = [
    { path: "/ai-software-engineer", priority: 0.9 },
    { path: "/agents", priority: 0.9 },
    { path: "/services", priority: 0.8 },
    { path: "/pricing", priority: 0.8 },
    { path: "/blog", priority: 0.7 },
    { path: "/contact", priority: 0.7 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
  ];

  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...publicPages.map((page) => ({
      url: absoluteUrl(page.path),
      changeFrequency: "monthly" as const,
      priority: page.priority,
    })),
    ...agentUrls,
    ...blogUrls,
    ...cmsPageUrls,
  ];
}
