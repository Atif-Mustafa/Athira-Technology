import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { AddNoteAction, AssignmentAction, EditNoteAction, PriorityAction, StatusAction } from "../../../../components/admin/enquiries/EnquiryActions";
import { enquiryStatusLabel } from "../../../../components/admin/enquiries/EnquiryInboxList";
import { Badge } from "../../../../components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/Card";
import { getEnquiryDetail, listAssignableStaff } from "../../../../server/enquiries/data";
import { canManageEnquiries, requireEnquiryViewer } from "../../../../server/enquiries/guards";
import { enquiryIdSchema } from "../../../../server/enquiries/schema";
import type { EnquiryAuditEvent } from "../../../../server/enquiries/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Enquiry detail | Admin", robots: { index: false, follow: false, nocache: true } };

function dateTime(value: string | null): string {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "Unavailable" : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

const auditLabels: Record<string, string> = {
  ENQUIRY_CREATED: "Enquiry received",
  STATUS_CHANGED: "Status changed",
  PRIORITY_CHANGED: "Priority changed",
  ASSIGNED: "Enquiry assigned",
  UNASSIGNED: "Enquiry unassigned",
  NOTE_ADDED: "Internal note added",
  NOTE_EDITED: "Internal note edited",
  ENQUIRY_CLOSED: "Enquiry closed",
  ENQUIRY_REOPENED: "Enquiry reopened",
  NOTIFICATION_SENT: "Email notification sent",
  NOTIFICATION_FAILED: "Email notification failed",
};

function auditDetail(event: EnquiryAuditEvent): string {
  const before = event.previousValue?.status ?? event.previousValue?.priority ?? event.previousValue?.notification_status;
  const after = event.newValue?.status ?? event.newValue?.priority ?? event.newValue?.notification_status;
  if (typeof before === "string" && typeof after === "string") return `${before.replaceAll("_", " ")} → ${after.replaceAll("_", " ")}`;
  if (typeof after === "string") return after.replaceAll("_", " ");
  return "Recorded in the immutable operational timeline.";
}

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!enquiryIdSchema.safeParse(id).success) notFound();
  const context = await requireEnquiryViewer(`/admin/enquiries/${id}`);
  let detail: Awaited<ReturnType<typeof getEnquiryDetail>> = null;
  let staff: Awaited<ReturnType<typeof listAssignableStaff>> = [];
  try {
    [detail, staff] = await Promise.all([getEnquiryDetail(context, id), listAssignableStaff(context)]);
  } catch {
    return <div role="alert" className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-5 text-amber-100">The enquiry could not be loaded safely. Confirm the migration and database access, then retry.</div>;
  }
  if (!detail) notFound();
  const { enquiry, notes, audit } = detail;
  const canManage = canManageEnquiries(context);

  return <div className="space-y-6">
    <Link href="/admin/enquiries" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back to enquiry inbox</Link>
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="font-mono text-sm text-blue-300">{enquiry.referenceCode}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{enquiry.fullName}</h1><p className="mt-2 text-sm text-slate-400">Received {dateTime(enquiry.createdAt)} · Version {enquiry.version}</p></div>
      <div className="flex flex-wrap gap-2"><Badge>{enquiryStatusLabel[enquiry.status]}</Badge><Badge variant="outline" className="capitalize">{enquiry.priority} priority</Badge>{enquiry.notificationStatus === "failed" ? <Badge variant="destructive">Email notification failed</Badge> : <Badge variant="success">Notification {enquiry.notificationStatus}</Badge>}</div>
    </header>

    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-6">
        <Card aria-labelledby="enquiry-message-heading"><CardHeader className="border-b border-slate-800"><CardTitle as="h2" id="enquiry-message-heading">Customer message</CardTitle><CardDescription>Untrusted visitor content rendered as escaped plain text.</CardDescription></CardHeader><CardContent className="pt-5"><p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">{enquiry.message}</p></CardContent></Card>
        <Card aria-labelledby="enquiry-notes-heading"><CardHeader className="border-b border-slate-800"><CardTitle as="h2" id="enquiry-notes-heading">Internal notes</CardTitle><CardDescription>Never customer-visible. Note bodies are not copied into audit JSON.</CardDescription></CardHeader><CardContent className="space-y-4 pt-5">{notes.length ? <ol className="space-y-3">{notes.map((note) => <li key={note.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-white">{note.authorName}</p><time className="text-xs text-slate-500" dateTime={note.createdAt}>{dateTime(note.createdAt)}{note.updatedAt !== note.createdAt ? " · Edited" : ""}</time></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">{note.body}</p>{canManage && note.authorUserId === context.user.id ? <EditNoteAction enquiryId={enquiry.id} version={enquiry.version} note={note} /> : null}</li>)}</ol> : <p className="text-sm text-slate-400">No internal notes yet.</p>}{canManage ? <div className="border-t border-slate-800 pt-5"><AddNoteAction enquiryId={enquiry.id} version={enquiry.version} /></div> : <p className="rounded-lg border border-slate-800 p-3 text-sm text-slate-400">Viewer access is read-only.</p>}</CardContent></Card>
        <Card aria-labelledby="enquiry-audit-heading"><CardHeader className="border-b border-slate-800"><CardTitle as="h2" id="enquiry-audit-heading">Activity timeline</CardTitle><CardDescription>Database-side audit events in chronological order.</CardDescription></CardHeader><CardContent className="pt-5"><ol className="space-y-4">{audit.map((event) => <li key={event.id} className="relative border-l border-slate-700 pl-4"><div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-blue-400" aria-hidden="true" /><p className="text-sm font-semibold text-white">{auditLabels[event.action] ?? "Enquiry updated"}</p><p className="mt-1 text-sm capitalize text-slate-400">{auditDetail(event)}</p><p className="mt-1 text-xs text-slate-500">{event.actorName} · <time dateTime={event.createdAt}>{dateTime(event.createdAt)}</time></p></li>)}</ol></CardContent></Card>
      </div>

      <aside className="space-y-6" aria-label="Enquiry details and controls">
        <Card><CardHeader className="border-b border-slate-800"><CardTitle as="h2">Contact and workflow</CardTitle></CardHeader><CardContent className="pt-5"><dl className="space-y-4 text-sm"><div><dt className="text-slate-500">Email</dt><dd className="mt-1 break-all text-slate-200"><a href={`mailto:${encodeURIComponent(enquiry.workEmail)}`} className="inline-flex items-center gap-2 text-blue-300"><Mail aria-hidden="true" className="h-4 w-4" />{enquiry.workEmail}</a></dd></div><div><dt className="text-slate-500">Company</dt><dd className="mt-1 text-slate-200">{enquiry.companyName}</dd></div><div><dt className="text-slate-500">Interest</dt><dd className="mt-1 text-slate-200">{enquiry.interest}</dd></div><div><dt className="text-slate-500">Project stage</dt><dd className="mt-1 text-slate-200">{enquiry.projectStage ?? "Not provided"}</dd></div><div><dt className="text-slate-500">Budget range</dt><dd className="mt-1 text-slate-200">{enquiry.budgetRange ?? "Not provided"}</dd></div><div><dt className="text-slate-500">Assignee</dt><dd className="mt-1 text-slate-200">{enquiry.assigneeName ?? "Unassigned"}</dd></div><div><dt className="text-slate-500">Updated</dt><dd className="mt-1 text-slate-200">{dateTime(enquiry.updatedAt)}</dd></div><div><dt className="text-slate-500">First reviewed</dt><dd className="mt-1 text-slate-200">{dateTime(enquiry.firstReviewedAt)}</dd></div><div><dt className="text-slate-500">Closed</dt><dd className="mt-1 text-slate-200">{dateTime(enquiry.closedAt)}</dd></div></dl></CardContent></Card>
        {canManage ? <Card><CardHeader className="border-b border-slate-800"><CardTitle as="h2">Workflow controls</CardTitle><CardDescription>Every update re-checks your active role and the displayed version.</CardDescription></CardHeader><CardContent className="space-y-6 pt-5"><StatusAction enquiryId={enquiry.id} version={enquiry.version} status={enquiry.status} /><div className="border-t border-slate-800 pt-5"><PriorityAction enquiryId={enquiry.id} version={enquiry.version} priority={enquiry.priority} /></div><div className="border-t border-slate-800 pt-5"><AssignmentAction enquiryId={enquiry.id} version={enquiry.version} assignedTo={enquiry.assignedTo} staff={staff} /></div></CardContent></Card> : null}
      </aside>
    </div>
  </div>;
}
