import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SafeMarkdown } from "../../../components/content/SafeMarkdown";
import { Breadcrumbs } from "../../../components/marketing/Breadcrumbs";
import { Container, Section } from "../../../components/marketing/Section";
import { StructuredData } from "../../../components/seo/StructuredData";
import { breadcrumbStructuredData, createMetadata } from "../../../lib/seo";
import { getPublishedPageBySlug } from "../../../server/cms/public";
import { normalizeCmsSlug, RESERVED_PAGE_SLUGS } from "../../../server/cms/schema";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (normalizeCmsSlug(slug) !== slug || RESERVED_PAGE_SLUGS.has(slug)) {
    return { title: "Page Not Found", robots: { index: false, follow: false } };
  }
  const page = await getPublishedPageBySlug(slug);
  if (!page) return { title: "Page Not Found", robots: { index: false, follow: false } };
  return createMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.summary,
    path: page.canonicalPath,
  });
}

export default async function CmsMarketingPage({ params }: Props) {
  const { slug } = await params;
  if (normalizeCmsSlug(slug) !== slug || RESERVED_PAGE_SLUGS.has(slug)) notFound();
  const page = await getPublishedPageBySlug(slug);
  if (!page) notFound();
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: page.title, path: page.canonicalPath }];

  return <><StructuredData data={breadcrumbStructuredData(breadcrumbs)} /><article><header className="border-b border-slate-800/70 py-16 sm:py-24"><Container className="max-w-4xl"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.title }]} /><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">Athira Technology</p><h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">{page.title}</h1>{page.summary ? <p className="mt-6 text-lg leading-8 text-slate-300">{page.summary}</p> : null}</Container></header><Section><Container className="max-w-3xl"><SafeMarkdown source={page.body} /></Container></Section></article></>;
}
