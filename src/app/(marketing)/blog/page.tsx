import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { CallToAction } from "../../../components/marketing/CallToAction";
import { PageHero } from "../../../components/marketing/PageHero";
import { Container, Section, SectionHeading } from "../../../components/marketing/Section";
import { StructuredData } from "../../../components/seo/StructuredData";
import { blogArticles } from "../../../content/blog";
import { breadcrumbStructuredData, createMetadata } from "../../../lib/seo";

export const metadata = createMetadata({
  title: "AI Software Engineering Blog",
  description: "Read practical Athira Technology articles about multi-agent SDLC workflows, human approval, traceability, and responsible AI-assisted delivery.",
  path: "/blog",
});

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export default function BlogPage() {
  return (
    <>
      <StructuredData data={breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])} />
      <PageHero
        eyebrow="Product education"
        title="Practical thinking for responsible AI-assisted software delivery"
        description="Explore architecture, governance, and operating-model concepts for teams evaluating AI across the SDLC—without invented research, customer stories, or performance claims."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />
      <Section aria-labelledby="articles-heading">
        <Container>
          <SectionHeading id="articles-heading" eyebrow="Latest articles" title="Build the operating model, not just the demo" description="The initial local-content foundation is typed and statically generated so it can migrate to a reviewed CMS in a future milestone." />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {blogArticles.map((article) => (
              <article key={article.slug} className="flex h-full flex-col rounded-3xl border border-slate-800 bg-slate-950/50 p-6">
                <p className="text-sm font-semibold text-blue-400">{article.category}</p>
                <h2 className="mt-4 text-2xl font-bold leading-tight text-white">
                  <Link href={`/blog/${article.slug}`} className="rounded-sm hover:text-blue-300">{article.title}</Link>
                </h2>
                <p className="mt-4 flex-1 leading-7 text-slate-400">{article.summary}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-800 pt-5 text-xs text-slate-400">
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                  <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden="true" className="h-3.5 w-3.5" />{article.readingTime}</span>
                </div>
                <Link href={`/blog/${article.slug}`} className="mt-5 inline-flex items-center rounded-sm text-sm font-semibold text-slate-200 hover:text-blue-300">
                  Read article <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </Section>
      <CallToAction title="Apply the ideas to your delivery workflow" description="A discovery conversation can turn governance and lifecycle concepts into a bounded assessment or pilot plan." primaryLabel="Discuss your workflow" secondaryLabel="Explore the product model" secondaryHref="/ai-software-engineer" />
    </>
  );
}
