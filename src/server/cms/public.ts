import "server-only";

import { unstable_cache } from "next/cache";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { blogArticles } from "../../content/blog";
import { pricingPlans } from "../../content/pricing";
import { services } from "../../content/services";
import { getSupabasePublicConfig } from "../../lib/supabase/config";
import {
  mapPage,
  mapPost,
  mapPricingPlan,
  mapService,
  type PageRow,
  type PostRow,
  type PricingPlanRow,
  type ServiceRow,
} from "./mappers";
import type { CmsPage, CmsPost, CmsPricingPlan, CmsService } from "./types";

export const CMS_CACHE_TAGS = {
  pages: "cms:pages",
  posts: "cms:posts",
  services: "cms:services",
  pricing: "cms:pricing",
} as const;

export class CmsContentUnavailableError extends Error {
  constructor(area: string) {
    super(`CMS ${area} content is unavailable.`);
    this.name = "CmsContentUnavailableError";
  }
}

function createAnonymousContentClient(): SupabaseClient | null {
  const configuration = getSupabasePublicConfig(process.env);
  if (!configuration.success) return null;

  return createClient(configuration.config.url, configuration.config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

function staticPostBody(index: number): string {
  return blogArticles[index].sections
    .map((section) => [
      `## ${section.heading}`,
      ...section.paragraphs,
      ...(section.points?.map((point) => `- ${point}`) ?? []),
    ].join("\n\n"))
    .join("\n\n");
}

function staticPosts(): CmsPost[] {
  return blogArticles.map((article, index) => ({
    kind: "post",
    id: `static-${article.slug}`,
    slug: article.slug,
    title: article.title,
    excerpt: article.summary,
    body: staticPostBody(index),
    status: "published",
    authorName: article.author,
    category: article.category,
    readingTime: article.readingTime,
    seoTitle: article.title,
    seoDescription: article.description,
    publishedAt: `${article.publishedAt}T00:00:00.000Z`,
    createdAt: `${article.publishedAt}T00:00:00.000Z`,
    updatedAt: `${article.updatedAt}T00:00:00.000Z`,
    version: 1,
    attribution: {
      createdBy: "Static transition seed",
      updatedBy: "Static transition seed",
      publishedBy: "Static transition seed",
    },
  }));
}

function staticServices(): CmsService[] {
  return services.map((service, index) => ({
    kind: "service",
    id: `static-${service.slug}`,
    slug: service.slug,
    title: service.name,
    summary: service.summary,
    description: "",
    businessProblem: service.businessProblem,
    scope: service.scope,
    deliverables: [...service.deliverables],
    engagementModel: service.engagementModel,
    icon: service.icon,
    sortOrder: (index + 1) * 10,
    active: true,
    seoTitle: null,
    seoDescription: null,
    createdAt: "2026-08-19T00:00:00.000Z",
    updatedAt: "2026-08-19T00:00:00.000Z",
    version: 1,
    attribution: { createdBy: "Static transition seed", updatedBy: "Static transition seed" },
  }));
}

function staticPricingPlans(): CmsPricingPlan[] {
  return pricingPlans.map((plan, index) => ({
    kind: "pricing_plan",
    id: `static-${plan.slug}`,
    slug: plan.slug,
    name: plan.name,
    label: plan.priceLabel,
    targetUser: plan.targetUser,
    description: plan.description,
    features: [...plan.features],
    limitations: [...plan.limitations],
    ctaLabel: plan.cta,
    ctaHref: "/contact",
    featured: Boolean(plan.featured),
    sortOrder: (index + 1) * 10,
    active: true,
    createdAt: "2026-08-19T00:00:00.000Z",
    updatedAt: "2026-08-19T00:00:00.000Z",
    version: 1,
    attribution: { createdBy: "Static transition seed", updatedBy: "Static transition seed" },
  }));
}

function publicRowDefaults() {
  return { created_by: "CMS", updated_by: "CMS" };
}

async function queryPublishedPosts(): Promise<CmsPost[]> {
  const client = createAnonymousContentClient();
  if (!client) return staticPosts();
  const { data, error } = await client
    .from("posts")
    .select("id,slug,title,excerpt,body,status,author_name,category,reading_time,seo_title,seo_description,published_at,created_at,updated_at,version")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  if (error) throw new CmsContentUnavailableError("blog");
  return (data ?? []).map((row) => mapPost({ ...publicRowDefaults(), published_by: null, ...row } as PostRow));
}

async function queryPublishedPost(slug: string): Promise<CmsPost | null> {
  const client = createAnonymousContentClient();
  if (!client) return staticPosts().find((post) => post.slug === slug) ?? null;
  const { data, error } = await client
    .from("posts")
    .select("id,slug,title,excerpt,body,status,author_name,category,reading_time,seo_title,seo_description,published_at,created_at,updated_at,version")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new CmsContentUnavailableError("blog");
  return data ? mapPost({ ...publicRowDefaults(), published_by: null, ...data } as PostRow) : null;
}

async function queryActiveServices(): Promise<CmsService[]> {
  const client = createAnonymousContentClient();
  if (!client) return staticServices();
  const { data, error } = await client
    .from("services")
    .select("id,slug,title,summary,description,business_problem,scope,deliverables,engagement_model,icon,sort_order,active,seo_title,seo_description,created_at,updated_at,version")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });
  if (error) throw new CmsContentUnavailableError("services");
  return (data ?? []).map((row) => mapService({ ...publicRowDefaults(), ...row } as ServiceRow));
}

