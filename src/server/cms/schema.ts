import { z } from "zod";
import { CMS_STATUSES } from "./types";

const CMS_SERVICE_ICONS = [
  "strategy",
  "agents",
  "automation",
  "integration",
  "modernization",
  "cloud",
  "quality",
  "consulting",
] as const;

export const MAX_CMS_SLUG_LENGTH = 80;
export const MAX_CMS_BODY_LENGTH = 50000;

export const RESERVED_PAGE_SLUGS = new Set([
  "admin",
  "api",
  "_next",
  "robots.txt",
  "sitemap.xml",
  "ai-software-engineer",
  "agents",
  "services",
  "pricing",
  "blog",
  "contact",
  "privacy",
  "terms",
]);

const commonReservedSlugs = new Set(["admin", "api", "_next", "robots.txt", "sitemap.xml"]);

export function normalizeCmsSlug(value: string): string {
  return value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "")
    .slice(0, MAX_CMS_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

export function isSafeInternalPath(value: string): boolean {
  if (!value || value.length > 300 || !value.startsWith("/") || value.startsWith("//")) return false;
  if (value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) return false;
  try {
    const parsed = new URL(value, "https://cms.invalid");
    return parsed.origin === "https://cms.invalid" && parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseLineList(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugSchema(reserved: ReadonlySet<string>) {
  return z
    .string()
    .trim()
    .min(1, "Enter a slug.")
    .max(160)
    .transform(normalizeCmsSlug)
    .pipe(
      z
        .string()
        .min(1, "Enter a slug containing letters or numbers.")
        .max(MAX_CMS_SLUG_LENGTH)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a URL-safe slug.")
        .refine((value) => !reserved.has(value), "That slug is reserved by the application."),
    );
}

const idAndVersion = {
  id: z.string().trim().uuid().optional(),
  version: z.coerce.number().int().min(0).max(2_147_483_647),
};

const title = z.string().trim().min(1).max(160);
const seoTitle = z.string().trim().max(70);
const seoDescription = z.string().trim().max(170);
const status = z.enum(CMS_STATUSES);

export const pageInputSchema = z.object({
  ...idAndVersion,
  slug: slugSchema(RESERVED_PAGE_SLUGS),
  title,
  summary: z.string().trim().max(500),
  body: z.string().trim().max(MAX_CMS_BODY_LENGTH),
  status,
  seoTitle,
  seoDescription,
  canonicalPath: z
    .string()
    .trim()
    .max(200)
    .refine(isSafeInternalPath, "Use a safe internal canonical path.")
    .refine((value) => !/^\/(?:admin|api|_next)(?:\/|$)/.test(value), "That canonical path is reserved."),
}).superRefine((value, context) => {
  if (value.canonicalPath !== `/${value.slug}`) {
    context.addIssue({
      code: "custom",
      path: ["canonicalPath"],
      message: "Canonical path must match the page slug.",
    });
  }
});

export const postInputSchema = z.object({
  ...idAndVersion,
  slug: slugSchema(commonReservedSlugs),
  title,
  excerpt: z.string().trim().min(1).max(500),
  body: z.string().trim().min(1).max(MAX_CMS_BODY_LENGTH),
  status,
  authorName: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  readingTime: z.string().trim().min(1).max(40),
  seoTitle,
  seoDescription,
});

export const serviceInputSchema = z.object({
  ...idAndVersion,
  slug: slugSchema(commonReservedSlugs),
  title,
  summary: z.string().trim().min(1).max(500),
  description: z.string().trim().max(10000),
  businessProblem: z.string().trim().max(2000),
  scope: z.string().trim().max(2000),
  deliverables: z.array(z.string().trim().min(1).max(300)).max(20),
  engagementModel: z.string().trim().max(2000),
  icon: z.enum(CMS_SERVICE_ICONS),
  sortOrder: z.coerce.number().int().min(-10000).max(10000),
  active: z.boolean(),
  seoTitle,
  seoDescription,
});

export const pricingPlanInputSchema = z.object({
  ...idAndVersion,
  name: z.string().trim().min(1).max(120),
  slug: slugSchema(commonReservedSlugs),
  label: z.string().trim().min(1).max(100),
  targetUser: z.string().trim().max(300),
  description: z.string().trim().min(1).max(2000),
  features: z.array(z.string().trim().min(1).max(300)).max(30),
  limitations: z.array(z.string().trim().min(1).max(300)).max(30),
  ctaLabel: z.string().trim().min(1).max(100),
  ctaHref: z.string().trim().max(300).refine(isSafeInternalPath, "Use a safe internal CTA path."),
  featured: z.boolean(),
  sortOrder: z.coerce.number().int().min(-10000).max(10000),
  active: z.boolean(),
});
