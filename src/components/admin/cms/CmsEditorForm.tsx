"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  savePageAction,
  savePostAction,
  savePricingPlanAction,
  saveServiceAction,
  type CmsActionState,
} from "../../../app/admin/cms/actions";
import type { CmsPage, CmsPost, CmsPricingPlan, CmsService } from "../../../server/cms/types";
import { CmsStatusBadge } from "./CmsUi";

type Props =
  | { kind: "page"; record: CmsPage | null; canEdit: boolean; isAdmin: boolean }
  | { kind: "post"; record: CmsPost | null; canEdit: boolean; isAdmin: boolean }
  | { kind: "service"; record: CmsService | null; canEdit: boolean; isAdmin: boolean }
  | { kind: "pricing"; record: CmsPricingPlan | null; canEdit: boolean; isAdmin: boolean };

const initialState: CmsActionState = { kind: "idle" };
const inputClass = "mt-2 block min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 disabled:cursor-not-allowed disabled:opacity-60";
const textareaClass = `${inputClass} min-h-32 resize-y leading-6`;

function Field({ label, name, defaultValue = "", required = false, maxLength, description, type = "text" }: { label: string; name: string; defaultValue?: string | number; required?: boolean; maxLength?: number; description?: string; type?: "text" | "number" }) {
  const id = `cms-${name}`;
  const descriptionId = description ? `${id}-description` : undefined;
  return <div><label htmlFor={id} className="block text-sm font-medium text-slate-200">{label}{required ? <span aria-hidden="true" className="ml-1 text-blue-300">*</span> : null}</label>{description ? <p id={descriptionId} className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}<input id={id} name={name} type={type} defaultValue={defaultValue} required={required} maxLength={maxLength} aria-describedby={descriptionId} className={inputClass} /></div>;
}

function TextArea({ label, name, defaultValue = "", required = false, maxLength, description, rows = 5 }: { label: string; name: string; defaultValue?: string; required?: boolean; maxLength?: number; description?: string; rows?: number }) {
  const id = `cms-${name}`;
  const descriptionId = description ? `${id}-description` : undefined;
  return <div><label htmlFor={id} className="block text-sm font-medium text-slate-200">{label}{required ? <span aria-hidden="true" className="ml-1 text-blue-300">*</span> : null}</label>{description ? <p id={descriptionId} className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}<textarea id={id} name={name} defaultValue={defaultValue} required={required} maxLength={maxLength} rows={rows} aria-describedby={descriptionId} className={textareaClass} /></div>;
}

function SeoFields({ title, description }: { title: string | null; description: string | null }) {
  return <section aria-labelledby="seo-fields-heading" className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5"><h2 id="seo-fields-heading" className="text-lg font-semibold text-white">Search metadata</h2><p className="mt-1 text-sm text-slate-400">Optional values override the public title and description without changing the visible heading.</p><div className="mt-5 grid gap-5"><Field label="SEO title" name="seoTitle" defaultValue={title ?? ""} maxLength={70} /><TextArea label="SEO description" name="seoDescription" defaultValue={description ?? ""} maxLength={170} rows={3} /></div></section>;
}

function PageFields({ record }: { record: CmsPage | null }) {
  return <><div className="grid gap-5 lg:grid-cols-2"><Field label="Page title" name="title" defaultValue={record?.title} required maxLength={160} /><Field label="Slug" name="slug" defaultValue={record?.slug} required maxLength={80} description="Lowercase URL segment. Framework routes and private paths are reserved." /></div><TextArea label="Summary" name="summary" defaultValue={record?.summary} maxLength={500} rows={3} /><TextArea label="Page body" name="body" defaultValue={record?.body} maxLength={50000} rows={18} description="Minimal Markdown: headings, paragraphs, lists, and fenced code. Raw HTML is rendered as text." /><Field label="Canonical path" name="canonicalPath" defaultValue={record?.canonicalPath ?? ""} maxLength={200} description="Must match the root page slug, for example /about for the slug about." /><SeoFields title={record?.seoTitle ?? null} description={record?.seoDescription ?? null} /></>;
}

function PostFields({ record }: { record: CmsPost | null }) {
  return <><div className="grid gap-5 lg:grid-cols-2"><Field label="Post title" name="title" defaultValue={record?.title} required maxLength={160} /><Field label="Slug" name="slug" defaultValue={record?.slug} required maxLength={80} /></div><TextArea label="Excerpt" name="excerpt" defaultValue={record?.excerpt} required maxLength={500} rows={3} /><div className="grid gap-5 lg:grid-cols-3"><Field label="Author" name="authorName" defaultValue={record?.authorName ?? "Athira Technology editorial team"} required maxLength={120} /><Field label="Category" name="category" defaultValue={record?.category ?? "Insights"} required maxLength={80} /><Field label="Reading time" name="readingTime" defaultValue={record?.readingTime ?? "5 min read"} required maxLength={40} /></div><TextArea label="Post body" name="body" defaultValue={record?.body} required maxLength={50000} rows={22} description="Minimal Markdown only. Raw HTML and scripts are never executed." /><SeoFields title={record?.seoTitle ?? null} description={record?.seoDescription ?? null} /></>;
}

