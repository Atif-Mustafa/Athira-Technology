import type { Metadata } from "next";
import { Inbox, Search } from "lucide-react";
import { EnquiryInboxList, enquiryStatusLabel } from "../../../components/admin/enquiries/EnquiryInboxList";
import { Badge } from "../../../components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card";
import { getEnquiryCounts, listAssignableStaff, listEnquiries } from "../../../server/enquiries/data";
import { requireEnquiryViewer } from "../../../server/enquiries/guards";
import { parseEnquiryListParams } from "../../../server/enquiries/schema";
import type { EnquiryCounts, EnquiryList } from "../../../server/enquiries/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Enquiries | Admin",
  description: "Review and manage durable contact enquiries.",
  robots: { index: false, follow: false, nocache: true },
};

const emptyCounts: EnquiryCounts = { new: 0, open: 0, unassigned: 0, notificationFailures: 0 };

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const context = await requireEnquiryViewer("/admin/enquiries");
  const params = parseEnquiryListParams(await searchParams);
  let result: EnquiryList | null = null;
  let counts = emptyCounts;
  let staff: Awaited<ReturnType<typeof listAssignableStaff>> = [];
  let unavailable = false;
  try {
    [result, counts, staff] = await Promise.all([
      listEnquiries(context, params), getEnquiryCounts(context), listAssignableStaff(context),
    ]);
  } catch {
    unavailable = true;
  }

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">Contact operations</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Enquiry inbox</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">Review persisted website enquiries, coordinate ownership, and keep workflow changes auditable.</p></div>
      <Badge variant="success"><Inbox aria-hidden="true" className="mr-2 h-4 w-4" />Implemented module</Badge>
    </header>

    <section aria-labelledby="enquiry-counts-heading">
      <h2 id="enquiry-counts-heading" className="sr-only">Operational enquiry counts</h2>
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[["New", counts.new], ["Open", counts.open], ["Unassigned", counts.unassigned], ["Notification failures", counts.notificationFailures]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"><dt className="text-sm text-slate-400">{label}</dt><dd className="mt-2 text-2xl font-bold text-white">{value}</dd></div>)}
      </dl>
    </section>

    <Card aria-labelledby="enquiry-filters-heading">
      <CardHeader className="border-b border-slate-800"><CardTitle as="h2" id="enquiry-filters-heading">Filter enquiries</CardTitle><CardDescription>Search covers reference, contact name, email, and company only.</CardDescription></CardHeader>
      <CardContent className="pt-5">
        <form method="get" action="/admin/enquiries" role="search" className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="md:col-span-2 xl:col-span-2"><label htmlFor="enquiry-search" className="text-sm font-medium text-slate-200">Search</label><div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-5 h-4 w-4 text-slate-500" /><input id="enquiry-search" name="q" type="search" defaultValue={params.query} maxLength={100} className="mt-2 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white" placeholder="Reference, name, email, company" /></div></div>
          <div><label htmlFor="status-filter" className="text-sm font-medium text-slate-200">Status</label><select id="status-filter" name="status" defaultValue={params.status} className="mt-2 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white"><option value="all">All statuses</option>{Object.entries(enquiryStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          <div><label htmlFor="priority-filter" className="text-sm font-medium text-slate-200">Priority</label><select id="priority-filter" name="priority" defaultValue={params.priority} className="mt-2 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white"><option value="all">All priorities</option><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></div>
          <div><label htmlFor="assignee-filter" className="text-sm font-medium text-slate-200">Assignee</label><select id="assignee-filter" name="assignee" defaultValue={params.assignee} className="mt-2 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white"><option value="all">All assignees</option><option value="unassigned">Unassigned</option>{staff.map((person) => <option key={person.userId} value={person.userId}>{person.displayName}</option>)}</select></div>
          <div><label htmlFor="sort-filter" className="text-sm font-medium text-slate-200">Sort</label><select id="sort-filter" name="sort" defaultValue={params.sort} className="mt-2 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div>
          <button type="submit" className="min-h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500 md:col-span-2 xl:col-span-6">Apply filters</button>
        </form>
      </CardContent>
    </Card>

    <Card aria-labelledby="enquiry-list-heading">
      <CardHeader className="border-b border-slate-800"><CardTitle as="h2" id="enquiry-list-heading">Enquiries</CardTitle><CardDescription>{result ? `${result.total} matching enquiries` : "Durable contact submissions"}</CardDescription></CardHeader>
      {unavailable || !result ? <div role="alert" className="m-5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-100">The enquiry database is unavailable. Confirm the migration, RLS grants, and Supabase environment before retrying.</div> : <EnquiryInboxList result={result} params={params} />}
    </Card>
  </div>;
}
