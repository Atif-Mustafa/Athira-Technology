"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { requireContentEditor } from "../../../server/cms/guards";
import { CMS_CACHE_TAGS } from "../../../server/cms/public";
import {
  normalizeCmsSlug,
  pageInputSchema,
  parseLineList,
  postInputSchema,
  pricingPlanInputSchema,
  serviceInputSchema,
} from "../../../server/cms/schema";
import type { CmsStatus } from "../../../server/cms/types";

export type CmsActionState = {
  kind: "idle" | "success" | "error";
  message?: string;
  entityId?: string;
  version?: number;
};

type MutationResult = { entity_id: string; entity_version: number };

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function formBoolean(formData: FormData, name: string): boolean {
  const value = formString(formData, name).toLowerCase();
  return value === "true" || value === "1" || value === "on" || value === "yes";
}

function optionalId(formData: FormData) {
  return formString(formData, "id") || undefined;
}

function currentStatus(formData: FormData): CmsStatus {
  const value = formString(formData, "status");
  return value === "published" || value === "archived" ? value : "draft";
}

function requestedStatus(formData: FormData): CmsStatus {
  const intent = formString(formData, "intent");
  if (intent === "publish") return "published";
  if (intent === "archive") return "archived";
  if (intent === "unpublish" || intent === "draft" || intent === "restore") return "draft";
  return currentStatus(formData);
}

function requestedActive(formData: FormData): boolean {
  const intent = formString(formData, "intent");
  if (intent === "activate") return true;
  if (intent === "deactivate") return false;
  return formBoolean(formData, "active");
}

function validationError(): CmsActionState {
  return { kind: "error", message: "Review the highlighted content fields and try again." };
}

function mutationError(error: unknown): CmsActionState {
  const message = String((error as { message?: unknown } | null)?.message ?? "").toLowerCase();
  if (message.includes("cms_conflict") || message.includes("40001")) {
    return { kind: "error", message: "This content changed since you opened it. Reload before saving." };
  }
  if (message.includes("cms_admin_required")) {
    return { kind: "error", message: "Only an administrator can archive or restore this content." };
  }
  if (message.includes("cms_forbidden") || message.includes("42501")) {
    return { kind: "error", message: "You are not allowed to change this content." };
  }
  if (message.includes("cms_not_found") || message.includes("p0002")) {
    return { kind: "error", message: "This content no longer exists." };
  }
  if (message.includes("duplicate") || message.includes("unique")) {
    return { kind: "error", message: "That slug is already in use." };
  }
  if (message.includes("check constraint") || message.includes("invalid input")) {
    return { kind: "error", message: "The database rejected an invalid content value." };
  }
  return { kind: "error", message: "The content change could not be saved. Try again shortly." };
}

function resultState(data: unknown, message: string): CmsActionState {
  const row = Array.isArray(data) ? data[0] as MutationResult | undefined : data as MutationResult | null;
  if (!row?.entity_id || !Number.isInteger(row.entity_version)) {
    return { kind: "error", message: "The content was saved, but its new version could not be confirmed." };
  }
  return { kind: "success", message, entityId: row.entity_id, version: row.entity_version };
}

function revalidateAdmin(entityPath: string, id?: string) {
  revalidatePath("/admin/content");
  revalidatePath(entityPath);
  if (id) revalidatePath(`${entityPath}/${id}`);
}

export async function savePageAction(
  _previousState: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  const editor = await requireContentEditor("/admin/content/pages");
  const status = requestedStatus(formData);
  if (status === "archived" && editor.role !== "admin") {
    return { kind: "error", message: "Only an administrator can archive pages." };
  }
  const rawSlug = formString(formData, "slug");
  const normalizedSlug = normalizeCmsSlug(rawSlug);
  const parsed = pageInputSchema.safeParse({
    id: optionalId(formData),
    version: formString(formData, "version") || "0",
    slug: rawSlug,
    title: formString(formData, "title"),
    summary: formString(formData, "summary"),
    body: formString(formData, "body"),
    status,
    seoTitle: formString(formData, "seoTitle"),
    seoDescription: formString(formData, "seoDescription"),
    canonicalPath: formString(formData, "canonicalPath") || `/${normalizedSlug}`,
  });
  if (!parsed.success) return validationError();

  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await client.rpc("cms_save_page", {
      target_id: parsed.data.id ?? null,
      expected_version: parsed.data.version,
      new_slug: parsed.data.slug,
      new_title: parsed.data.title,
      new_summary: parsed.data.summary,
      new_body: parsed.data.body,
      new_status: parsed.data.status,
      new_seo_title: parsed.data.seoTitle,
      new_seo_description: parsed.data.seoDescription,
      new_canonical_path: parsed.data.canonicalPath,
    });
    if (error) return mutationError(error);

    updateTag(CMS_CACHE_TAGS.pages);
    revalidatePath(parsed.data.canonicalPath);
    revalidatePath("/sitemap.xml");
    const state = resultState(data, parsed.data.id ? "Page updated." : "Page created.");
    revalidateAdmin("/admin/content/pages", state.entityId);
    return state;
  } catch (error) {
    return mutationError(error);
  }
}