async function queryActivePricingPlans(): Promise<CmsPricingPlan[]> {
  const client = createAnonymousContentClient();
  if (!client) return staticPricingPlans();
  const { data, error } = await client
    .from("pricing_plans")
    .select("id,name,slug,label,target_user,description,features,limitations,cta_label,cta_href,featured,sort_order,active,created_at,updated_at,version")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new CmsContentUnavailableError("pricing");
  return (data ?? []).map((row) => mapPricingPlan({ ...publicRowDefaults(), ...row } as PricingPlanRow));
}

async function queryPublishedPages(): Promise<CmsPage[]> {
  const client = createAnonymousContentClient();
  if (!client) return [];
  const { data, error } = await client
    .from("pages")
    .select("id,slug,title,summary,body,status,seo_title,seo_description,canonical_path,published_at,created_at,updated_at,version")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("updated_at", { ascending: false });
  if (error) throw new CmsContentUnavailableError("pages");
  return (data ?? []).map((row) =>
    mapPage({ ...publicRowDefaults(), published_by: null, ...row } as PageRow),
  );
}

async function queryPublishedPage(slug: string): Promise<CmsPage | null> {
  const client = createAnonymousContentClient();
  if (!client) return null;
  const { data, error } = await client
    .from("pages")
    .select("id,slug,title,summary,body,status,seo_title,seo_description,canonical_path,published_at,created_at,updated_at,version")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new CmsContentUnavailableError("pages");
  return data
    ? mapPage({ ...publicRowDefaults(), published_by: null, ...data } as PageRow)
    : null;
}

const cachedPublishedPosts = unstable_cache(queryPublishedPosts, ["cms-published-posts"], {
  tags: [CMS_CACHE_TAGS.posts],
  revalidate: 3600,
});
const cachedPublishedPost = unstable_cache(queryPublishedPost, ["cms-published-post"], {
  tags: [CMS_CACHE_TAGS.posts],
  revalidate: 3600,
});
const cachedActiveServices = unstable_cache(queryActiveServices, ["cms-active-services"], {
  tags: [CMS_CACHE_TAGS.services],
  revalidate: 3600,
});
const cachedActivePricingPlans = unstable_cache(queryActivePricingPlans, ["cms-active-pricing"], {
  tags: [CMS_CACHE_TAGS.pricing],
  revalidate: 3600,
});
const cachedPublishedPage = unstable_cache(queryPublishedPage, ["cms-published-page"], {
  tags: [CMS_CACHE_TAGS.pages],
  revalidate: 3600,
});
const cachedPublishedPages = unstable_cache(queryPublishedPages, ["cms-published-pages"], {
  tags: [CMS_CACHE_TAGS.pages],
  revalidate: 3600,
});

export function listPublishedPosts() {
  return cachedPublishedPosts();
}

export function getPublishedPostBySlug(slug: string) {
  return cachedPublishedPost(slug);
}

export function listActiveServices() {
  return cachedActiveServices();
}

export function listActivePricingPlans() {
  return cachedActivePricingPlans();
}

export function getPublishedPageBySlug(slug: string) {
  return cachedPublishedPage(slug);
}

export function listPublishedPages() {
  return cachedPublishedPages();
}


export const cmsStaticFallback = {
  posts: staticPosts,
  services: staticServices,
  pricingPlans: staticPricingPlans,
};
