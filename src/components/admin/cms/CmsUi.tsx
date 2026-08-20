import Link from "next/link";
import { ArrowRight, Clock3, Plus } from "lucide-react";
import { Badge } from "../../ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/Card";
import type { CmsRecord, CmsRevision, CmsStatus } from "../../../server/cms/types";

export function CmsModuleHeader({
  eyebrow,
  title,
  description,
  createHref,
  createLabel,
  canEdit,
}: {
  eyebrow: string;
  title: string;
  description: string;
  createHref?: string;
  createLabel?: string;
  canEdit: boolean;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">{description}</p>
      </div>
      {createHref && canEdit ? (
        <Link href={createHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
          <Plus aria-hidden="true" className="h-4 w-4" /> {createLabel ?? "Create"}
        </Link>
      ) : (
        <Badge variant={canEdit ? "success" : "outline"}>{canEdit ? "Editing enabled" : "Read-only access"}</Badge>
      )}
    </header>
  );
}

function statusVariant(status: CmsStatus | "active" | "inactive") {
  if (status === "published" || status === "active") return "success" as const;
  if (status === "draft") return "warning" as const;
  return "outline" as const;
}

export function CmsStatusBadge({ value }: { value: CmsStatus | "active" | "inactive" }) {
  return <Badge variant={statusVariant(value)}><span className="sr-only">Content status: </span>{value}</Badge>;
}

function recordTitle(record: CmsRecord) {
  return record.kind === "pricing_plan" ? record.name : record.title;
}

function recordStatus(record: CmsRecord): CmsStatus | "active" | "inactive" {
  return record.kind === "page" || record.kind === "post"
    ? record.status
    : record.active ? "active" : "inactive";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "Unavailable" : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function CmsRecordList({ records, baseHref, emptyLabel }: { records: CmsRecord[]; baseHref: string; emptyLabel: string }) {
  if (!records.length) {
    return <Card><CardContent className="p-8 text-center"><h2 className="text-lg font-semibold text-white">{emptyLabel}</h2><p className="mt-2 text-sm text-slate-400">Create the first record when you are ready.</p></CardContent></Card>;
  }

  return (
    <Card aria-labelledby="cms-record-list-heading">
      <CardHeader className="border-b border-slate-800"><CardTitle as="h2" id="cms-record-list-heading">Content records</CardTitle><CardDescription>Database-backed records ordered for editorial review.</CardDescription></CardHeader>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left">
          <caption className="sr-only">CMS content records</caption>
          <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500"><tr><th scope="col" className="px-5 py-3">Content</th><th scope="col" className="px-5 py-3">Status</th><th scope="col" className="px-5 py-3">Version</th><th scope="col" className="px-5 py-3">Updated</th><th scope="col" className="px-5 py-3 text-right">Action</th></tr></thead>
          <tbody>{records.map((record) => <tr key={record.id} className="border-t border-slate-800"><td className="px-5 py-4"><p className="font-semibold text-white">{recordTitle(record)}</p><p className="mt-1 text-xs text-slate-500">/{record.slug}</p></td><td className="px-5 py-4"><CmsStatusBadge value={recordStatus(record)} /></td><td className="px-5 py-4 text-sm text-slate-300">v{record.version}</td><td className="px-5 py-4 text-sm text-slate-300"><span className="block">{formatDate(record.updatedAt)}</span><span className="mt-1 block text-xs text-slate-500">by {record.attribution.updatedBy}</span></td><td className="px-5 py-4 text-right"><Link href={`${baseHref}/${record.id}`} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Open <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></td></tr>)}</tbody>
        </table>
      </div>
      <ul className="grid gap-3 p-4 md:hidden">{records.map((record) => <li key={record.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate font-semibold text-white">{recordTitle(record)}</h2><p className="mt-1 truncate text-xs text-slate-500">/{record.slug}</p></div><CmsStatusBadge value={recordStatus(record)} /></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">Version</dt><dd className="mt-1 text-slate-200">v{record.version}</dd></div><div><dt className="text-slate-500">Updated by</dt><dd className="mt-1 truncate text-slate-200">{record.attribution.updatedBy}</dd></div></dl><Link href={`${baseHref}/${record.id}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-blue-200 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Open content <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></li>)}</ul>
    </Card>
  );
}

export function CmsRevisionHistory({ revisions }: { revisions: CmsRevision[] }) {
  return (
    <Card>
      <CardHeader><CardTitle as="h2">Revision history</CardTitle><CardDescription>Security-significant content changes recorded atomically by PostgreSQL.</CardDescription></CardHeader>
      <CardContent>
        {revisions.length ? <ol className="space-y-3">{revisions.map((revision) => <li key={revision.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-slate-100">{revision.action.toLowerCase().replace("_", " ")}</p><time dateTime={revision.createdAt} className="inline-flex items-center gap-1.5 text-xs text-slate-500"><Clock3 aria-hidden="true" className="h-3.5 w-3.5" />{formatDate(revision.createdAt)}</time></div><p className="mt-2 text-sm text-slate-400">By {revision.actorName}</p></li>)}</ol> : <p className="text-sm text-slate-400">No revisions have been recorded for this content.</p>}
      </CardContent>
    </Card>
  );
}