function ServiceFields({ record }: { record: CmsService | null }) {
  return <><div className="grid gap-5 lg:grid-cols-2"><Field label="Service title" name="title" defaultValue={record?.title} required maxLength={160} /><Field label="Slug" name="slug" defaultValue={record?.slug} required maxLength={80} /></div><TextArea label="Summary" name="summary" defaultValue={record?.summary} required maxLength={500} rows={3} /><TextArea label="Additional description" name="description" defaultValue={record?.description} maxLength={10000} /><div className="grid gap-5 lg:grid-cols-2"><TextArea label="Business problem" name="businessProblem" defaultValue={record?.businessProblem} maxLength={2000} /><TextArea label="Typical scope" name="scope" defaultValue={record?.scope} maxLength={2000} /></div><TextArea label="Deliverables" name="deliverables" defaultValue={record?.deliverables.join("\n")} maxLength={4000} rows={6} description="One deliverable per line; up to 20 items." /><TextArea label="Engagement model" name="engagementModel" defaultValue={record?.engagementModel} maxLength={2000} rows={4} /><div className="grid gap-5 lg:grid-cols-3"><div><label htmlFor="cms-icon" className="block text-sm font-medium text-slate-200">Icon</label><select id="cms-icon" name="icon" defaultValue={record?.icon ?? "strategy"} className={inputClass}>{["strategy", "agents", "automation", "integration", "modernization", "cloud", "quality", "consulting"].map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select></div><Field label="Sort order" name="sortOrder" type="number" defaultValue={record?.sortOrder ?? 0} required /><label className="mt-7 flex min-h-11 items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"><input type="checkbox" name="active" defaultChecked={record?.active ?? false} className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-400" />Active on the public site</label></div><SeoFields title={record?.seoTitle ?? null} description={record?.seoDescription ?? null} /></>;
}

function PricingFields({ record }: { record: CmsPricingPlan | null }) {
  return <><div className="grid gap-5 lg:grid-cols-2"><Field label="Plan name" name="name" defaultValue={record?.name} required maxLength={120} /><Field label="Slug" name="slug" defaultValue={record?.slug} required maxLength={80} /></div><div className="grid gap-5 lg:grid-cols-2"><Field label="Pricing label" name="label" defaultValue={record?.label} required maxLength={100} /><Field label="Target audience" name="targetUser" defaultValue={record?.targetUser} maxLength={300} /></div><TextArea label="Description" name="description" defaultValue={record?.description} required maxLength={2000} /><div className="grid gap-5 lg:grid-cols-2"><TextArea label="Included features" name="features" defaultValue={record?.features.join("\n")} maxLength={5000} rows={7} description="One feature per line." /><TextArea label="Boundaries" name="limitations" defaultValue={record?.limitations.join("\n")} maxLength={5000} rows={7} description="One boundary per line." /></div><div className="grid gap-5 lg:grid-cols-2"><Field label="CTA label" name="ctaLabel" defaultValue={record?.ctaLabel} required maxLength={100} /><Field label="CTA path" name="ctaHref" defaultValue={record?.ctaHref ?? "/contact"} required maxLength={300} description="Internal paths only. Script and protocol URLs are rejected." /></div><div className="grid gap-5 lg:grid-cols-3"><Field label="Sort order" name="sortOrder" type="number" defaultValue={record?.sortOrder ?? 0} required /><label className="mt-7 flex min-h-11 items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"><input type="checkbox" name="featured" defaultChecked={record?.featured ?? false} className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-400" />Featured plan</label><label className="mt-7 flex min-h-11 items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"><input type="checkbox" name="active" defaultChecked={record?.active ?? false} className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-400" />Active on the public site</label></div></>;
}

function entityBase(kind: Props["kind"]) {
  if (kind === "page") return "/admin/content/pages";
  if (kind === "post") return "/admin/blog";
  if (kind === "service") return "/admin/services";
  return "/admin/pricing";
}

export function CmsEditorForm(props: Props) {
  const action = props.kind === "page" ? savePageAction : props.kind === "post" ? savePostAction : props.kind === "service" ? saveServiceAction : savePricingPlanAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const version = state.version ?? props.record?.version ?? 0;
  const [archiveDialog, setArchiveDialog] = useState(false);
  const archiveTrigger = useRef<HTMLButtonElement>(null);
  const archiveCancel = useRef<HTMLButtonElement>(null);
  const archiveConfirm = useRef<HTMLButtonElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const router = useRouter();
  const base = entityBase(props.kind);
  const isLifecycleContent = props.kind === "page" || props.kind === "post";
  const status = isLifecycleContent ? props.record?.status ?? "draft" : props.record?.active ? "active" : "inactive";
  const archivedForEditor = isLifecycleContent && status === "archived" && !props.isAdmin;
  const mutationAllowed = props.canEdit && !archivedForEditor;

  useEffect(() => {
    if (state.kind === "success") {
      // The latest action result already carries the authoritative version.
      messageRef.current?.focus();
      if (!props.record && state.entityId) router.replace(`${base}/${state.entityId}`);
    }
  }, [base, props.record, router, state]);

  useEffect(() => {
    if (!archiveDialog) return;
    archiveCancel.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setArchiveDialog(false);
        archiveTrigger.current?.focus();
      }
      if (event.key === "Tab") {
        const first = archiveCancel.current;
        const last = archiveConfirm.current;
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [archiveDialog]);

  const previewHref = props.record
    ? props.kind === "post" ? `/admin/preview/post/${props.record.id}`
      : props.kind === "page" ? `/admin/preview/page/${props.record.id}`
        : null
    : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/35 p-4">
        <div className="flex flex-wrap items-center gap-3"><CmsStatusBadge value={status} /><span className="text-sm text-slate-400">Version {version}</span>{props.record ? <span className="text-sm text-slate-400">Updated by {props.record.attribution.updatedBy}</span> : null}</div>
        {previewHref && props.canEdit ? <Link href={previewHref} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-blue-200 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Preview draft</Link> : null}
      </div>

      {!props.canEdit ? <p role="note" className="rounded-xl border border-blue-400/25 bg-blue-400/10 p-4 text-sm leading-6 text-blue-100">Viewer access is read-only. Server and database authorization deny every CMS mutation.</p> : null}
      {archivedForEditor ? <p role="note" className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">Archived content is read-only for editors. An administrator must restore it before changes can be saved.</p> : null}
      {state.kind !== "idle" ? <p ref={messageRef} tabIndex={-1} role={state.kind === "success" ? "status" : "alert"} aria-live="polite" className={state.kind === "success" ? "rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-100 focus:outline-none" : "rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-100 focus:outline-none"}>{state.message}</p> : null}

      <form id="cms-editor-form" action={formAction} noValidate className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-5 sm:p-6">
        <input type="hidden" name="id" value={props.record?.id ?? ""} />
        <input type="hidden" name="version" value={version} />
        {isLifecycleContent ? <input type="hidden" name="status" value={props.record?.status ?? "draft"} /> : null}
        <fieldset disabled={!mutationAllowed || pending} className="space-y-6 disabled:opacity-80">
          <legend className="sr-only">{props.kind} content fields</legend>
          {props.kind === "page" ? <PageFields record={props.record} /> : null}
          {props.kind === "post" ? <PostFields record={props.record} /> : null}
          {props.kind === "service" ? <ServiceFields record={props.record} /> : null}
          {props.kind === "pricing" ? <PricingFields record={props.record} /> : null}
        </fieldset>

        {mutationAllowed ? <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-5"><button type="submit" name="intent" value="save" disabled={pending} className="min-h-11 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-60">{pending ? "Saving…" : props.record ? "Update" : isLifecycleContent ? "Save draft" : "Create"}</button>{isLifecycleContent && status !== "published" && status !== "archived" ? <button type="submit" name="intent" value="publish" disabled={pending} className="min-h-11 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:opacity-60">Publish</button> : null}{isLifecycleContent && status === "published" ? <button type="submit" name="intent" value="unpublish" disabled={pending} className="min-h-11 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-100 hover:bg-amber-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-60">Unpublish</button> : null}{isLifecycleContent && status === "archived" && props.isAdmin ? <button type="submit" name="intent" value="restore" disabled={pending} className="min-h-11 rounded-xl border border-emerald-400/30 px-4 py-2.5 text-sm font-semibold text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">Restore as draft</button> : null}{isLifecycleContent && props.record && status !== "archived" && props.isAdmin ? <button ref={archiveTrigger} type="button" disabled={pending} onClick={() => setArchiveDialog(true)} className="min-h-11 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm font-semibold text-red-100 hover:bg-red-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-60">Archive</button> : null}{!isLifecycleContent && props.record ? <button type="submit" name="intent" value={status === "active" ? "deactivate" : "activate"} disabled={pending} className="min-h-11 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">{status === "active" ? "Make inactive" : "Activate"}</button> : null}<Link href={base} className="min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Cancel</Link></div> : null}
      </form>

      {archiveDialog ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="cms-archive-title" className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"><h2 id="cms-archive-title" className="text-xl font-semibold text-white">Archive this content?</h2><p className="mt-3 text-sm leading-6 text-slate-300">Archived content is removed from public routes, metadata, and the sitemap. An administrator can restore it later.</p><div className="mt-6 flex justify-end gap-3"><button ref={archiveCancel} type="button" onClick={() => { setArchiveDialog(false); archiveTrigger.current?.focus(); }} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Cancel</button><button ref={archiveConfirm} type="submit" form="cms-editor-form" name="intent" value="archive" onClick={() => setArchiveDialog(false)} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300">Archive content</button></div></div></div> : null}
    </div>
  );
}
