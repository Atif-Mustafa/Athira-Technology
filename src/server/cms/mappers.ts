import type { MarketingIconKey } from "../../content/shared";
import type {
  CmsPage,
  CmsPost,
  CmsPricingPlan,
  CmsService,
  CmsStatus,
} from "./types";

type AttributionNames = Record<string, string>;

export type PageRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  canonical_path: string;
  created_by: string;
  updated_by: string;
  published_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  version: number;
};

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  status: string;
  author_name: string;
  category: string;
  reading_time: string;
  seo_title: string | null;
  seo_description: string | null;
  created_by: string;
  updated_by: string;
  published_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  version: number;
};

export type ServiceRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  business_problem: string;
  scope: string;
  deliverables: string[];
  engagement_model: string;
  icon: string;
  sort_order: number;
  active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  version: number;
};

export type PricingPlanRow = {
  id: string;
  name: string;
  slug: string;
  label: string;
  target_user: string;
  description: string;
  features: string[];
  limitations: string[];
  cta_label: string;
  cta_href: string;
  featured: boolean;
  sort_order: number;
  active: boolean;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  version: number;
};

function safeStatus(value: string): CmsStatus {
  return value === "published" || value === "archived" ? value : "draft";
}

function attribution(
  row: { created_by: string; updated_by: string; published_by?: string | null },
  names: AttributionNames,
) {
  return {
    createdBy: names[row.created_by] ?? row.created_by,
    updatedBy: names[row.updated_by] ?? row.updated_by,
    publishedBy: row.published_by ? names[row.published_by] ?? row.published_by : null,
  };
}

export function mapPage(row: PageRow, names: AttributionNames = {}): CmsPage {
  return {
    kind: "page",
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    status: safeStatus(row.status),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    canonicalPath: row.canonical_path,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
    attribution: attribution(row, names),
  };
}

export function mapPost(row: PostRow, names: AttributionNames = {}): CmsPost {
  return {
    kind: "post",
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    status: safeStatus(row.status),
    authorName: row.author_name,
    category: row.category,
    readingTime: row.reading_time,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
    attribution: attribution(row, names),
  };
}

export function mapService(row: ServiceRow, names: AttributionNames = {}): CmsService {
  return {
    kind: "service",
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    businessProblem: row.business_problem,
    scope: row.scope,
    deliverables: row.deliverables ?? [],
    engagementModel: row.engagement_model,
    icon: row.icon as MarketingIconKey,
    sortOrder: row.sort_order,
    active: row.active,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
    attribution: attribution(row, names),
  };
}

export function mapPricingPlan(row: PricingPlanRow, names: AttributionNames = {}): CmsPricingPlan {
  return {
    kind: "pricing_plan",
    id: row.id,
    slug: row.slug,
    name: row.name,
    label: row.label,
    targetUser: row.target_user,
    description: row.description,
    features: row.features ?? [],
    limitations: row.limitations ?? [],
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    featured: row.featured,
    sortOrder: row.sort_order,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
    attribution: attribution(row, names),
  };
}