export async function savePostAction(
  _previousState: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  const editor = await requireContentEditor("/admin/blog");
  const status = requestedStatus(formData);
  if (status === "archived" && editor.role !== "admin") {
    return { kind: "error", message: "Only an administrator can archive posts." };
  }
  const parsed = postInputSchema.safeParse({
    id: optionalId(formData),
    version: formString(formData, "version") || "0",
    slug: formString(formData, "slug"),
    title: formString(formData, "title"),
    excerpt: formString(formData, "excerpt"),
    body: formString(formData, "body"),
    status,
    authorName: formString(formData, "authorName"),
    category: formString(formData, "category"),
    readingTime: formString(formData, "readingTime"),
    seoTitle: formString(formData, "seoTitle"),
    seoDescription: formString(formData, "seoDescription"),
  });
  if (!parsed.success) return validationError();

  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await client.rpc("cms_save_post", {
      target_id: parsed.data.id ?? null,
      expected_version: parsed.data.version,
      new_slug: parsed.data.slug,
      new_title: parsed.data.title,
      new_excerpt: parsed.data.excerpt,
      new_body: parsed.data.body,
      new_status: parsed.data.status,
      new_author_name: parsed.data.authorName,
      new_category: parsed.data.category,
      new_reading_time: parsed.data.readingTime,
      new_seo_title: parsed.data.seoTitle,
      new_seo_description: parsed.data.seoDescription,
    });
    if (error) return mutationError(error);

    updateTag(CMS_CACHE_TAGS.posts);
    revalidatePath("/blog");
    revalidatePath(`/blog/${parsed.data.slug}`);
    revalidatePath("/sitemap.xml");
    const state = resultState(data, parsed.data.id ? "Post updated." : "Post created.");
    revalidateAdmin("/admin/blog", state.entityId);
    return state;
  } catch (error) {
    return mutationError(error);
  }
}

export async function saveServiceAction(
  _previousState: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  await requireContentEditor("/admin/services");
  const parsed = serviceInputSchema.safeParse({
    id: optionalId(formData),
    version: formString(formData, "version") || "0",
    slug: formString(formData, "slug"),
    title: formString(formData, "title"),
    summary: formString(formData, "summary"),
    description: formString(formData, "description"),
    businessProblem: formString(formData, "businessProblem"),
    scope: formString(formData, "scope"),
    deliverables: parseLineList(formString(formData, "deliverables")),
    engagementModel: formString(formData, "engagementModel"),
    icon: formString(formData, "icon"),
    sortOrder: formString(formData, "sortOrder") || "0",
    active: requestedActive(formData),
    seoTitle: formString(formData, "seoTitle"),
    seoDescription: formString(formData, "seoDescription"),
  });
  if (!parsed.success) return validationError();

  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await client.rpc("cms_save_service", {
      target_id: parsed.data.id ?? null,
      expected_version: parsed.data.version,
      new_slug: parsed.data.slug,
      new_title: parsed.data.title,
      new_summary: parsed.data.summary,
      new_description: parsed.data.description,
      new_business_problem: parsed.data.businessProblem,
      new_scope: parsed.data.scope,
      new_deliverables: parsed.data.deliverables,
      new_engagement_model: parsed.data.engagementModel,
      new_icon: parsed.data.icon,
      new_sort_order: parsed.data.sortOrder,
      new_active: parsed.data.active,
      new_seo_title: parsed.data.seoTitle,
      new_seo_description: parsed.data.seoDescription,
    });
    if (error) return mutationError(error);

    updateTag(CMS_CACHE_TAGS.services);
    revalidatePath("/");
    revalidatePath("/services");
    const state = resultState(data, parsed.data.id ? "Service updated." : "Service created.");
    revalidateAdmin("/admin/services", state.entityId);
    return state;
  } catch (error) {
    return mutationError(error);
  }
}

export async function savePricingPlanAction(
  _previousState: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  await requireContentEditor("/admin/pricing");
  const parsed = pricingPlanInputSchema.safeParse({
    id: optionalId(formData),
    version: formString(formData, "version") || "0",
    name: formString(formData, "name"),
    slug: formString(formData, "slug"),
    label: formString(formData, "label"),
    targetUser: formString(formData, "targetUser"),
    description: formString(formData, "description"),
    features: parseLineList(formString(formData, "features")),
    limitations: parseLineList(formString(formData, "limitations")),
    ctaLabel: formString(formData, "ctaLabel"),
    ctaHref: formString(formData, "ctaHref"),
    featured: formBoolean(formData, "featured"),
    sortOrder: formString(formData, "sortOrder") || "0",
    active: requestedActive(formData),
  });
  if (!parsed.success) return validationError();

  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await client.rpc("cms_save_pricing_plan", {
      target_id: parsed.data.id ?? null,
      expected_version: parsed.data.version,
      new_name: parsed.data.name,
      new_slug: parsed.data.slug,
      new_label: parsed.data.label,
      new_target_user: parsed.data.targetUser,
      new_description: parsed.data.description,
      new_features: parsed.data.features,
      new_limitations: parsed.data.limitations,
      new_cta_label: parsed.data.ctaLabel,
      new_cta_href: parsed.data.ctaHref,
      new_featured: parsed.data.featured,
      new_sort_order: parsed.data.sortOrder,
      new_active: parsed.data.active,
    });
    if (error) return mutationError(error);

    updateTag(CMS_CACHE_TAGS.pricing);
    revalidatePath("/");
    revalidatePath("/pricing");
    const state = resultState(data, parsed.data.id ? "Pricing plan updated." : "Pricing plan created.");
    revalidateAdmin("/admin/pricing", state.entityId);
    return state;
  } catch (error) {
    return mutationError(error);
  }
}
