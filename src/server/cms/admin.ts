import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import type { ContentViewerContext } from "./guards";
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
import type {
  CmsEntityType,
  CmsOverview,
  CmsPage,
  CmsPost,
  CmsPricingPlan,
  CmsRevision,
  CmsRevisionAction,
  CmsService,
} from "./types";

const PAGE_COLUMNS = "id,slug,title,summary,body,status,seo_title,seo_description,canonical_path,created_by,updated_by,published_by,created_at,updated_at,published_at,version";
const POST_COLUMNS = "id,slug,title,excerpt,body,status,author_name,category,reading_time,seo_title,seo_description,created_by,updated_by,published_by,published_at,created_at,updated_at,version";
const SERVICE_COLUMNS = "id,slug,title,summary,description,business_problem,scope,deliverables,engagement_model,icon,sort_order,active,seo_title,seo_description,created_by,updated_by,created_at,updated_at,version";
const PRICING_COLUMNS = "id,name,slug,label,target_user,description,features,limitations,cta_label,cta_href,featured,sort_order,active,created_by,updated_by,created_at,updated_at,version";

function assertContentContext(context: ContentViewerContext) {
  if (
    !context.user.id ||
    context.profile.status !== "active" ||
    !["admin", "editor", "viewer"].includes(context.role)
  ) {
    throw new Error("CMS access denied.");
  }
}

function errorMessage(error: unknown, fallback: string) {
  const candidate = error as { message?: unknown } | null;
  return typeof candidate?.message === "string" && candidate.message
    ? candidate.message
    : fallback;
}

async function contentClient(context: ContentViewerContext) {
  assertContentContext(context);
  return createSupabaseServerClient();
}

function actorIds(rows: Array<{ created_by: string; updated_by: string; published_by?: string | null }>) {
  return [...new Set(rows.flatMap((row) => [row.created_by, row.updated_by, row.published_by].filter((id): id is string => Boolean(id))))];
}

async function resolveActorNames(client: SupabaseClient, ids: string[]) {
  const entries = await Promise.all(ids.map(async (id) => {
    const { data, error } = await client.rpc("cms_user_display_name", { target_user_id: id });
    return [id, error || typeof data !== "string" ? id : data] as const;
  }));
  return Object.fromEntries(entries);
}

export async function listCmsPages(context: ContentViewerContext): Promise<CmsPage[]> {
  const client = await contentClient(context);
  const { data, error } = await client.from("pages").select(PAGE_COLUMNS).order("updated_at", { ascending: false });
  if (error) throw new Error(errorMessage(error, "Unable to load pages."));
  const rows = (data ?? []) as PageRow[];
  const names = await resolveActorNames(client, actorIds(rows));
  return rows.map((row) => mapPage(row, names));
}

export async function listCmsPosts(context: ContentViewerContext): Promise<CmsPost[]> {
  const client = await contentClient(context);
  const { data, error } = await client.from("posts").select(POST_COLUMNS).order("updated_at", { ascending: false });
  if (error) throw new Error(errorMessage(error, "Unable to load posts."));
  const rows = (data ?? []) as PostRow[];
  const names = await resolveActorNames(client, actorIds(rows));
  return rows.map((row) => mapPost(row, names));
}

export async function listCmsServices(context: ContentViewerContext): Promise<CmsService[]> {
  const client = await contentClient(context);
  const { data, error } = await client.from("services").select(SERVICE_COLUMNS).order("sort_order", { ascending: true });
  if (error) throw new Error(errorMessage(error, "Unable to load services."));
  const rows = (data ?? []) as ServiceRow[];
  const names = await resolveActorNames(client, actorIds(rows));
  return rows.map((row) => mapService(row, names));
}

export async function listCmsPricingPlans(context: ContentViewerContext): Promise<CmsPricingPlan[]> {
  const client = await contentClient(context);
  const { data, error } = await client.from("pricing_plans").select(PRICING_COLUMNS).order("sort_order", { ascending: true });
  if (error) throw new Error(errorMessage(error, "Unable to load pricing plans."));
  const rows = (data ?? []) as PricingPlanRow[];
  const names = await resolveActorNames(client, actorIds(rows));
  return rows.map((row) => mapPricingPlan(row, names));
}

