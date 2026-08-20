import "server-only";

import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import {
  getCmsPage,
  getCmsPost,
  getCmsPricingPlan,
  getCmsService,
  listCmsPages,
  listCmsPosts,
  listCmsPricingPlans,
  listCmsRevisions,
  listCmsServices,
} from "../../../server/cms/admin";
import { canEditContent, requireContentEditor, requireContentViewer } from "../../../server/cms/guards";
import type { CmsEntityType, CmsRecord } from "../../../server/cms/types";
import { Card, CardContent } from "../../ui/Card";
import { CmsEditorForm } from "./CmsEditorForm";
import { CmsModuleHeader, CmsRecordList, CmsRevisionHistory } from "./CmsUi";

export type CmsRouteKind = "page" | "post" | "service" | "pricing";

const routeConfig = {
  page: { eyebrow: "Content", title: "Pages", description: "Manage limited marketing pages, publishing state, canonical paths, and search metadata.", base: "/admin/content/pages", create: "Create page", entityType: "pages" as CmsEntityType },
  post: { eyebrow: "Editorial", title: "Blog", description: "Create, preview, publish, unpublish, and archive public articles without exposing drafts.", base: "/admin/blog", create: "Create post", entityType: "posts" as CmsEntityType },
  service: { eyebrow: "Content", title: "Services", description: "Manage public service descriptions, order, visibility, and supporting search metadata.", base: "/admin/services", create: "Create service", entityType: "services" as CmsEntityType },
  pricing: { eyebrow: "Content", title: "Pricing", description: "Manage informational plan copy, ordering, featured state, and safe internal calls to action.", base: "/admin/pricing", create: "Create pricing plan", entityType: "pricing_plans" as CmsEntityType },
} as const;

async function loadList(kind: CmsRouteKind, context: Awaited<ReturnType<typeof requireContentViewer>>): Promise<CmsRecord[]> {
  if (kind === "page") return listCmsPages(context);
  if (kind === "post") return listCmsPosts(context);
  if (kind === "service") return listCmsServices(context);
  return listCmsPricingPlans(context);
}

async function loadRecord(kind: CmsRouteKind, context: Awaited<ReturnType<typeof requireContentViewer>>, id: string): Promise<CmsRecord | null> {
  if (kind === "page") return getCmsPage(context, id);
  if (kind === "post") return getCmsPost(context, id);
  if (kind === "service") return getCmsService(context, id);
  return getCmsPricingPlan(context, id);
}

function editor(kind: CmsRouteKind, record: CmsRecord | null, canEdit: boolean, isAdmin: boolean) {
  if (kind === "page") return <CmsEditorForm kind="page" record={record?.kind === "page" ? record : null} canEdit={canEdit} isAdmin={isAdmin} />;
  if (kind === "post") return <CmsEditorForm kind="post" record={record?.kind === "post" ? record : null} canEdit={canEdit} isAdmin={isAdmin} />;
  if (kind === "service") return <CmsEditorForm kind="service" record={record?.kind === "service" ? record : null} canEdit={canEdit} isAdmin={isAdmin} />;
  return <CmsEditorForm kind="pricing" record={record?.kind === "pricing_plan" ? record : null} canEdit={canEdit} isAdmin={isAdmin} />;
}

function LoadError({ base }: { base: string }) {
  return <Card><CardContent className="p-6"><p role="alert" className="text-sm leading-6 text-red-200">CMS data is unavailable. Confirm the CMS migration and Preview Supabase configuration, then try again.</p><Link href={base} className="mt-4 inline-flex text-sm font-semibold text-blue-200">Return to the module</Link></CardContent></Card>;
}

export async function CmsListView({ kind }: { kind: CmsRouteKind }) {
  const config = routeConfig[kind];
  const context = await requireContentViewer(config.base);
  const editable = canEditContent(context);
  let records: CmsRecord[] = [];
  let failed = false;
  try {
    records = await loadList(kind, context);
  } catch {
    failed = true;
  }

  return <div className="space-y-6"><CmsModuleHeader eyebrow={config.eyebrow} title={config.title} description={config.description} createHref={`${config.base}/new`} createLabel={config.create} canEdit={editable} />{failed ? <LoadError base="/admin/content" /> : <CmsRecordList records={records} baseHref={config.base} emptyLabel={`No ${config.title.toLowerCase()} yet`} />}</div>;
}

export async function CmsNewView({ kind }: { kind: CmsRouteKind }) {
  const config = routeConfig[kind];
  const context = await requireContentEditor(`${config.base}/new`);
  return <div className="mx-auto w-full max-w-5xl space-y-6"><CmsModuleHeader eyebrow={config.eyebrow} title={config.create} description={`Create a database-backed ${kind === "pricing" ? "pricing plan" : kind}. Validation and authorization run again on the server.`} canEdit />{editor(kind, null, true, context.role === "admin")}</div>;
}

export async function CmsEditView({ kind, id }: { kind: CmsRouteKind; id: string }) {
  const config = routeConfig[kind];
  if (!z.string().uuid().safeParse(id).success) notFound();
  const context = await requireContentViewer(`${config.base}/${id}`);
  const editable = canEditContent(context);
  let record: CmsRecord | null;
  let revisions: Awaited<ReturnType<typeof listCmsRevisions>>;
  try {
    [record, revisions] = await Promise.all([
      loadRecord(kind, context, id),
      listCmsRevisions(context, config.entityType, id),
    ]);
  } catch {
    return <LoadError base={config.base} />;
  }
  if (!record) notFound();
  const title = record.kind === "pricing_plan" ? record.name : record.title;
  return <div className="mx-auto w-full max-w-5xl space-y-6"><CmsModuleHeader eyebrow={config.title} title={title} description="Edit the current version or review it without mutation, according to your role." canEdit={editable} />{editor(kind, record, editable, context.role === "admin")}<CmsRevisionHistory revisions={revisions} /></div>;
}
