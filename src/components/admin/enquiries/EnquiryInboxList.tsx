import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "../../ui/Badge";
import type { EnquiryListParams } from "../../../server/enquiries/schema";
import type { Enquiry, EnquiryList, EnquiryStatus } from "../../../server/enquiries/types";

export const enquiryStatusLabel: Record<EnquiryStatus, string> = {
  new: "New",
  in_progress: "In progress",
  waiting: "Waiting",
  resolved: "Resolved",
  closed: "Closed",
};

function statusVariant(status: EnquiryStatus): "default" | "success" | "warning" {
  if (status === "closed" || status === "resolved") return "success";
  return status === "waiting" ? "warning" : "default";
}

function dateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? "Unavailable"
    : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function preview(value: string): string {
  return value.length > 120 ? `${value.slice(0, 117)}…` : value;
}

function pageHref(params: EnquiryListParams, page: number): string {
  const query = new URLSearchParams();
  if (params.query) query.set("q", params.query);
  if (params.status !== "all") query.set("status", params.status);
  if (params.priority !== "all") query.set("priority", params.priority);
  if (params.assignee !== "all") query.set("assignee", params.assignee);
  if (params.sort !== "newest") query.set("sort", params.sort);
  query.set("page", String(page));
  return `/admin/enquiries?${query.toString()}`;
}

function MobileCard({ enquiry }: { enquiry: Enquiry }) {
  return (
    <li className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="font-mono text-xs text-blue-300">{enquiry.referenceCode}</p><h3 className="mt-1 font-semibold text-white">{enquiry.fullName}</h3></div>
        <Badge variant={statusVariant(enquiry.status)}><span className="sr-only">Status: </span>{enquiryStatusLabel[enquiry.status]}</Badge>
      </div>
      <p className="mt-2 break-all text-sm text-slate-400">{enquiry.workEmail}<br />{enquiry.companyName}</p>
      <p className="mt-3 text-sm leading-6 text-slate-300">{preview(enquiry.message)}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div><dt className="text-slate-500">Priority</dt><dd className="mt-1 capitalize text-slate-200">{enquiry.priority}</dd></div>
        <div><dt className="text-slate-500">Assignee</dt><dd className="mt-1 text-slate-200">{enquiry.assigneeName ?? "Unassigned"}</dd></div>
        <div className="col-span-2"><dt className="text-slate-500">Received</dt><dd className="mt-1 text-slate-200">{dateTime(enquiry.createdAt)}</dd></div>
      </dl>
      {enquiry.notificationStatus === "failed" ? <Badge variant="destructive" className="mt-3">Email notification failed</Badge> : null}
      <Link href={`/admin/enquiries/${enquiry.id}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-blue-200 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Open enquiry <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
    </li>
  );
}

export function EnquiryInboxList({ result, params }: { result: EnquiryList; params: EnquiryListParams }) {
  if (!result.enquiries.length) {
    const filtered = Boolean(params.query || params.status !== "all" || params.priority !== "all" || params.assignee !== "all");
    return <div className="p-8 text-center"><h3 className="text-lg font-semibold text-white">{filtered ? "No matching enquiries" : "No enquiries yet"}</h3><p className="mt-2 text-sm text-slate-400">{filtered ? "Try a different search or filter." : "Accepted contact submissions will appear here."}</p></div>;
  }

  return <>
    <div className="hidden overflow-x-auto lg:block">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Persisted contact enquiries</caption>
        <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3" scope="col">Contact</th><th className="px-4 py-3" scope="col">Preview</th><th className="px-4 py-3" scope="col">Status</th><th className="px-4 py-3" scope="col">Priority</th><th className="px-4 py-3" scope="col">Assignee</th><th className="px-4 py-3" scope="col">Received</th><th className="px-4 py-3 text-right" scope="col">Action</th></tr></thead>
        <tbody>{result.enquiries.map((enquiry) => <tr key={enquiry.id} className="border-t border-slate-800 align-top">
          <td className="px-4 py-4"><p className="font-mono text-xs text-blue-300">{enquiry.referenceCode}</p><p className="mt-1 font-semibold text-white">{enquiry.fullName}</p><p className="mt-1 max-w-56 break-all text-xs text-slate-400">{enquiry.workEmail}<br />{enquiry.companyName}</p></td>
          <td className="max-w-xs px-4 py-4 leading-6 text-slate-300">{preview(enquiry.message)}</td>
          <td className="px-4 py-4"><Badge variant={statusVariant(enquiry.status)}>{enquiryStatusLabel[enquiry.status]}</Badge></td>
          <td className="px-4 py-4 capitalize text-slate-300">{enquiry.priority}</td>
          <td className="px-4 py-4 text-slate-300">{enquiry.assigneeName ?? "Unassigned"}</td>
          <td className="px-4 py-4 text-slate-300">{dateTime(enquiry.createdAt)}{enquiry.notificationStatus === "failed" ? <Badge variant="destructive" className="mt-2">Email notification failed</Badge> : null}</td>
          <td className="px-4 py-4 text-right"><Link href={`/admin/enquiries/${enquiry.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 font-semibold text-blue-200 hover:bg-blue-500/10">Open <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></td>
        </tr>)}</tbody>
      </table>
    </div>
    <ul className="grid gap-3 p-4 lg:hidden">{result.enquiries.map((enquiry) => <MobileCard key={enquiry.id} enquiry={enquiry} />)}</ul>
    <nav aria-label="Enquiry pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 px-4 py-4">
      <p className="text-sm text-slate-400">Page {result.page} of {result.pageCount}</p>
      <div className="flex gap-2">
        {result.page > 1 ? <Link href={pageHref(params, result.page - 1)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200"><ChevronLeft aria-hidden="true" className="h-4 w-4" />Previous</Link> : <span aria-disabled="true" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-600"><ChevronLeft aria-hidden="true" className="h-4 w-4" />Previous</span>}
        {result.page < result.pageCount ? <Link href={pageHref(params, result.page + 1)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200">Next<ChevronRight aria-hidden="true" className="h-4 w-4" /></Link> : <span aria-disabled="true" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-600">Next<ChevronRight aria-hidden="true" className="h-4 w-4" /></span>}
      </div>
    </nav>
  </>;
}