async function getOne<Row, Result>(
  context: ContentViewerContext,
  table: string,
  columns: string,
  id: string,
  mapper: (row: Row, names: Record<string, string>) => Result,
): Promise<Result | null> {
  const client = await contentClient(context);
  const { data, error } = await client.from(table).select(columns).eq("id", id).maybeSingle();
  if (error) throw new Error(errorMessage(error, `Unable to load ${table}.`));
  if (!data) return null;
  const row = data as unknown as Row & { created_by: string; updated_by: string; published_by?: string | null };
  const names = await resolveActorNames(client, actorIds([row]));
  return mapper(row, names);
}

export function getCmsPage(context: ContentViewerContext, id: string) {
  return getOne<PageRow, CmsPage>(context, "pages", PAGE_COLUMNS, id, mapPage);
}

export function getCmsPost(context: ContentViewerContext, id: string) {
  return getOne<PostRow, CmsPost>(context, "posts", POST_COLUMNS, id, mapPost);
}

export function getCmsService(context: ContentViewerContext, id: string) {
  return getOne<ServiceRow, CmsService>(context, "services", SERVICE_COLUMNS, id, mapService);
}

export function getCmsPricingPlan(context: ContentViewerContext, id: string) {
  return getOne<PricingPlanRow, CmsPricingPlan>(context, "pricing_plans", PRICING_COLUMNS, id, mapPricingPlan);
}

async function exactCount(
  client: SupabaseClient,
  table: string,
  column: string,
  value: string | boolean,
): Promise<number> {
  const { count, error } = await client.from(table).select("id", { count: "exact", head: true }).eq(column, value);
  if (error) throw new Error(errorMessage(error, `Unable to count ${table}.`));
  return count ?? 0;
}

export async function getCmsOverview(context: ContentViewerContext): Promise<CmsOverview> {
  const client = await contentClient(context);
  const [
    pageDraft,
    pagePublished,
    pageArchived,
    postDraft,
    postPublished,
    postArchived,
    serviceActive,
    serviceInactive,
    pricingActive,
    pricingInactive,
  ] = await Promise.all([
    exactCount(client, "pages", "status", "draft"),
    exactCount(client, "pages", "status", "published"),
    exactCount(client, "pages", "status", "archived"),
    exactCount(client, "posts", "status", "draft"),
    exactCount(client, "posts", "status", "published"),
    exactCount(client, "posts", "status", "archived"),
    exactCount(client, "services", "active", true),
    exactCount(client, "services", "active", false),
    exactCount(client, "pricing_plans", "active", true),
    exactCount(client, "pricing_plans", "active", false),
  ]);

  return {
    pages: { draft: pageDraft, published: pagePublished, archived: pageArchived, total: pageDraft + pagePublished + pageArchived },
    posts: { draft: postDraft, published: postPublished, archived: postArchived, total: postDraft + postPublished + postArchived },
    services: { active: serviceActive, inactive: serviceInactive, total: serviceActive + serviceInactive },
    pricingPlans: { active: pricingActive, inactive: pricingInactive, total: pricingActive + pricingInactive },
  };
}

type RevisionRow = {
  id: string;
  entity_type: CmsEntityType;
  entity_id: string;
  actor_user_id: string;
  action: CmsRevisionAction;
  previous_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
};

export async function listCmsRevisions(
  context: ContentViewerContext,
  entityType: CmsEntityType,
  entityId: string,
): Promise<CmsRevision[]> {
  const client = await contentClient(context);
  const { data, error } = await client
    .from("content_revisions")
    .select("id,entity_type,entity_id,actor_user_id,action,previous_data,new_data,created_at")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw new Error(errorMessage(error, "Unable to load content history."));
  const rows = (data ?? []) as RevisionRow[];
  const names = await resolveActorNames(client, [...new Set(rows.map((row) => row.actor_user_id))]);
  return rows.map((row) => ({
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actorUserId: row.actor_user_id,
    actorName: names[row.actor_user_id] ?? row.actor_user_id,
    action: row.action,
    previousData: row.previous_data,
    newData: row.new_data,
    createdAt: row.created_at,
  }));
}
