import type { MarketingIconKey } from "../../content/shared";

export const CMS_STATUSES = ["draft", "published", "archived"] as const;
export type CmsStatus = (typeof CMS_STATUSES)[number];

export const CMS_ENTITY_TYPES = ["pages", "posts", "services", "pricing_plans"] as const;
export type CmsEntityType = (typeof CMS_ENTITY_TYPES)[number];

export type CmsRevisionAction =
  | "CREATED"
  | "UPDATED"
  | "PUBLISHED"
  | "UNPUBLISHED"
  | "ARCHIVED"
  | "RESTORED";

export type CmsAttribution = {
  createdBy: string;
  updatedBy: string;
  publishedBy?: string | null;
};

export type CmsRecordBase = {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  attribution: CmsAttribution;
};

export type CmsPage = CmsRecordBase & {
  kind: "page";
  title: string;
  summary: string;
  body: string;
  status: CmsStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalPath: string;
  publishedAt: string | null;
};

export type CmsPost = CmsRecordBase & {
  kind: "post";
  title: string;
  excerpt: string;
  body: string;
  status: CmsStatus;
  authorName: string;
  category: string;
  readingTime: string;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
};

export type CmsService = CmsRecordBase & {
  kind: "service";
  title: string;
  summary: string;
  description: string;
  businessProblem: string;
  scope: string;
  deliverables: string[];
  engagementModel: string;
  icon: MarketingIconKey;
  sortOrder: number;
  active: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type CmsPricingPlan = CmsRecordBase & {
  kind: "pricing_plan";
  name: string;
  label: string;
  targetUser: string;
  description: string;
  features: string[];
  limitations: string[];
  ctaLabel: string;
  ctaHref: string;
  featured: boolean;
  sortOrder: number;
  active: boolean;
};

export type CmsRevision = {
  id: string;
  entityType: CmsEntityType;
  entityId: string;
  actorUserId: string;
  actorName: string;
  action: CmsRevisionAction;
  previousData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  createdAt: string;
};

export type CmsOverview = {
  pages: { draft: number; published: number; archived: number; total: number };
  posts: { draft: number; published: number; archived: number; total: number };
  services: { active: number; inactive: number; total: number };
  pricingPlans: { active: number; inactive: number; total: number };
};

export type CmsRecord = CmsPage | CmsPost | CmsService | CmsPricingPlan;
