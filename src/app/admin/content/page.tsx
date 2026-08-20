import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CircleDollarSign, FileText, Wrench } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card";
import { getCmsOverview } from "../../../server/cms/admin";
import { canEditContent, requireContentViewer } from "../../../server/cms/guards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Content | Admin CMS", robots: { index: false, follow: false } };

export default async function AdminContentOverviewPage() {
  const context = await requireContentViewer("/admin/content");
  const editable = canEditContent(context);
  let overview: Awaited<ReturnType<typeof getCmsOverview>> | null = null;
  try { overview = await getCmsOverview(context); } catch { overview = null; }
  const modules = overview ? [
    { title: "Pages", href: "/admin/content/pages", icon: FileText, total: overview.pages.total, metrics: `${overview.pages.draft} draft · ${overview.pages.published} published · ${overview.pages.archived} archived` },
    { title: "Blog", href: "/admin/blog", icon: BookOpen, total: overview.posts.total, metrics: `${overview.posts.draft} draft · ${overview.posts.published} published · ${overview.posts.archived} archived` },
    { title: "Services", href: "/admin/services", icon: Wrench, total: overview.services.total, metrics: `${overview.services.active} active · ${overview.services.inactive} inactive` },
    { title: "Pricing", href: "/admin/pricing", icon: CircleDollarSign, total: overview.pricingPlans.total, metrics: `${overview.pricingPlans.active} active · ${overview.pricingPlans.inactive} inactive` },
  ] : [];

  return <div className="space-y-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">Content management</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">CMS overview</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">Manage public pages, articles, services, and informational pricing through role-aware PostgreSQL workflows.</p></div><Badge variant={editable ? "success" : "outline"}>{editable ? "Editor access" : "Viewer · read only"}</Badge></header>{overview ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{modules.map((module) => { const Icon = module.icon; return <Card key={module.href} className="h-full"><CardHeader><span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300"><Icon aria-hidden="true" className="h-5 w-5" /></span><CardTitle>{module.title}</CardTitle><CardDescription>Real database count</CardDescription></CardHeader><CardContent><p className="text-3xl font-bold text-white">{module.total}</p><p className="mt-2 text-sm leading-6 text-slate-400">{module.metrics}</p><Link href={module.href} className="mt-5 inline-flex min-h-10 items-center rounded-lg text-sm font-semibold text-blue-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Open {module.title}</Link></CardContent></Card>; })}</div> : <Card><CardContent className="p-6"><p role="alert" className="text-sm leading-6 text-amber-100">CMS counts are unavailable. Apply the CMS migration and verify the Preview Supabase environment before editing.</p></CardContent></Card>}</div>;
}
