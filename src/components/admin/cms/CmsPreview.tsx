import "server-only";

import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getCmsPage, getCmsPost } from "../../../server/cms/admin";
import { requireContentEditor } from "../../../server/cms/guards";
import { SafeMarkdown } from "../../content/SafeMarkdown";
import { Badge } from "../../ui/Badge";

export async function CmsPreview({ kind, id }: { kind: "page" | "post"; id: string }) {
  if (!z.string().uuid().safeParse(id).success) notFound();
  const returnTo = kind === "post" ? `/admin/preview/post/${id}` : `/admin/preview/page/${id}`;
  const context = await requireContentEditor(returnTo);
  const record = kind === "post" ? await getCmsPost(context, id) : await getCmsPage(context, id);
  if (!record) notFound();
  const back = kind === "post" ? `/admin/blog/${id}` : `/admin/content/pages/${id}`;
  const summary = record.kind === "post" ? record.excerpt : record.summary;

  return <div className="mx-auto w-full max-w-4xl space-y-6"><div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold text-amber-100">Authenticated draft preview</p><p className="mt-1 text-sm leading-6 text-amber-100/80">Private preview · noindex · version {record.version} · {record.status}</p></div><Badge variant="warning">Not public</Badge></div><Link href={back} className="mt-3 inline-flex text-sm font-semibold text-amber-100 underline underline-offset-4">Return to editor</Link></div><article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/60"><header className="border-b border-slate-800 p-6 sm:p-10"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">CMS preview</p><h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">{record.title}</h1><p className="mt-5 text-lg leading-8 text-slate-300">{summary}</p>{record.kind === "post" ? <p className="mt-5 text-sm text-slate-400">{record.authorName} · {record.category} · {record.readingTime}</p> : null}</header><div className="p-6 sm:p-10"><SafeMarkdown source={record.body} /></div></article></div>;
}
