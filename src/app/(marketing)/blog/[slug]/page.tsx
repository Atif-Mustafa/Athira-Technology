import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import type { Metadata } from "next";
import { SafeMarkdown } from "../../../../components/content/SafeMarkdown";
import { Breadcrumbs } from "../../../../components/marketing/Breadcrumbs";
import { CallToAction } from "../../../../components/marketing/CallToAction";
import { Container, Section } from "../../../../components/marketing/Section";
import { StructuredData } from "../../../../components/seo/StructuredData";
import { getPublishedPostBySlug, listPublishedPosts } from "../../../../server/cms/public";
import { articleStructuredData, breadcrumbStructuredData, createMetadata } from "../../../../lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedPostBySlug(slug);

  if (!article) return { title: "Article Not Found", robots: { index: false, follow: false } };

  return createMetadata({ title: article.seoTitle ?? article.title, description: article.seoDescription ?? article.excerpt, path: `/blog/${article.slug}`, type: "article" });
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(date));
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublishedPostBySlug(slug);

  if (!article) notFound();

  const related = (await listPublishedPosts()).filter((item) => item.id !== article.id).slice(0, 2);
  const breadcrumbItems = [{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: article.title, path: `/blog/${article.slug}` }];

  return (
    <>
      <StructuredData data={[articleStructuredData(article), breadcrumbStructuredData(breadcrumbItems)]} />
      <article>
        <header className="border-b border-slate-800/70 py-16 sm:py-24">
          <Container className="max-w-4xl">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: article.title }]} />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">{article.category}</p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">{article.title}</h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">{article.excerpt}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
              <span>{article.authorName}</span>
              <time dateTime={article.publishedAt ?? article.createdAt}>{formatDate(article.publishedAt ?? article.createdAt)}</time>
              <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden="true" className="h-4 w-4" />{article.readingTime}</span>
            </div>
          </Container>
        </header>
        <Section>
          <Container className="max-w-3xl">
            <SafeMarkdown source={article.body} />
          </Container>
        </Section>
      </article>
      <Section tone="subtle" aria-labelledby="related-heading">
        <Container>
          <div className="flex items-center justify-between gap-4"><h2 id="related-heading" className="text-2xl font-bold text-white">Related articles</h2><Link href="/blog" className="inline-flex items-center text-sm font-semibold text-blue-300"><ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />All articles</Link></div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">{related.map((item) => <Link key={item.slug} href={`/blog/${item.slug}`} className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-6 hover:border-blue-500/50"><span className="text-sm font-semibold text-blue-400">{item.category}</span><h3 className="mt-3 text-lg font-semibold text-white group-hover:text-blue-300">{item.title}</h3><span className="mt-5 inline-flex items-center text-sm text-slate-400">Read next <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></span></Link>)}</div>
        </Container>
      </Section>
      <CallToAction title="Turn responsible workflow ideas into a practical assessment" primaryLabel="Discuss your delivery workflow" />
    </>
  );
}
